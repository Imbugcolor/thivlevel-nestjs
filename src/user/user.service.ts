import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './user.schema';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { ConfigService } from '@nestjs/config';
import { SendmailService } from 'src/sendmail/sendmail.service';
import { AuthStrategy } from './enum/auth.strategy.enum';
import { OAuth2Client } from 'google-auth-library';
import { Response } from 'express';
import { GoogleLoginDto } from './dto/google-login.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyTokenDto } from './dto/verify-token.dto';
@Injectable()
export class UserService {
  private client = new OAuth2Client(
    `${process.env.GOOGLE_CLIENT_ID}`,
    `${process.env.GOOGLE_CLIENT_SECRET}`,
    'postmessage',
  );

  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private sendmailService: SendmailService,
    private cloudinaryService: CloudinaryService,
  ) {}

  async getUser(id: string): Promise<User> {
    const user = await this.userModel.findById(id);
    return user;
  }

  async register(registerDto: RegisterDto): Promise<{ message: string }> {
    const { username, email, password } = registerDto;

    const usernameExist = await this.userModel.findOne({ username });
    const emailExist = await this.userModel.findOne({ email });

    if (usernameExist) {
      throw new BadRequestException(`Tên tài khoản đã được sử dụng`);
    }

    if (emailExist) {
      throw new BadRequestException('Email đã được sử dụng');
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = { username, email, password: hashedPassword };

    const active_token = await this.getActiveToken(newUser);

    const url = `${this.configService.get(
      'BASE_URL',
    )}/auth/active/${active_token}`;

    this.sendmailService.sendMail(email, url, 'Verify your email address.');
    return { message: 'OK' };
  }

  async activeAccount(token: string) {
    const decoded = this.jwtService.verify(token, {
      secret: this.configService.get<string>('JWT_ACTIVE_TOKEN_SECRET'),
    });

    const { user } = decoded;

    if (!user) {
      throw new UnauthorizedException('Thông tin không chính xác.');
    }

    const newUser = new this.userModel(user);

    try {
      await newUser.save();
    } catch (error) {
      if (error.code === 11000) {
        //duplicate username
        throw new ConflictException('Email đã tồn tại.');
      } else {
        throw new InternalServerErrorException();
      }
    }
    return {
      message: 'Kích hoạt thành công.',
      user: new User(user),
    };
  }

  async logIn(loginDto: LoginDto, res: Response): Promise<User> {
    const { email, password } = loginDto;

    const user = await this.userModel.findOne({ email }).lean();

    if (user && user.authStrategy !== AuthStrategy.LOCAL) {
      throw new UnauthorizedException('Lỗi xác thực');
    }

    if (user && (await bcrypt.compare(password, user.password))) {
      const accessToken = await this.getAccessToken(user._id.toString());
      const refreshToken = await this.getRefreshToken(user._id.toString());

      res.cookie('refreshtoken', refreshToken, {
        httpOnly: true,
        path: `/`,
        secure: true,
        sameSite: 'none',
        maxAge: 7 * 24 * 60 * 60 * 1000, //7days
      });

      await this.updateRefreshToken(user._id.toString(), refreshToken);

      return new User({ ...user, accessToken });
    } else {
      throw new UnauthorizedException('Thông tin đăng nhập không chính xác');
    }
  }

  hashData(data: string) {
    return argon2.hash(data);
  }

  async updateRefreshToken(userId: string, refreshToken: string) {
    const hashedRefreshToken = await this.hashData(refreshToken);
    await this.userModel.findByIdAndUpdate(userId, {
      rf_token: hashedRefreshToken,
    });
  }

  async getActiveToken(user) {
    const activeToken = this.jwtService.sign(
      {
        user,
      },
      {
        secret: this.configService.get<string>('JWT_ACTIVE_TOKEN_SECRET'),
        expiresIn: '5m',
      },
    );

    return activeToken;
  }

  async getAccessToken(userId: string) {
    const accessToken = await this.jwtService.signAsync(
      {
        _id: userId,
      },
      {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: '15m',
      },
    );

    return accessToken;
  }

  async getRefreshToken(userId: string) {
    const refreshToken = await this.jwtService.signAsync(
      {
        _id: userId,
      },
      {
        secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
        expiresIn: '7d',
      },
    );

    return refreshToken;
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.userModel.findById(userId);
    if (!user || !user.rf_token) throw new ForbiddenException('Access Denied');
    const refreshTokenMatches = await argon2.verify(
      user.rf_token,
      refreshToken,
    );
    if (!refreshTokenMatches) throw new ForbiddenException('Access Denied');
    const accessToken = await this.getAccessToken(user._id.toString());
    return {
      accessToken,
    };
  }

  async googleLogin(googleLoginDto: GoogleLoginDto, res: Response) {
    const { tokens } = await this.client.getToken(googleLoginDto.code);

    const { id_token } = tokens;

    if (id_token) {
      const verify = await this.client.verifyIdToken({
        idToken: id_token,
        audience: `${this.configService.get('GOOGLE_CLIENT_ID')}`,
      });

      const { email, email_verified, name, picture } = verify.getPayload();

      if (!email_verified) {
        throw new BadRequestException('Email verification failed');
      }

      const user = await this.userModel.findOne({ email });

      if (user) {
        if (user && user.authStrategy !== AuthStrategy.GOOGLE) {
          throw new UnauthorizedException('Lỗi xác thực');
        }
        const accessToken = await this.getAccessToken(user._id.toString());
        const refreshToken = await this.getRefreshToken(user._id.toString());

        res.cookie('refreshtoken', refreshToken, {
          httpOnly: true,
          path: `/`,
          secure: true,
          sameSite: 'none',
          maxAge: 7 * 24 * 60 * 60 * 1000, //7days
        });

        await this.updateRefreshToken(user._id.toString(), refreshToken);

        return new User({ ...user, accessToken });
      } else {
        const password = this.configService.get('PASSWORD_USER_OAUTH');
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = new this.userModel({
          username: name,
          email,
          avatar: picture,
          password: hashedPassword,
          authStrategy: AuthStrategy.GOOGLE,
        });

        const accessToken = await this.getAccessToken(user._id.toString());
        const refreshToken = await this.getRefreshToken(user._id.toString());

        const hashedRefreshToken = await this.hashData(refreshToken);
        user.rf_token = hashedRefreshToken;

        await user.save();

        res.cookie('refreshtoken', refreshToken, {
          httpOnly: true,
          path: `/`,
          secure: true,
          sameSite: 'none',
          maxAge: 7 * 24 * 60 * 60 * 1000, //7days
        });

        return new User({ ...user, accessToken });
      }
    }
  }

  async getCurrentUser(userId: string) {
    const user = await this.userModel.findById(userId).lean();
    return new User(user);
  }

  async updatePhoto(user: User, file: Express.Multer.File) {
    try {
      const imageResponse = await this.cloudinaryService.uploadFile(file);
      const updatedPhoto = await this.userModel
        .findByIdAndUpdate(
          user._id,
          {
            avatar: imageResponse.url,
          },
          { new: true },
        )
        .lean();

      return new User(updatedPhoto);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();
    }
  }

  async updateProfile(user: User, updateDto: UpdateUserDto) {
    try {
      const updatedUser = await this.userModel
        .findByIdAndUpdate(user._id, updateDto, { new: true })
        .lean();

      return new User(updatedUser);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();
    }
  }

  async updatePassword(user: User, updatePasswordDto: UpdatePasswordDto) {
    const { old_password, new_password } = updatePasswordDto;

    const old_user = await this.userModel.findById(user._id);

    if (!(await bcrypt.compare(old_password, old_user.password))) {
      throw new BadRequestException('Mật khẩu cũ không chính xác');
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(new_password, salt);

    const updatedUser = await this.userModel
      .findByIdAndUpdate(user._id, { password: hashedPassword }, { new: true })
      .lean();

    return new User(updatedUser);
  }

  async forgotPassword(email: string) {
    const user = await this.userModel.findOne({ email }).lean();

    if (!user) {
      throw new NotFoundException('Email chưa được đăng ký trên hệ thống');
    }

    const secret =
      this.configService.get('RECOVERY_PASSWORD_SECRET') + user.password;
    const token = this.jwtService.sign(
      { email, id: user._id },
      {
        secret,
        expiresIn: '5m',
      },
    );
    const url = `${this.configService.get('URL_VERIFY_PASSWORD_RECOVERY')}?id=${
      user._id
    }&token=${token}`;

    const title = 'Verify your password recovery.';
    this.sendmailService.sendMail(email, url, title);

    return { message: 'Check your email to reset your password.' };
  }

  async verifyPasswordRecovery(verifyToken: VerifyTokenDto) {
    const { id, token } = verifyToken;

    const oldUser = await this.userModel.findById(id).lean();
    const secret =
      this.configService.get<string>('RECOVERY_PASSWORD_SECRET') +
      oldUser.password;
    try {
      this.jwtService.verify(token, {
        secret,
      });
      return { message: 'Verified' };
    } catch (err) {
      throw new InternalServerErrorException({ message: err.message });
    }
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { id, token, password } = resetPasswordDto;
    const oldUser = await this.userModel.findById(id).lean();

    const secret =
      this.configService.get<string>('RECOVERY_PASSWORD_SECRET') +
      oldUser.password;
    try {
      this.jwtService.verify(token, {
        secret,
      });

      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(password, salt);

      await this.userModel.findByIdAndUpdate(id, {
        password: hashedPassword,
      });

      return { message: 'Cập nhật mật khẩu thành công.' };
    } catch (err) {
      throw new InternalServerErrorException({ message: err.message });
    }
  }

  // githubLogin(req: Request, res) {
  //   if (!req.user) {
  //     return 'Not user auth';
  //   }
  //   return req.user;
  // }

  async signOut(userId: string, res) {
    res.clearCookie('refreshtoken', { path: `/` });

    const user = await this.userModel.findById(userId);

    user.rf_token = '';

    await user.save();

    return { message: 'Logged Out.' };
  }
}

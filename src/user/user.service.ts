import {
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
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
import { UserTypeLogin } from './enum/user-type-login.enum';
import { SendmailService } from 'src/sendmail/sendmail.service';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private sendmailService: SendmailService,
  ) {}

  async getUser(id: string): Promise<User> {
    const user = await this.userModel.findById(id);
    return user;
  }

  async register(registerDto: RegisterDto): Promise<{ msg: string }> {
    const { username, email, password } = registerDto;

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = { username, email, password: hashedPassword };

    const active_token = await this.getActiveToken(newUser);

    const url = `${this.configService.get(
      'BASE_URL',
    )}/user/active/${active_token}`;

    this.sendmailService.sendMail(email, url, 'Verify your email address.');
    return { msg: 'Success! Pls check your email.' };
  }

  async activeAccount(token: string) {
    const decoded = this.jwtService.verify(token, {
      secret: this.configService.get<string>('JWT_ACTIVE_TOKEN_SECRET'),
    });

    const { user } = decoded;

    if (!user) {
      throw new UnauthorizedException('Please check your credentials.');
    }

    const newUser = new this.userModel(user);

    try {
      await newUser.save();
    } catch (error) {
      if (error.code === 11000) {
        //duplicate username
        throw new ConflictException('email already exists.');
      } else {
        throw new InternalServerErrorException();
      }
    }
    return {
      msg: 'Account has been activated!',
      user,
    };
  }

  async logIn(loginDto: LoginDto, res: any): Promise<User> {
    const { email, password } = loginDto;

    const user = await this.userModel.findOne({ email }).lean();

    if (user && user.type === UserTypeLogin.LOGIN) {
      throw new UnauthorizedException(
        'This account has registed with other method.',
      );
    }

    if (user && (await bcrypt.compare(password, user.password))) {
      const accessToken = await this.getAccessToken(user._id.toString());
      const refreshToken = await this.getRefreshToken(user._id.toString());

      res.cookie('refreshtoken', refreshToken, {
        httpOnly: true,
        path: `/`,
        secure: true,
        sameSite: 'None',
        maxAge: 7 * 24 * 60 * 60 * 1000, //7days
      });

      await this.updateRefreshToken(user._id.toString(), refreshToken);

      return new User({ ...user, accessToken });
    } else {
      throw new UnauthorizedException('Please check your login credentials.');
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

  async googleLogin(req, res) {
    if (!req.user) {
      return { msg: 'No user from google' };
    }

    const user = await this.userModel.findOne({ email: req.user.email });

    if (user && user.type === UserTypeLogin.NORMAL) {
      return { msg: 'This account arealdy sign up without google' };
    }

    if (!user) {
      const { email, name, picture } = req.user;

      const password = this.configService.get('PASSWORD_USER_OAUTH');

      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(password, salt);

      const user = new this.userModel({
        username: name,
        email,
        avatar: picture,
        password: hashedPassword,
        type: UserTypeLogin.LOGIN,
      });

      try {
        await user.save();
      } catch (error) {
        if (error.code === 11000) {
          //duplicate username
          throw new ConflictException('email already exists.');
        } else {
          throw new InternalServerErrorException();
        }
      }

      const accessToken = await this.getAccessToken(user._id.toString());
      const refreshToken = await this.getRefreshToken(user._id.toString());

      res.cookie('refreshtoken', refreshToken, {
        httpOnly: true,
        path: `/`,
        secure: true,
        sameSite: 'None',
        maxAge: 7 * 24 * 60 * 60 * 1000, //7days
      });

      return {
        msg: 'Login Success!',
        user,
        accessToken,
      };
    }

    const accessToken = await this.getAccessToken(user._id.toString());
    const refreshToken = await this.getRefreshToken(user._id.toString());

    res.cookie('refreshtoken', refreshToken, {
      httpOnly: true,
      path: `/`,
      secure: true,
      sameSite: 'None',
      maxAge: 7 * 24 * 60 * 60 * 1000, //7days
    });

    return {
      msg: 'Login Success!',
      user,
      accessToken,
    };
  }

  async getCurrentUser(userId: string) {
    const user = await this.userModel.findById(userId).lean();
    return new User(user);
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

    return { msg: 'Logged Out.' };
  }
}

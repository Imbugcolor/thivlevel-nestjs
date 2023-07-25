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
import { UserTypeLogin } from './user-type-login.enum';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async getUser(id: string): Promise<User> {
    const user = await this.userModel.findById(id);
    return user;
  }

  async register(
    registerDto: RegisterDto,
  ): Promise<{ msg: string; user: User }> {
    const { username, email, password } = registerDto;

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new this.userModel({
      username,
      email,
      password: hashedPassword,
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
    return {
      msg: 'Register Success!',
      user: { ...user._doc, password: '' },
    };
  }

  async logIn(
    loginDto: LoginDto,
    res: any,
  ): Promise<{ msg: string; user: User; accessToken: string }> {
    const { email, password } = loginDto;

    const user = await this.userModel.findOne({ email });

    if (user && user.type === UserTypeLogin.LOGIN) {
      throw new UnauthorizedException(
        'This account has registed with other method.',
      );
    }

    if (user && (await bcrypt.compare(password, user.password))) {
      const accessToken = await this.getAccessToken(user._id.toString());
      const refreshToken = await this.getRefreshToken(user._id.toString());

      res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        path: `/user/refreshtoken`,
        maxAge: 7 * 24 * 60 * 60 * 1000, //7days
      });

      await this.updateRefreshToken(user._id.toString(), refreshToken);

      return {
        msg: 'Login Success!',
        user: { ...user._doc, password: '' },
        accessToken,
      };
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

      res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        path: `/user/refreshtoken`,
        maxAge: 7 * 24 * 60 * 60 * 1000, //7days
      });

      return {
        msg: 'Login Success!',
        user: { ...user._doc, password: '' },
        accessToken,
      };
    }

    const accessToken = await this.getAccessToken(user._id.toString());
    const refreshToken = await this.getRefreshToken(user._id.toString());

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      path: `/user/refreshtoken`,
      maxAge: 7 * 24 * 60 * 60 * 1000, //7days
    });

    return {
      msg: 'Login Success!',
      user: { ...user._doc, password: '' },
      accessToken,
    };
  }

  githubLogin(req, res) {
    if (!req.user) {
      return 'Not user auth';
    }
    return req.user;
  }

  async signOut(userId: string, res) {
    res.clearCookie('refresh_token', { path: `/user/refreshtoken` });

    const user = await this.userModel.findById(userId);

    user.rf_token = '';

    await user.save();

    return { msg: 'Logged Out.' };
  }
}

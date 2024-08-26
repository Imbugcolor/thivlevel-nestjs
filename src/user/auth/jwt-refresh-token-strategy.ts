import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from '../user.service';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';

@Injectable()
export class JwtRefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(configService: ConfigService, private userService: UserService) {
    super({
      secretOrKey: configService.get('JWT_REFRESH_TOKEN_SECRET'),
      ignoreExpiration: false,
      passReqToCallback: true,
      jwtFromRequest: ExtractJwt.fromExtractors([
        JwtRefreshTokenStrategy.extractJWTFromCookie,
      ]),
    });
  }

  private static extractJWTFromCookie(req: Request): string | null {
    if (req.cookies && req.cookies.refreshtoken) {
      return req.cookies.refreshtoken;
    }
    return null;
  }

  async validate(req: Request, payload: any) {
    if (!payload) {
      throw new BadRequestException('invalid jwt token');
    }
    if (req.cookies && req.cookies.refreshtoken) {
      return { ...payload, refreshToken: req.cookies.refreshtoken };
    }
  }
}

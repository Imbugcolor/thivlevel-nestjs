import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './user.schema';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './auth/jwt.strategy';
import { JwtRefreshTokenStrategy } from './auth/jwt-refresh-token-strategy';
import { GoogleStrategy } from './auth/google.strategy';
import { GithubStrategy } from './auth/github.strategy';
import { RolesGuard } from './auth/roles.guard';

@Module({
  imports: [
    ConfigModule,
    JwtModule.register({}),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  providers: [
    UserService,
    JwtStrategy,
    JwtRefreshTokenStrategy,
    GoogleStrategy,
    GithubStrategy,
  ],
  controllers: [UserController],
  exports: [
    UserService,
    JwtStrategy,
    JwtRefreshTokenStrategy,
    GoogleStrategy,
    GithubStrategy,
  ],
})
export class UserModule {}

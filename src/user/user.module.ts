import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './user.schema';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './auth/jwt.strategy';
import { JwtRefreshTokenStrategy } from './auth/jwt-refresh-token-strategy';
import { SendmailModule } from 'src/sendmail/sendmail.module';

@Module({
  imports: [
    ConfigModule,
    JwtModule.register({}),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    SendmailModule,
  ],
  providers: [UserService, JwtStrategy, JwtRefreshTokenStrategy],
  controllers: [UserController],
  exports: [UserService, JwtStrategy, JwtRefreshTokenStrategy],
})
export class UserModule {}

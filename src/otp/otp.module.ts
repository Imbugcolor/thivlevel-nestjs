import { Module } from '@nestjs/common';
import { OtpService } from './otp.service';
import { RedisModule } from 'src/redis/redis.module';
import { SendmailModule } from 'src/sendmail/sendmail.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule, RedisModule, SendmailModule],
  providers: [OtpService],
  exports: [OtpService],
})
export class OtpModule {}

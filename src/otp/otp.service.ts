import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from 'src/redis/redis.service';
import { SendmailService } from 'src/sendmail/sendmail.service';
import * as otpGenerator from 'otp-generator';
import * as bcrypt from 'bcrypt';

@Injectable()
export class OtpService {
  constructor(
    private configService: ConfigService,
    private mailService: SendmailService,
    private redisService: RedisService,
  ) {}

  async sendOtpMail(email: string) {
    try {
      const otp = otpGenerator.generate(6, {
        lowerCaseAlphabets: false,
        upperCaseAlphabets: false,
        specialChars: false,
      });

      const ttl = 5 * 60 * 1000; //5 Minutes in miliseconds
      const expires = Date.now() + ttl; //timestamp to 5 minutes in the future

      const salt = await bcrypt.genSalt();
      const hashOtp = await bcrypt.hash(otp, salt);

      const fullHash = `${hashOtp}-${expires}`;

      await this.redisService.setOtp(email, fullHash);

      this.mailService.sendVerifyMail(
        email,
        otp,
        'Activate your Thivlevel account, it will expire in 5 minutes.',
      );

      return otp;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async verifyOtpMail(email: string, otp: string) {
    try {
      const otpHash = await this.redisService.getOtp(email);

      if (!otpHash) {
        throw new BadRequestException('OTP verified failed.');
      }
      const [otpValue, expires] = otpHash.split('-');
      const now = Date.now();
      if (now > parseInt(expires)) {
        throw new BadRequestException('OTP has expired.');
      }
      if (await bcrypt.compare(otp, otpValue)) {
        await this.redisService.deleteOtp(email);
        return true;
      } else {
        return false;
      }
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}

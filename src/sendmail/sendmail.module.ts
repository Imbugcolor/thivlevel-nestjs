import { Module } from '@nestjs/common';
import { SendmailService } from './sendmail.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [SendmailService],
  exports: [SendmailService],
})
export class SendmailModule {}

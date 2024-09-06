import { Module } from '@nestjs/common';
import { PaypalService } from './paypal.service';
import { ConfigModule } from '@nestjs/config';
import { PaypalController } from './paypal.controller';

@Module({
  imports: [ConfigModule],
  providers: [PaypalService],
  exports: [PaypalService],
  controllers: [PaypalController],
})
export class PaypalModule {}

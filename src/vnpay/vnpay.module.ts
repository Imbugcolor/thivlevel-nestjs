import { forwardRef, Module } from '@nestjs/common';
import { VnpayController } from './vnpay.controller';
import { VnpayService } from './vnpay.service';
import { ConfigModule } from '@nestjs/config';
import { RedisModule } from 'src/redis/redis.module';
import { OrderModule } from 'src/order/order.module';

@Module({
  imports: [ConfigModule, RedisModule, forwardRef(() => OrderModule)],
  controllers: [VnpayController],
  providers: [VnpayService],
  exports: [VnpayService],
})
export class VnpayModule {}

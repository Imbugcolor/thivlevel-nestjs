import { forwardRef, Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema } from './order.schema';
import { ProductsModule } from 'src/products/products.module';
import { VariantModule } from 'src/variant/variant.module';
import { CartModule } from 'src/cart/cart.module';
import { UserModule } from 'src/user/user.module';
import { ConfigModule } from '@nestjs/config';
import { PaypalModule } from 'src/paypal/paypal.module';
import { RedisModule } from 'src/redis/redis.module';
import { EventsModule } from 'src/events/events.module';
import { VnpayModule } from 'src/vnpay/vnpay.module';
import { CurrencyModule } from 'src/currency/currency.module';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }]),
    ProductsModule,
    VariantModule,
    CartModule,
    UserModule,
    PaypalModule,
    forwardRef(() => VnpayModule),
    RedisModule,
    EventsModule,
    CurrencyModule,
    NotificationModule,
  ],
  providers: [OrderService],
  controllers: [OrderController],
  exports: [OrderService],
})
export class OrderModule {}

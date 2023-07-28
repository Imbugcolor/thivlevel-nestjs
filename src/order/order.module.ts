import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema } from './order.schema';
import { ProductsModule } from 'src/products/products.module';
import { VariantModule } from 'src/variant/variant.module';
import { CartModule } from 'src/cart/cart.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }]),
    ProductsModule,
    VariantModule,
    CartModule,
  ],
  providers: [OrderService],
  controllers: [OrderController],
})
export class OrderModule {}

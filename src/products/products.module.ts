import { Module, forwardRef } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from './products.schema';
import { VariantModule } from 'src/variant/variant.module';
import { Variant, VariantSchema } from 'src/variant/variant.schema';
import { UserModule } from 'src/user/user.module';
import { ReviewModule } from 'src/review/review.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: Variant.name, schema: VariantSchema },
    ]),
    VariantModule,
    UserModule,
    forwardRef(() => ReviewModule),
  ],
  providers: [ProductsService],
  controllers: [ProductsController],
  exports: [ProductsService],
})
export class ProductsModule {}

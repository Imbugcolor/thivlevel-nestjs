import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Category, CategorySchema } from './category.schema';
import { UserModule } from 'src/user/user.module';
import { Product, ProductSchema } from 'src/products/products.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Category.name, schema: CategorySchema },
      { name: Product.name, schema: ProductSchema },
    ]),
    UserModule,
  ],
  providers: [CategoryService],
  controllers: [CategoryController],
})
export class CategoryModule {}

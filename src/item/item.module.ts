import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Item, ItemSchema } from './item.schema';
import { ItemService } from './item.service';
import { Product, ProductSchema } from 'src/products/products.schema';
import { Variant, VariantSchema } from 'src/variant/variant.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Item.name, schema: ItemSchema },
      { name: Product.name, schema: ProductSchema },
      { name: Variant.name, schema: VariantSchema },
    ]),
  ],
  providers: [ItemService],
  exports: [ItemService],
})
export class ItemModule {}

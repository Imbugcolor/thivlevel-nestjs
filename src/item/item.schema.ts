import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { Product } from 'src/products/products.schema';
import { Variant } from 'src/variant/variant.schema';

@Schema({ timestamps: true })
export class Item extends Document {
  @Prop({ type: mongoose.Types.ObjectId, ref: Product.name, required: true })
  productId: Product;

  @Prop({ type: mongoose.Types.ObjectId, ref: Variant.name, required: true })
  variantId: Variant;

  @Prop({
    type: Number,
    required: true,
    min: [1, 'Quantity can not be less then 1.'],
  })
  quantity: number;

  @Prop({ type: Number, required: true })
  price: number;

  @Prop({ type: Number, required: true })
  total: number;
}

export const ItemSchema = SchemaFactory.createForClass(Item);

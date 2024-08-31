import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Category } from 'src/category/category.schema';
import { Review } from 'src/review/review.schema';
import { Variant } from 'src/variant/variant.schema';
import { ImageType } from './type/image.type';
import { Expose } from 'class-transformer';

@Schema({ timestamps: true })
export class Product {
  constructor(partial: Partial<Product>) {
    Object.assign(this, partial);
  }

  @Prop({ required: true, trim: true, unique: true })
  @Expose()
  product_sku: string;

  @Prop({ required: true, trim: true })
  @Expose()
  title: string;

  @Prop({ required: true })
  @Expose()
  description: string;

  @Prop({ required: true })
  @Expose()
  content: string;

  @Prop({ required: true })
  @Expose()
  price: number;

  @Prop({ required: true })
  @Expose()
  images: ImageType[];

  @Prop({
    type: mongoose.Types.ObjectId,
    ref: 'category',
    required: true,
  })
  @Expose()
  category: Category;

  @Prop({
    type: [
      { type: mongoose.Types.ObjectId, ref: Variant.name, required: true },
    ],
  })
  @Expose()
  variants: Variant[];

  @Prop({ default: 0 })
  @Expose()
  sold: number;

  @Prop({
    type: [{ type: mongoose.Types.ObjectId, ref: Review.name }],
    default: [],
  })
  @Expose()
  reviews: Review[];

  @Prop({ default: 0 })
  @Expose()
  rating: number;

  @Prop({ default: 0 })
  @Expose()
  numReviews: number;

  @Prop({ default: false })
  @Expose()
  isPublished: boolean;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

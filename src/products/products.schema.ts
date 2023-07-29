import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Category } from 'src/category/category.schema';
import { Review } from 'src/review/review.schema';
import { Variant } from 'src/variant/variant.schema';
import { ImageType } from './type/image.type';

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true, trim: true, unique: true })
  product_id: string;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  content: string;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  images: ImageType[];

  @Prop({
    type: mongoose.Types.ObjectId,
    ref: 'category',
    required: true,
  })
  category: Category;

  @Prop({
    type: [
      { type: mongoose.Types.ObjectId, ref: Variant.name, required: true },
    ],
  })
  variants: Variant[];

  @Prop({ default: 0 })
  sold: number;

  @Prop({
    type: [{ type: mongoose.Types.ObjectId, ref: Review.name }],
    default: [],
  })
  reviews: Review[];

  @Prop({ default: 0 })
  rating: number;

  @Prop({ default: 0 })
  numReviews: number;

  @Prop({ default: false })
  isPublished: boolean;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

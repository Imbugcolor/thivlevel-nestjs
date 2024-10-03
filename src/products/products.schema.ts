import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Types } from 'mongoose';
import { Category } from 'src/category/category.schema';
import { Review } from 'src/review/review.schema';
import { Variant } from 'src/variant/variant.schema';
import { ImageDto } from './type/image.dto';
import { Expose } from 'class-transformer';

@Schema({ timestamps: true })
export class Product {
  constructor(partial: Partial<Product>) {
    Object.assign(this, partial);
  }
  _id?: Types.ObjectId;

  @Prop({ required: true, trim: true, unique: true })
  @Expose()
  product_sku: string;

  @Prop({ required: true, trim: true })
  @Expose()
  title: string;

  @Prop({ required: true, default: 'New description' })
  @Expose()
  description: string;

  @Prop({ required: true, default: 'New content about product' })
  @Expose()
  content: string;

  @Prop({ required: true })
  @Expose()
  price: number;

  @Prop({ required: true })
  @Expose()
  images: ImageDto[];

  @Prop({
    type: mongoose.Types.ObjectId,
    ref: Category.name,
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

  @Prop({ default: true })
  @Expose()
  isPublished: boolean;

  @Prop({ default: false })
  @Expose()
  isDeleted: boolean;

  @Prop({ type: Date })
  @Expose()
  deletedAt: Date;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

ProductSchema.index({ title: 'text', product_sku: 'text' });

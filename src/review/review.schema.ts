import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Expose } from 'class-transformer';
import mongoose from 'mongoose';
import { User } from 'src/user/user.schema';
import { ObjectIdToString } from 'src/utils/custom.transform';

@Schema({ timestamps: true })
export class Review {
  constructor(partial: Partial<Review>) {
    Object.assign(this, partial);
  }

  @Expose()
  @ObjectIdToString()
  _id?: mongoose.Types.ObjectId;

  @Prop({ required: true })
  @Expose()
  rating: number;

  @Prop({ required: true })
  @Expose()
  comment: string;

  @Prop({
    type: mongoose.Types.ObjectId,
    ref: User.name,
    required: true,
  })
  @Expose()
  user: User;

  @Prop({ required: true })
  @Expose()
  productId: string;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { User } from 'src/user/user.schema';

@Schema({ timestamps: true })
export class Review {
  _id?: mongoose.Types.ObjectId;
  @Prop({ required: true })
  rating: number;

  @Prop({ required: true })
  comment: string;

  @Prop({
    type: [{ type: mongoose.Types.ObjectId, ref: User.name, required: true }],
  })
  user: User;

  @Prop({ required: true })
  productId: string;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);

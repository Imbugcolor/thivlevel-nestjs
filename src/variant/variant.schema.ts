import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

@Schema()
export class Variant extends Document {
  _id: mongoose.Types.ObjectId;

  @Prop({ require: true })
  size: string;

  @Prop({ require: true })
  color: string;

  @Prop({ require: true, default: 0 })
  inventory: number;

  @Prop({ type: { type: mongoose.Types.ObjectId, ref: 'product' } })
  productId: mongoose.Types.ObjectId;
}

export const VariantSchema = SchemaFactory.createForClass(Variant);

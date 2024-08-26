import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Expose } from 'class-transformer';
import mongoose from 'mongoose';

@Schema()
export class Variant {
  constructor(partial: Partial<Variant>) {
    Object.assign(this, partial);
  }

  @Expose()
  _id: mongoose.Types.ObjectId;

  @Prop({ require: true })
  @Expose()
  size: string;

  @Prop({ require: true })
  @Expose()
  color: string;

  @Prop({ require: true, default: 0 })
  @Expose()
  inventory: number;

  @Prop({ type: { type: mongoose.Types.ObjectId, ref: 'product' } })
  @Expose()
  productId: mongoose.Types.ObjectId;
}

export const VariantSchema = SchemaFactory.createForClass(Variant);

import { IsNotEmpty, IsNumber } from 'class-validator';
import mongoose from 'mongoose';

export class VariantType {
  _id?: string;

  @IsNotEmpty()
  size: string;

  @IsNotEmpty()
  color: string;

  @IsNumber()
  inventory: number;

  @IsNotEmpty()
  productId?: mongoose.Types.ObjectId;
}

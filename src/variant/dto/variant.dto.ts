import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import mongoose from 'mongoose';

export class VariantDto {
  @IsOptional()
  @IsNotEmpty()
  _id?: string;

  @IsNotEmpty()
  size: string;

  @IsNotEmpty()
  color: string;

  @IsNumber()
  inventory: number;

  @IsOptional()
  @IsNotEmpty()
  productId?: mongoose.Types.ObjectId;
}

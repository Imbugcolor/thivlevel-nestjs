import { IsNotEmpty, IsNumber } from 'class-validator';

export class VariantDto {
  @IsNotEmpty()
  size: string;

  @IsNotEmpty()
  color: string;

  @IsNumber()
  inventory: number;

  @IsNotEmpty()
  productId: string;
}

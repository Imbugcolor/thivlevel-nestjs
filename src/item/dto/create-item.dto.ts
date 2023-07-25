import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateItemDto {
  @IsString()
  @IsNotEmpty()
  productId: string;
  variantId: string;

  @IsNumber()
  @IsNotEmpty()
  quantity: number;
  price: number;
  total: number;
}

import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class AddCartDto {
  @IsString()
  @IsNotEmpty()
  productId: string;
  variantId: string;

  @IsNumber()
  @IsNotEmpty()
  quantity: number;
}

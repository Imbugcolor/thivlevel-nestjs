import { IsNotEmpty, IsNumber, MinLength } from 'class-validator';
import { VariantType } from 'src/variant/variant.type';

export class CreateProductDto {
  @IsNotEmpty()
  product_id: string;

  @IsNotEmpty()
  @MinLength(5)
  title: string;

  description: string;
  content: string;

  @IsNumber()
  price: number;

  @IsNotEmpty()
  images: [{ url: string; public_id: string }];

  @IsNotEmpty()
  category: string;

  @IsNotEmpty()
  variants: [VariantType];
}

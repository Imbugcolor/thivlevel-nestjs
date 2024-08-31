import { IsNotEmpty, IsNumber, MinLength } from 'class-validator';
import { VariantType } from 'src/variant/variant.type';
import { ImageType } from '../type/image.type';

export class UpdateProductDto {
  @IsNotEmpty()
  @MinLength(5)
  title: string;

  description: string;
  content: string;

  @IsNumber()
  price: number;

  @IsNotEmpty()
  images: ImageType[];

  @IsNotEmpty()
  category: string;

  @IsNotEmpty()
  variants: VariantType[];
}

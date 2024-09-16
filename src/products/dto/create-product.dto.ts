import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { ImageDto } from '../type/image.dto';
import { VariantDto } from 'src/variant/dto/variant.dto';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @IsNotEmpty()
  product_sku: string;

  @IsNotEmpty()
  @MinLength(5)
  title: string;

  @IsOptional()
  description: string;

  @IsOptional()
  content: string;

  @IsNumber()
  price: number;

  @IsNotEmpty()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => ImageDto)
  images: ImageDto[];

  @IsNotEmpty()
  category: string;

  @IsBoolean()
  isPublished: boolean;

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => VariantDto)
  variants: VariantDto[];
}

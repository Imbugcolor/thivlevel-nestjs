import { Transform } from 'class-transformer';
import { IsOptional } from 'class-validator';

export class ProductQueryDto {
  @IsOptional()
  limit: number;

  @IsOptional()
  page: number;

  @IsOptional()
  sort: string;

  @IsOptional()
  category: string;

  @IsOptional()
  search: string;

  // @IsOptional()
  // 'product_sku[regex]': string;

  @IsOptional()
  sizes: string;

  @IsOptional()
  'price[lt]': string;

  @IsOptional()
  'price[lte]': string;

  @IsOptional()
  'price[gt]': string;

  @IsOptional()
  'price[gte]': string;

  @IsOptional()
  @Transform(({ obj, key }) => {
    const value = obj[key];
    if (typeof value === 'string') {
      return obj[key] === 'true';
    }

    return value;
  })
  isPublished: boolean;
}

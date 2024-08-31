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
  'title[regex]': string;

  @IsOptional()
  'product_id[regex]': string;

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
}

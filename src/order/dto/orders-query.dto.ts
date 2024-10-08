import { IsOptional } from 'class-validator';

export class OrdersQueryDto {
  @IsOptional()
  limit: number;

  @IsOptional()
  page: number;

  @IsOptional()
  sort: string;

  @IsOptional()
  status: string;

  @IsOptional()
  search: string;
}

import { IsOptional } from 'class-validator';

export class ReviewQueryDto {
  @IsOptional()
  limit: number;

  @IsOptional()
  page: number;

  @IsOptional()
  sort: string;
}

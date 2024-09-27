import { IsOptional } from 'class-validator';

export class UserQueryDto {
  @IsOptional()
  limit: number;

  @IsOptional()
  page: number;

  @IsOptional()
  sort: string;

  @IsOptional()
  search: string;
}

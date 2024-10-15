import { IsOptional } from 'class-validator';

export class NotificationQueryDto {
  @IsOptional()
  limit: number;

  @IsOptional()
  page: number;

  @IsOptional()
  sort: string;
}

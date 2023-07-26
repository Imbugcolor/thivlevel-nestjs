import { IsNotEmpty, IsString } from 'class-validator';

export class DeleteItemDto {
  @IsString()
  @IsNotEmpty()
  cartId: string;
  itemId: string;
}

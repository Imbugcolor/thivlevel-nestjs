import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateCartDto {
  @IsNotEmpty()
  @IsString()
  cartId: string;
  itemId: string;
}

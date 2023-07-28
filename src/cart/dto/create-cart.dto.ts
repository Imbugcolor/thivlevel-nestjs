import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Item } from 'src/item/item.schema';
import { User } from 'src/user/user.schema';

export class CreateCartDto {
  @IsString()
  @IsNotEmpty()
  userId: User;

  @IsNotEmpty()
  items: Item[];

  @IsNumber()
  @IsNotEmpty()
  subTotal: number;
}

import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Types } from 'mongoose';
import { Item } from 'src/item/item.schema';

export class CreateCartDto {
  @IsString()
  @IsNotEmpty()
  userId: Types.ObjectId;

  @IsNotEmpty()
  items: Item[];

  @IsNumber()
  @IsNotEmpty()
  subTotal: number;
}

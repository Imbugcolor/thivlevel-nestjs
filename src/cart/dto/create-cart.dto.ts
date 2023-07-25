import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Document } from 'mongoose';
import { Item } from 'src/item/item.schema';

export class CreateCartDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsNotEmpty()
  items: Item[];

  @IsNumber()
  @IsNotEmpty()
  subTotal: number;
}

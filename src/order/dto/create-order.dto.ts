import { AddressType } from 'src/utils/address.type';
import {
  IsNotEmpty,
  IsNotEmptyObject,
  IsObject,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsObject()
  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => AddressType)
  address: AddressType;
}

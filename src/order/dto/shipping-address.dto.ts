import { Expose, Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNotEmptyObject,
  IsObject,
  IsString,
  ValidateNested,
} from 'class-validator';
import { AddressIdDto } from './address.dto';

export class AddressDto {
  @IsString()
  @IsNotEmpty()
  @Expose()
  detailAddress: string;

  @IsObject()
  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => AddressIdDto)
  @Expose()
  city: AddressIdDto;

  @IsObject()
  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => AddressIdDto)
  @Expose()
  district: AddressIdDto;

  @IsObject()
  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => AddressIdDto)
  @Expose()
  ward: AddressIdDto;
}

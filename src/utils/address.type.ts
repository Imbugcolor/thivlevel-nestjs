import { Expose } from 'class-transformer';

export class AddressType {
  @Expose()
  detailAddress: string;

  @Expose()
  city: { value: number; label: string };

  @Expose()
  district: { value: number; label: string };

  @Expose()
  ward: { value: number; label: string };
}

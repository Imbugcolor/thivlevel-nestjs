import { AddressType } from 'src/utils/address.type';
import { OrderItem } from '../type/orderItem.type';

export class CreateCodOrderDto {
  items: OrderItem[];
  name: string;
  phone: string;
  address: AddressType;
}

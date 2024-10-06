import { CreateOrderDto } from '../dto/create-order.dto';

export class TransactionDataType extends CreateOrderDto {
  userId: string;
  email: string;
}

export class PaypalTransactionDataType extends TransactionDataType {}
export class VnpayTransactionDataType extends TransactionDataType {}

import { IsNotEmpty, IsString } from 'class-validator';
import { CreateOrderDto } from './create-order.dto';

export class PaypalTransactionDto extends CreateOrderDto {
  @IsNotEmpty()
  @IsString()
  socketId: string;
}

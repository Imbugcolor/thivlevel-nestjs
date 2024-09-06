import { PaypalTransactionDto } from '../dto/paypaltransaction.dto';

interface PaypalTransactionData extends PaypalTransactionDto {
  userId: string;
  email: string;
}

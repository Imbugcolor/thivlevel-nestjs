import { Module } from '@nestjs/common';
import { OrderModule } from 'src/order/order.module';
import { StripeWebhookController } from './stripe-webhook.controller';

@Module({
  imports: [OrderModule],
  controllers: [StripeWebhookController],
})
export class StripeWebhookModule {}

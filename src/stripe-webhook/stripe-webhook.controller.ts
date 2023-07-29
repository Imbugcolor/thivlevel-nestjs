import {
  Controller,
  Post,
  Headers,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { Request } from 'express';
import { OrderService } from 'src/order/order.service';

@Controller('webhook')
export class StripeWebhookController {
  constructor(private readonly orderService: OrderService) {}
  @Post()
  webhook(@Headers('stripe-signature') signature: string, @Req() req: Request) {
    if (!signature) {
      throw new BadRequestException('Missing stripe-signature header');
    }
    return this.orderService.createWebhook(signature, req);
  }
}

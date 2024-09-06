import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { PaypalService } from './paypal.service';
import { AccessTokenGuard } from 'src/user/auth/accessToken.guard';

@Controller('paypal')
export class PaypalController {
  constructor(private paypalService: PaypalService) {}

  @Get('generate-token')
  @UseGuards(AccessTokenGuard)
  async generateToken() {
    return this.paypalService.generateClientToken();
  }

  @Post(':orderID/capture')
  async captureOrder(@Param('orderID') orderId: string) {
    return this.paypalService.captureOrder(orderId);
  }
}

import { Controller, Get, Query } from '@nestjs/common';
import { VnpayService } from './vnpay.service';

@Controller('vnpay')
export class VnpayController {
  constructor(private vnpayService: VnpayService) {}

  @Get('/vnpay_return')
  vnpayVerifyReturnUrl(@Query() query: any) {
    return this.vnpayService.vnpayVerifyReturnUrl(query);
  }

  @Get('/vnpay_ipn')
  vnpayVerifyIpn(@Query() query: any) {
    return this.vnpayService.vnpayVerifyIpn(query);
  }
}

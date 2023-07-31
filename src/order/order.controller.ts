import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { OrderService } from './order.service';
import { AccessTokenGuard } from 'src/user/auth/accessToken.guard';
import { GetUser } from 'src/user/auth/get-user.decorator';
import { User } from 'src/user/user.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { Order } from './order.schema';
@Controller('order')
export class OrderController {
  constructor(private orderService: OrderService) {}

  @Get()
  @UseGuards(AccessTokenGuard)
  getOrdersByUser(@GetUser() user: User): Promise<Order[]> {
    return this.orderService.getOrdersByUser(user);
  }

  @Post('/create-cod-order')
  @UseGuards(AccessTokenGuard)
  createCodOrder(
    @Body() createOrderDto: CreateOrderDto,
    @GetUser() user: User,
  ) {
    return this.orderService.createCodOrder(createOrderDto, user);
  }

  @Post('/create-checkout-session')
  @UseGuards(AccessTokenGuard)
  createCheckoutSession(
    @Body() createOrderDto: CreateOrderDto,
    @GetUser() user: User,
  ) {
    return this.orderService.createCheckout(createOrderDto, user);
  }
}

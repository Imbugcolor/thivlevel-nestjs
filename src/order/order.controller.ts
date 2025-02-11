import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { AccessTokenGuard } from 'src/user/auth/accessToken.guard';
import { GetUser } from 'src/user/auth/get-user.decorator';
import { User } from 'src/user/user.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { Request } from 'express';
import { RolesGuard } from 'src/user/auth/roles.guard';
import { Roles } from 'src/user/auth/roles.decorator';
import { Role } from 'src/user/enum/role.enum';
import { OrderStatus } from './enum/order-status.enum';
import { Order } from './order.schema';
import { PaypalTransactionDto } from './dto/paypaltransaction.dto';
import { OrdersQueryDto } from './dto/orders-query.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { VnpayCheckoutDto } from './dto/vnpay-checkout.dto';
@Controller('order')
export class OrderController {
  constructor(private orderService: OrderService) {}

  @Get('/all')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(Role.Admin)
  async getOrders(@Query() orderQuery: OrdersQueryDto) {
    return this.orderService.getOrders(orderQuery);
  }

  @Get('/detail/:id')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(Role.Admin)
  async getOrder(@Param('id') id: string) {
    return this.orderService.getOrder(id);
  }

  @Get('/my')
  @UseGuards(AccessTokenGuard)
  async getMyOrders(
    @GetUser() user: User,
    @Query() orderQuery: OrdersQueryDto,
  ) {
    return this.orderService.getMyOrders(user, orderQuery);
  }

  @Get('/my/:id')
  @UseGuards(AccessTokenGuard)
  async getMyOrder(
    @Param('id') id: string,
    @GetUser() user: User,
  ): Promise<Order> {
    return this.orderService.getMyOrder(id, user);
  }

  @Post('/create-cod-order')
  @UseGuards(AccessTokenGuard)
  async createCodOrder(
    @Body() createOrderDto: CreateOrderDto,
    @GetUser() user: User,
  ) {
    return this.orderService.createCodOrder(createOrderDto, user);
  }

  @Post('/create-stripe-checkout-session')
  @UseGuards(AccessTokenGuard)
  async createStripeCheckoutSession(
    @Body() createOrderDto: CreateOrderDto,
    @GetUser() user: User,
  ) {
    return this.orderService.createCheckout(createOrderDto, user);
  }

  @Patch('/cancel-order/:id')
  @UseGuards(AccessTokenGuard)
  async cancelOrder(@Param('id') id: string, @GetUser() user: User) {
    return this.orderService.cancelOrder(id, user);
  }

  @Post('/create-paypal-checkout-session')
  @UseGuards(AccessTokenGuard)
  async createPaypalCheckoutSession(
    @Body() paypalTransaction: PaypalTransactionDto,
    @GetUser() user: User,
  ) {
    return this.orderService.createPaypalTransaction(user, paypalTransaction);
  }

  @Post('/paypalwebhook')
  async paypalWebhook(@Req() req: Request) {
    return this.orderService.paypalWebhook(req);
  }

  @Post('/create-vnpay-checkout')
  @UseGuards(AccessTokenGuard)
  async createVnpayCheckout(
    @Req() req: Request,
    @Body() vnpayCheckoutDto: VnpayCheckoutDto,
    @GetUser() user: User,
  ) {
    return this.orderService.createVnpayCheckout(req, user, vnpayCheckoutDto);
  }

  @Patch('/refund-order/:id')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(Role.Admin)
  async refundOrder(@Param('id') id: string): Promise<Order> {
    return this.orderService.refundOrder(id);
  }

  // *ADMIN* //
  @Patch('/status/:id')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(Role.Admin)
  async updateOrderStatus(
    @Param('id') id: string,
    @Body('status')
    status: OrderStatus,
  ): Promise<Order> {
    return this.orderService.updateOrderStatus(id, status);
  }

  @Patch('/:id')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(Role.Admin)
  async updateOrder(
    @Param('id') id: string,
    @Body() updateOrder: UpdateOrderDto,
  ): Promise<Order> {
    return this.orderService.updateOrder(id, updateOrder);
  }

  @Get('/revenue/total')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(Role.Admin)
  async getTotalRevenue() {
    return this.orderService.getTotalRevenue();
  }
}

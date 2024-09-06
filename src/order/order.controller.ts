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
@Controller('order')
export class OrderController {
  constructor(private orderService: OrderService) {}

  @Get('/my')
  @UseGuards(AccessTokenGuard)
  async getMyOrders(
    @GetUser() user: User,
    @Query() orderQuery: OrdersQueryDto,
  ) {
    return this.orderService.getMyOrders(user, orderQuery);
  }

  @Get('/:id')
  @UseGuards(AccessTokenGuard)
  async getOrder(
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

  @Patch('/update-order-status/:id')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(Role.Admin)
  async updateOrderStatus(
    @Param('id') id: string,
    @Body('status')
    status: OrderStatus,
  ): Promise<Order> {
    return this.orderService.updateOrderStatus(id, status);
  }

  @Patch('/cancel-order/:id')
  @UseGuards(AccessTokenGuard)
  async cancelOrder(
    @Param('id') id: string,
    @GetUser() user: User,
  ): Promise<Order> {
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
    return this.orderService.paypalWebhookCompleteOrder(req);
  }
}

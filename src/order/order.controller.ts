import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { AccessTokenGuard } from 'src/user/auth/accessToken.guard';
import { GetUser } from 'src/user/auth/get-user.decorator';
import { User } from 'src/user/user.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { Request } from 'express';
import { OrdersDataResponse } from './type/ordersDataResponse.type';
import { RolesGuard } from 'src/user/auth/roles.guard';
import { Roles } from 'src/user/auth/roles.decorator';
import { Role } from 'src/user/enum/role.enum';
import { OrderStatus } from './enum/order-status.enum';
import { Order } from './order.schema';
@Controller('order')
export class OrderController {
  constructor(private orderService: OrderService) {}

  @Get()
  @UseGuards(AccessTokenGuard)
  getOrdersByUser(
    @GetUser() user: User,
    @Req() req: Request,
  ): Promise<OrdersDataResponse> {
    return this.orderService.getOrdersByUser(user, req);
  }

  @Get('/:id')
  @UseGuards(AccessTokenGuard)
  getOrderByUser(
    @Param('id') id: string,
    @GetUser() user: User,
  ): Promise<Order> {
    return this.orderService.getUserOrder(id, user);
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

  @Patch('/update-order-status/:id')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(Role.Admin)
  updateOrderStatus(
    @Param('id') id: string,
    @Body('status')
    status: OrderStatus,
  ): Promise<Order> {
    return this.orderService.updateOrderStatus(id, status);
  }

  @Patch('/cancel-order/:id')
  @UseGuards(AccessTokenGuard)
  cancelOrder(@Param('id') id: string, @GetUser() user: User): Promise<Order> {
    return this.orderService.cancelOrder(id, user);
  }
}

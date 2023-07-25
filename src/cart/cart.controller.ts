import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CartService } from './cart.service';
import { AccessTokenGuard } from 'src/user/auth/accessToken.guard';
import { GetUser } from 'src/user/auth/get-user.decorator';
import { JwtPayload } from 'src/user/auth/jwt-payload.interface';
import { AddCartDto } from './dto/add-cart.dto';
import { Cart } from './cart.schema';

@Controller('cart')
export class CartController {
  constructor(private cartService: CartService) {}

  @Get()
  @UseGuards(AccessTokenGuard)
  getCart(@GetUser() user: JwtPayload): Promise<Cart> {
    return this.cartService.getCart(user);
  }

  @Post()
  @UseGuards(AccessTokenGuard)
  addCart(
    @Body() addCartDto: AddCartDto,
    @GetUser() user: JwtPayload,
  ): Promise<Cart> {
    return this.cartService.addCart(addCartDto, user);
  }
}

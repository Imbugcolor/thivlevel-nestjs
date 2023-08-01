import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { CartService } from './cart.service';
import { AccessTokenGuard } from 'src/user/auth/accessToken.guard';
import { GetUser } from 'src/user/auth/get-user.decorator';
import { JwtPayload } from 'src/user/auth/interface/jwt-payload.interface';
import { AddCartDto } from './dto/add-cart.dto';
import { Cart } from './cart.schema';
import { UpdateCartDto } from './dto/update-cart.dto';
import { UpdateCartAction } from './enum/update-cart-action.enum';
import { DeleteItemDto } from './dto/delete-item-cart.dto';
import { User } from 'src/user/user.schema';

@Controller('cart')
export class CartController {
  constructor(private cartService: CartService) {}

  @Get()
  @UseGuards(AccessTokenGuard)
  getCart(@GetUser() user: User): Promise<Cart> {
    return this.cartService.getCart(user);
  }

  @Patch()
  @UseGuards(AccessTokenGuard)
  addCart(
    @Body() addCartDto: AddCartDto,
    @GetUser() user: User,
  ): Promise<Cart> {
    return this.cartService.addCart(addCartDto, user);
  }

  @Patch('increment')
  @UseGuards(AccessTokenGuard)
  increment(@Body() updateCartDto: UpdateCartDto): Promise<Cart> {
    return this.cartService.updateCart(
      updateCartDto,
      UpdateCartAction.INCREMENT,
    );
  }

  @Patch('decrement')
  @UseGuards(AccessTokenGuard)
  decrement(@Body() updateCartDto: UpdateCartDto): Promise<Cart> {
    return this.cartService.updateCart(
      updateCartDto,
      UpdateCartAction.DECREMENT,
    );
  }

  @Patch('delete-item')
  @UseGuards(AccessTokenGuard)
  deleteItem(@Body() deleteItemDto: DeleteItemDto): Promise<Cart> {
    return this.cartService.deleteItemCart(deleteItemDto);
  }

  @Patch('empty-cart')
  @UseGuards(AccessTokenGuard)
  emptyCart(@Body('cartId') cartId: string): Promise<Cart> {
    return this.cartService.emptyCart(cartId);
  }
}

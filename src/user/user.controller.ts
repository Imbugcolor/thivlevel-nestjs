import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  Post,
  Req,
  Res,
  SerializeOptions,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.schema';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenGuard } from './auth/refreshToken.guard';
import { Request, Response } from 'express';
import { AccessTokenGuard } from './auth/accessToken.guard';
import { GetUser } from './auth/get-user.decorator';

@Controller('user')
@SerializeOptions({
  strategy: 'excludeAll',
  excludeExtraneousValues: true,
  enableImplicitConversion: true,
})
export class UserController {
  constructor(private userService: UserService) {}

  @Post('/register')
  register(@Body() registerDto: RegisterDto): Promise<{ msg: string }> {
    return this.userService.register(registerDto);
  }

  @Get('/active/:token')
  activeAccount(@Param('token') token: string) {
    return this.userService.activeAccount(token);
  }

  @Post('/login')
  @UseInterceptors(ClassSerializerInterceptor)
  login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<User> {
    return this.userService.logIn(loginDto, res);
  }

  @UseGuards(RefreshTokenGuard)
  @Get('/refreshtoken')
  refreshTokens(@Req() req: Request) {
    const userId = req.user['_id'];
    const refreshToken = req.user['refreshToken'];
    return this.userService.refreshTokens(userId, refreshToken);
  }

  @UseGuards(AccessTokenGuard)
  @Get('/logout')
  signOut(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<any> {
    const userId = req.user['_id'];
    return this.userService.signOut(userId, res);
  }

  @Get('/current')
  @UseGuards(AccessTokenGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  getCurrentUser(@GetUser() user: User) {
    return this.userService.getCurrentUser(user._id.toString());
  }
  // @Get('/google-auth')
  // @UseGuards(AuthGuard('google'))
  // // eslint-disable-next-line @typescript-eslint/no-empty-function
  // async googleAuth(@Req() req) {}

  // @Get('/google-auth/redirect')
  // @UseGuards(AuthGuard('google'))
  // googleAuthRedirect(@Req() req, @Res({ passthrough: true }) res: Response) {
  //   return this.userService.googleLogin(req, res);
  // }

  // @Get('/github')
  // @UseGuards(AuthGuard('github'))
  // // eslint-disable-next-line @typescript-eslint/no-empty-function
  // async githubAuth(@Req() req) {}

  // @Get('/github/callback')
  // @UseGuards(AuthGuard('github'))
  // githubAuthRedirect(@Req() req, @Res({ passthrough: true }) res: Response) {
  //   return this.userService.githubLogin(req, res);
  // }
}

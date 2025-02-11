import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  SerializeOptions,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.schema';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenGuard } from './auth/refreshToken.guard';
import { Request, Response } from 'express';
import { AccessTokenGuard } from './auth/accessToken.guard';
import { GetUser } from './auth/get-user.decorator';
import { GoogleLoginDto } from './dto/google-login.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { VerifyTokenDto } from './dto/verify-token.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Roles } from './auth/roles.decorator';
import { Role } from './enum/role.enum';
import { UserQueryDto } from './dto/user-query.dto';
import { RolesGuard } from './auth/roles.guard';

@Controller('user')
@SerializeOptions({
  strategy: 'excludeAll',
  excludeExtraneousValues: true,
  enableImplicitConversion: true,
})
export class UserController {
  constructor(private userService: UserService) {}

  @Post('/register')
  register(@Body() registerDto: RegisterDto): Promise<{ message: string }> {
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

  @Post('/google-login')
  @UseInterceptors(ClassSerializerInterceptor)
  googleLogin(
    @Body() gooleLoginDto: GoogleLoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<User> {
    return this.userService.googleLogin(gooleLoginDto, res);
  }

  @Patch('/update')
  @UseGuards(AccessTokenGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  updateProfile(@GetUser() user: User, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.updateProfile(user, updateUserDto);
  }

  @Patch('/password')
  @UseGuards(AccessTokenGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  updatePassword(
    @GetUser() user: User,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ) {
    return this.userService.updatePassword(user, updatePasswordDto);
  }

  @Patch('/photo')
  @UseGuards(AccessTokenGuard)
  @UseInterceptors(FileInterceptor('file'))
  @UseInterceptors(ClassSerializerInterceptor)
  updatePhoto(
    @GetUser() user: User,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.userService.updatePhoto(user, file);
  }

  @Post('/forgotpassword')
  forgotPassword(@Body('email') email: string): Promise<{ message: string }> {
    return this.userService.forgotPassword(email);
  }

  @Get('/verify-password-recovery')
  verifyPasswordRecovery(@Query() verifyToken: VerifyTokenDto) {
    return this.userService.verifyPasswordRecovery(verifyToken);
  }

  @Patch('/reset-password')
  resetPassword(@Body() resetPassword: ResetPasswordDto) {
    return this.userService.resetPassword(resetPassword);
  }

  @Post('/admin/login')
  @UseInterceptors(ClassSerializerInterceptor)
  adminLogin(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<User> {
    return this.userService.adminLogIn(loginDto, res);
  }

  @Get('/list')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(Role.Admin)
  @UsePipes(new ValidationPipe({ transform: true }))
  @UseInterceptors(ClassSerializerInterceptor)
  getUsers(@Query() query: UserQueryDto) {
    return this.userService.getUsers(query);
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

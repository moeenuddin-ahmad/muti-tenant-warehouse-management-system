import { Controller, Post, Body, Req, Get, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import { RegistrationDto, LoginDto } from './dto/auth.dto';
import type { RequestWithUser } from 'src/common/interfaces/request.interface';
import { AuthGuard } from 'src/common/guards/auth.guard';

@Controller('users/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() createUserDto: RegistrationDto) {
    return this.authService.register(createUserDto);
  }

  @Post('login')
  login(@Body() loginUserDto: LoginDto) {
    return this.authService.login(loginUserDto);
  }

  @UseGuards(AuthGuard)
  @Get('me')
  me(@Req() req: RequestWithUser) {
    return this.authService.me(req.user.id);
  }

  @Post('forget-password')
  forgetPassword(@Body('email') email: string) {
    return this.authService.forgetPassword(email);
  }

  @Post('reset-password')
  resetPassword(
    @Body('token') token: string,
    @Body('password') password: string,
  ) {
    return this.authService.resetPassword(token, password);
  }

  @Post('refresh')
  refresh(
    @Body('accessToken') accessTokenDto: string,
    @Body('refreshToken') refreshTokenDto: string,
  ) {
    return this.authService.refresh(accessTokenDto, refreshTokenDto);
  }
}

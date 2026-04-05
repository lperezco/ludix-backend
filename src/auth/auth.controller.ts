import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  HttpCode,
  HttpStatus,
  Request,
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { UserLoginDto } from './dto/user-login.dto';

type AuthenticatedRequest = ExpressRequest & {
  user: {
    id: number;
    email: string;
    name: string;
    rolId: number;
    rol: string;
    permissions: string[];
  };
};

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: UserLoginDto) {
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
    );
    return this.authService.login(user);
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body()
    registerDto: {
      email: string;
      password: string;
      name: string;
      rolId?: number;
    },
  ) {
    return this.authService.register(registerDto);
  }

  @Get('verify')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  verify(@Request() req: AuthenticatedRequest) {
    return {
      valid: true,
      user: {
        id: req.user.id,
        email: req.user.email,
        name: req.user.name,
        rolId: req.user.rolId,
        rol: req.user.rol,
        permissions: req.user.permissions,
      },
    };
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  getProfile(@Request() req: AuthenticatedRequest) {
    return req.user;
  }

  @Post('change-password')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @Request() req: AuthenticatedRequest,
    @Body() body: { oldPassword: string; newPassword: string },
  ) {
    return this.authService.changePassword(
      req.user.id,
      body.oldPassword,
      body.newPassword,
    );
  }

  @Post('logout')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  logout() {
    return { message: 'Sesión cerrada correctamente' };
  }
}

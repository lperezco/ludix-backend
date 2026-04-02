import { 
  Controller, 
  Post, 
  Body, 
  Get, 
  UseGuards, 
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { Roles } from './roles.decorator';
import { RolesGuard } from './roles.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * Login de usuario
   * POST /auth/login
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: { email: string; password: string }) {
    const user = await this.authService.validateUser(loginDto.email, loginDto.password);
    return this.authService.login(user);
  }

  /**
   * Registro de nuevo usuario
   * POST /auth/register
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: {
    email: string;
    password: string;
    name: string;
    userTypeId?: number;
  }) {
    return this.authService.register(registerDto);
  }

  /**
   * Verificar token actual
   * GET /auth/verify
   */
  @Get('verify')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  async verify(@Request() req) {
    return { 
      valid: true, 
      user: {
        id: req.user.id,
        email: req.user.email,
        name: req.user.name,
        userTypeId: req.user.userTypeId,
        userType: req.user.userType,
      }
    };
  }

  /**
   * Obtener perfil del usuario autenticado
   * GET /auth/me
   */
  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  async getProfile(@Request() req) {
    return req.user;
  }

  /**
   * Cambiar contraseña
   * POST /auth/change-password
   */
  @Post('change-password')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @Request() req,
    @Body() body: { oldPassword: string; newPassword: string }
  ) {
    return this.authService.changePassword(req.user.id, body.oldPassword, body.newPassword);
  }

  /**
   * Logout (el cliente debe eliminar el token)
   * POST /auth/logout
   */
  @Post('logout')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  async logout() {
    return { message: 'Sesión cerrada correctamente' };
  }
}
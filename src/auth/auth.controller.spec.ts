import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    validateUser: jest.fn(),
    login: jest.fn(),
    register: jest.fn(),
    changePassword: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should call validateUser and login and return token', async () => {
      const loginDto = { email: 'test@test.com', password: '123456' };
      const mockUser = { id: 1, email: 'test@test.com' };
      const mockResponse = { access_token: 'fake-token' };

      mockAuthService.validateUser.mockResolvedValue(mockUser);
      mockAuthService.login.mockResolvedValue(mockResponse);

      const result = await controller.login(loginDto);

      expect(mockAuthService.validateUser).toHaveBeenCalledWith(loginDto.email, loginDto.password);
      expect(mockAuthService.login).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('register', () => {
    it('should call register and return token', async () => {
      const registerDto = { email: 'new@test.com', password: '123456', name: 'New User', rolId: 2 };
      const mockResponse = { access_token: 'fake-token' };

      mockAuthService.register.mockResolvedValue(mockResponse);

      const result = await controller.register(registerDto);

      expect(mockAuthService.register).toHaveBeenCalledWith(registerDto);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('verify', () => {
    it('should return valid true with user data', async () => {
      const req = { user: { id: 1, email: 'test@test.com', name: 'Test', rolId: 2, rol: 'user', permissions: [] } };
      const result = controller.verify(req);
      expect(result).toEqual({ valid: true, user: req.user });
    });
  });

  describe('getProfile', () => {
    it('should return user from request', () => {
      const req = { user: { id: 1, email: 'test@test.com', name: 'Test' } };
      const result = controller.getProfile(req);
      expect(result).toEqual(req.user);
    });
  });

  describe('changePassword', () => {
    it('should call changePassword service', async () => {
      const req = { user: { id: 1 } };
      const body = { oldPassword: 'old', newPassword: 'new' };
      const mockResponse = { message: 'Contraseña actualizada correctamente' };

      mockAuthService.changePassword.mockResolvedValue(mockResponse);

      const result = await controller.changePassword(req, body);

      expect(mockAuthService.changePassword).toHaveBeenCalledWith(1, 'old', 'new');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('logout', () => {
    it('should return logout message', () => {
      const result = controller.logout();
      expect(result).toEqual({ message: 'Sesión cerrada correctamente' });
    });
  });
});
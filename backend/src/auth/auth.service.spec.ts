import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, BadRequestException, NotFoundException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../usuarios/usuarios.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

const mockUsersService = {
  findByEmail: jest.fn(),
  create: jest.fn(),
  setResetToken: jest.fn(),
  findByResetTokenHash: jest.fn(),
  updatePassword: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn().mockReturnValue('mock_token'),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  describe('validateUser', () => {
    it('devuelve el usuario sin password si las credenciales son correctas', async () => {
      const hashed = await bcrypt.hash('secret', 10);
      mockUsersService.findByEmail.mockResolvedValue({
        id: 1, email: 'a@a.com', password: hashed, rol: 'USER',
      });

      const result = await service.validateUser('a@a.com', 'secret');
      expect(result).not.toBeNull();
      expect(result.password).toBeUndefined();
      expect(result.email).toBe('a@a.com');
    });

    it('devuelve null si la contraseña no coincide', async () => {
      const hashed = await bcrypt.hash('secret', 10);
      mockUsersService.findByEmail.mockResolvedValue({
        id: 1, email: 'a@a.com', password: hashed, rol: 'USER',
      });

      const result = await service.validateUser('a@a.com', 'wrong');
      expect(result).toBeNull();
    });

    it('devuelve null si el usuario no existe', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);
      const result = await service.validateUser('no@existe.com', 'pass');
      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('devuelve access_token y datos del usuario', async () => {
      const user = { id: 1, email: 'a@a.com', rol: 'USER' };
      const result = await service.login(user);
      expect(result.access_token).toBe('mock_token');
      expect(result.user).toEqual(user);
    });
  });

  describe('register', () => {
    it('lanza ConflictException si el email ya existe', async () => {
      mockUsersService.findByEmail.mockResolvedValue({ id: 1 });
      await expect(service.register({ email: 'a@a.com', password: '123' }))
        .rejects.toThrow(ConflictException);
    });

    it('crea el usuario y devuelve token si el email es nuevo', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);
      const newUser = { id: 2, email: 'nuevo@a.com', rol: 'USER' };
      mockUsersService.create.mockResolvedValue(newUser);

      const result = await service.register({ email: 'nuevo@a.com', password: 'pass123' });
      expect(result.access_token).toBe('mock_token');
      expect(mockUsersService.create).toHaveBeenCalled();
    });

    it('hashea la contraseña antes de guardar', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);
      mockUsersService.create.mockResolvedValue({ id: 2, email: 'nuevo@a.com', rol: 'USER' });

      await service.register({ email: 'nuevo@a.com', password: 'plaintext' });

      const savedData = mockUsersService.create.mock.calls[0][0];
      expect(savedData.password).not.toBe('plaintext');
      expect(await bcrypt.compare('plaintext', savedData.password)).toBe(true);
    });
  });

  describe('forgotPassword', () => {
    it('lanza NotFoundException si el email no está registrado', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);
      await expect(service.forgotPassword('noexiste@a.com'))
        .rejects.toThrow(NotFoundException);
    });

    it('guarda el token hash si el usuario existe', async () => {
      mockUsersService.findByEmail.mockResolvedValue({ id: 1, email: 'a@a.com' });
      mockUsersService.setResetToken.mockResolvedValue(undefined);

      await service.forgotPassword('a@a.com');
      expect(mockUsersService.setResetToken).toHaveBeenCalledWith(
        1,
        expect.any(String),
        expect.any(Date),
      );
    });
  });

  describe('resetPassword', () => {
    it('lanza BadRequestException si el token no existe', async () => {
      mockUsersService.findByResetTokenHash.mockResolvedValue(null);
      await expect(service.resetPassword('badtoken', 'newpass'))
        .rejects.toThrow(BadRequestException);
    });

    it('lanza BadRequestException si el token ha expirado', async () => {
      const expired = new Date(Date.now() - 1000);
      mockUsersService.findByResetTokenHash.mockResolvedValue({
        id: 1, resetPasswordExpires: expired,
      });
      await expect(service.resetPassword('expiredtoken', 'newpass'))
        .rejects.toThrow(BadRequestException);
    });

    it('actualiza la contraseña si el token es válido', async () => {
      const future = new Date(Date.now() + 60000);
      mockUsersService.findByResetTokenHash.mockResolvedValue({
        id: 1, resetPasswordExpires: future,
      });
      mockUsersService.updatePassword.mockResolvedValue(undefined);

      const result = await service.resetPassword('validtoken', 'newpass');
      expect(result.message).toMatch(/actualizada/i);
      expect(mockUsersService.updatePassword).toHaveBeenCalledWith(
        1, expect.any(String),
      );
    });
  });
});

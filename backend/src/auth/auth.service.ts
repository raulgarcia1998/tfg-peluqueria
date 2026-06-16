import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../usuarios/usuarios.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { User } from '../usuarios/entities/user.entity';

const RESET_TOKEN_TTL_MS = 15 * 60 * 1000; // 15 minutos

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && await bcrypt.compare(pass, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id, rol: user.rol };
    return {
      access_token: this.jwtService.sign(payload),
      user: user,
    };
  }

  async register(userData: any) {
    const existing = await this.usersService.findByEmail(userData.email);
    if (existing) throw new ConflictException('El email ya está registrado');

    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const user = await this.usersService.create({
      ...userData,
      password: hashedPassword,
    });

    return this.login(user);
  }

  /**
   * Genera un token de recuperación de un solo uso (expira en 15 min) y lo
   * "envía" al usuario. En desarrollo local no hay servidor de correo, así
   * que el enlace se imprime en la consola del backend.
   */
  async forgotPassword(email: string): Promise<{ message: string }> {
    const genericResponse = { message: 'Si el email existe, recibirás un enlace de recuperación.' };

    const user = await this.usersService.findByEmail(email);
    if (!user) {
      // No revelamos si el email existe o no (evita enumeración de usuarios)
      return genericResponse;
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expires = new Date(Date.now() + RESET_TOKEN_TTL_MS);

    await this.usersService.setResetToken(user.id, tokenHash, expires);

    const frontendUrl = process.env['FRONTEND_URL'] ?? 'http://localhost:4200';
    const resetLink = `${frontendUrl}/reset-password?token=${rawToken}`;

    // Simulación de envío de email (no hay proveedor SMTP configurado en local)
    console.log('========================================');
    console.log('📧 Simulación de email — Recuperación de contraseña');
    console.log(`Para: ${email}`);
    console.log(`Enlace (válido 15 min): ${resetLink}`);
    console.log('========================================');

    return genericResponse;
  }

  /** Valida el token de recuperación y establece la nueva contraseña */
  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const user = await this.usersService.findByResetTokenHash(tokenHash);

    if (!user || !user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
      throw new BadRequestException('El enlace de recuperación no es válido o ha expirado');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.usersService.updatePassword(user.id, hashedPassword);

    return { message: 'Contraseña actualizada correctamente' };
  }
}

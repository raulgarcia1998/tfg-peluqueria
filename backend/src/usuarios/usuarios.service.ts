import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(userData: Partial<User>): Promise<User> {
    const user = this.userRepository.create(userData);
    return this.userRepository.save(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
      select: ['id', 'email', 'password', 'rol', 'nombre', 'apellidos']
    });
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }

  /** Guarda el hash del token de recuperación y su caducidad para un usuario */
  async setResetToken(userId: number, tokenHash: string, expires: Date): Promise<void> {
    await this.userRepository.update(userId, {
      resetPasswordToken: tokenHash,
      resetPasswordExpires: expires,
    });
  }

  /** Busca un usuario por el hash del token de recuperación (incluye campos select:false) */
  async findByResetTokenHash(tokenHash: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { resetPasswordToken: tokenHash },
      select: ['id', 'email', 'resetPasswordToken', 'resetPasswordExpires'],
    });
  }

  /** Actualiza la contraseña (ya hasheada) y limpia el token de recuperación */
  async updatePassword(userId: number, hashedPassword: string): Promise<void> {
    await this.userRepository.update(userId, {
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null,
    });
  }
}

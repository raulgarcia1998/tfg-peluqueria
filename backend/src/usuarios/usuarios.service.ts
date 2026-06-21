import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
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

  /** Admin: actualiza rol (y otros campos permitidos) de un usuario */
  async update(id: number, data: { rol?: string }): Promise<User> {
    await this.userRepository.update(id, data);
    return this.findOne(id);
  }

  /** Actualiza los datos de perfil (nombre, apellidos, email, teléfono) de un usuario */
  async updatePerfil(
    id: number,
    data: { nombre?: string; apellidos?: string; email?: string; telefono?: string },
  ): Promise<User> {
    const user = await this.findOne(id); // lanza 404 si no existe

    // El email es único: comprobar que no lo use otro usuario
    if (data.email && data.email !== user.email) {
      const existente = await this.userRepository.findOne({ where: { email: data.email } });
      if (existente && existente.id !== id) {
        throw new ConflictException('Ya existe un usuario con ese correo electrónico');
      }
    }

    // Solo se permiten estos campos; el rol y la contraseña se gestionan aparte
    const permitido: Partial<User> = {};
    if (data.nombre    !== undefined) permitido.nombre    = data.nombre;
    if (data.apellidos !== undefined) permitido.apellidos = data.apellidos;
    if (data.email     !== undefined) permitido.email     = data.email;
    if (data.telefono  !== undefined) permitido.telefono  = data.telefono;

    await this.userRepository.update(id, permitido);
    return this.findOne(id);
  }

  /** Busca usuarios por nombre/apellidos/email/teléfono, opcionalmente filtrando por rol */
  async search(filters: { search?: string; rol?: string }): Promise<User[]> {
    const qb = this.userRepository.createQueryBuilder('u')
      .select(['u.id', 'u.nombre', 'u.apellidos', 'u.email', 'u.telefono', 'u.rol'])
      .orderBy('u.nombre', 'ASC')
      .limit(20);

    if (filters.rol) qb.andWhere('u.rol = :rol', { rol: filters.rol });
    if (filters.search) {
      qb.andWhere(
        '(u.nombre ILIKE :q OR u.apellidos ILIKE :q OR u.email ILIKE :q OR u.telefono ILIKE :q)',
        { q: `%${filters.search}%` }
      );
    }

    return qb.getMany();
  }
}

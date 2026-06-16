// CC-BY-SA 4.0 — TFG Peluquería
// Patrón Repository/DAO: abstrae el acceso a la BBDD

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { Cita, EstadoCita } from './entities/cita.entity';
import { CreateCitaDto } from './dto/create-cita.dto';

@Injectable()
export class CitasRepository {
  constructor(
    @InjectRepository(Cita)
    private readonly repo: Repository<Cita>
  ) {}

  async findAll(filters: {
    estado?: EstadoCita;
    fechaDesde?: string;
    fechaHasta?: string;
    search?: string;
    servicioId?: number;
  }): Promise<Cita[]> {
    const where: FindOptionsWhere<Cita> = {};

    if (filters.estado)    where.estado = filters.estado;
    if (filters.servicioId) where.servicioId = filters.servicioId;

    const qb = this.repo.createQueryBuilder('cita')
      .leftJoinAndSelect('cita.usuario', 'usuario')
      .leftJoinAndSelect('cita.empleado', 'empleado')
      .leftJoinAndSelect('cita.servicio', 'servicio')
      .orderBy('cita.fechaHora', 'DESC');

    if (filters.estado)     qb.andWhere('cita.estado = :estado', { estado: filters.estado });
    if (filters.servicioId) qb.andWhere('cita.servicioId = :sid', { sid: filters.servicioId });
    if (filters.fechaDesde) qb.andWhere('cita.fechaHora >= :desde', { desde: filters.fechaDesde });
    if (filters.fechaHasta) qb.andWhere('cita.fechaHora <= :hasta', { hasta: filters.fechaHasta });
    if (filters.search) {
      qb.andWhere(
        '(usuario.nombre ILIKE :s OR usuario.apellidos ILIKE :s OR empleado.nombre ILIKE :s)',
        { s: `%${filters.search}%` }
      );
    }

    return qb.getMany();
  }

  async findById(id: number): Promise<Cita | null> {
    return this.repo.findOne({
      where: { id },
      relations: ['usuario', 'empleado', 'servicio']
    });
  }

  async findByUsuario(usuarioId: number): Promise<Cita[]> {
    return this.repo.find({
      where: { usuarioId },
      relations: ['empleado', 'servicio'],
      order: { fechaHora: 'DESC' }
    });
  }

  async create(dto: CreateCitaDto, usuarioId: number): Promise<Cita> {
    const cita = this.repo.create({ ...dto, usuarioId });
    return this.repo.save(cita);
  }

  async update(id: number, data: Partial<Cita>): Promise<Cita> {
    await this.repo.update(id, data);
    return this.findById(id) as Promise<Cita>;
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }

  /** Comprueba conflictos de horario para un empleado */
  async hasConflict(
    empleadoId: number,
    fechaHora: Date,
    duracionMin: number,
    excludeId?: number
  ): Promise<boolean> {
    const fin = new Date(fechaHora.getTime() + duracionMin * 60 * 1000);
    const qb = this.repo.createQueryBuilder('c')
      .where('c.empleadoId = :eId', { eId: empleadoId })
      .andWhere("c.estado NOT IN ('CANCELADA', 'COMPLETADA')")
      .andWhere('c.fechaHora < :fin AND c.fechaHora > :inicio', {
        inicio: fechaHora,
        fin
      });

    if (excludeId) qb.andWhere('c.id != :id', { id: excludeId });

    return (await qb.getCount()) > 0;
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Servicio } from './entities/servicio.entity';

@Injectable()
export class ServiciosService {
  constructor(
    @InjectRepository(Servicio)
    private readonly servicioRepository: Repository<Servicio>,
  ) {}

  findAll() {
    return this.servicioRepository.find({ where: { activo: true } });
  }

  findOne(id: number) {
    const servicio = this.servicioRepository.findOne({ where: { id } });
    if (!servicio) throw new NotFoundException('Servicio no encontrado');
    return servicio;
  }

  create(data: Partial<Servicio>) {
    const servicio = this.servicioRepository.create(data);
    return this.servicioRepository.save(servicio);
  }

  async update(id: number, data: Partial<Servicio>) {
    await this.servicioRepository.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.servicioRepository.update(id, { activo: false });
  }
}

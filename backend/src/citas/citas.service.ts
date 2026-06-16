import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { CitasRepository } from './citas.repository';
import { CreateCitaDto } from './dto/create-cita.dto';
import { UpdateCitaDto } from './dto/update-cita.dto';
import { Cita, EstadoCita } from './entities/cita.entity';

@Injectable()
export class CitasService {
  constructor(private readonly citasRepository: CitasRepository) {}

  async findAll(query: any): Promise<Cita[]> {
    return this.citasRepository.findAll(query);
  }

  async findByUsuario(usuarioId: number): Promise<Cita[]> {
    return this.citasRepository.findByUsuario(usuarioId);
  }

  async findOne(id: number): Promise<Cita> {
    const cita = await this.citasRepository.findById(id);
    if (!cita) {
      throw new NotFoundException(`Cita con ID ${id} no encontrada`);
    }
    return cita;
  }

  async create(dto: CreateCitaDto, usuarioId: number): Promise<Cita> {
    // Comprobar conflicto de horario (ejemplo: duración fija de 30 min si no viene en el servicio)
    const hasConflict = await this.citasRepository.hasConflict(
      dto.empleadoId,
      new Date(dto.fechaHora),
      30
    );

    if (hasConflict) {
      throw new ConflictException('El empleado ya tiene una cita en ese horario');
    }

    return this.citasRepository.create(dto, usuarioId);
  }

  async update(id: number, dto: UpdateCitaDto, user: any): Promise<Cita> {
    const cita = await this.findOne(id);

    // Si no es ADMIN, solo puede editar sus propias citas
    if (user.rol !== 'ADMIN' && cita.usuarioId !== user.sub) {
      throw new ConflictException('No tienes permiso para modificar esta cita');
    }

    // Si cambia la fecha o el empleado, comprobar conflictos
    if (dto.fechaHora || dto.empleadoId) {
      const eId = dto.empleadoId || cita.empleadoId;
      const fH = dto.fechaHora ? new Date(dto.fechaHora) : cita.fechaHora;
      
      const hasConflict = await this.citasRepository.hasConflict(eId, fH, 30, id);
      if (hasConflict) {
        throw new ConflictException('Conflicto de horario con otra cita');
      }
    }

    const updateData: Partial<Cita> = { ...dto } as any;
    if (dto.fechaHora) {
      updateData.fechaHora = new Date(dto.fechaHora);
    }

    return this.citasRepository.update(id, updateData);
  }

  async updateEstado(id: number, estado: string): Promise<Cita> {
    await this.findOne(id); // Valida que existe
    return this.citasRepository.update(id, { estado: estado as EstadoCita });
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id); // Valida que existe
    return this.citasRepository.delete(id);
  }
}

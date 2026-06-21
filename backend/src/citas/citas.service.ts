import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CitasRepository } from './citas.repository';
import { CreateCitaDto } from './dto/create-cita.dto';
import { UpdateCitaDto } from './dto/update-cita.dto';
import { Cita, EstadoCita } from './entities/cita.entity';
import { HorarioLaboral } from '../horarios/entities/horario.entity';

@Injectable()
export class CitasService {
  constructor(
    private readonly citasRepository: CitasRepository,
    @InjectRepository(HorarioLaboral)
    private readonly horariosRepo: Repository<HorarioLaboral>,
  ) {}

  async findAll(query: any): Promise<Cita[]> {
    const citas = await this.citasRepository.findAll(query);

    // Adjunta el nº de ausencias de cada cliente para avisar de posibles absentistas
    const ids = [...new Set(citas.map(c => c.usuarioId).filter((id): id is number => !!id))];
    if (ids.length) {
      const conteo = await this.citasRepository.countNoShowsByUsuarios(ids);
      for (const c of citas) {
        (c as any).clienteNoShows = c.usuarioId ? (conteo[c.usuarioId] ?? 0) : 0;
      }
    }

    return citas;
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

  async create(dto: CreateCitaDto, user: any): Promise<Cita> {
    // Admin/Empleado pueden reservar en nombre de un cliente existente o de un cliente
    // invitado (sin cuenta, p. ej. una llamada telefónica). El resto de usuarios solo
    // pueden reservar para sí mismos.
    const esStaff = user.rol === 'ADMIN' || user.rol === 'EMPLEADO';
    let usuarioId: number | null;

    if (esStaff) {
      if (!dto.usuarioId && !dto.clienteInvitadoNombre) {
        throw new BadRequestException('Indica un cliente existente o los datos de un cliente invitado');
      }
      usuarioId = dto.usuarioId ?? null;
    } else {
      usuarioId = user.sub;
    }

    // Comprobar conflicto de horario (ejemplo: duración fija de 30 min si no viene en el servicio)
    const hasConflict = await this.citasRepository.hasConflict(
      dto.empleadoId,
      new Date(dto.fechaHora),
      30
    );

    if (hasConflict) {
      throw new ConflictException('El empleado ya tiene una cita en ese horario');
    }

    // Reservas creadas por el propio staff quedan confirmadas directamente (salvo que se indique otro estado)
    const estadoInicial = esStaff ? (dto.estado ?? 'CONFIRMADA') : undefined;

    return this.citasRepository.create(dto, usuarioId, estadoInicial);
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

  /** Devuelve el número de ausencias (NO_SHOW) acumuladas por un cliente */
  async countNoShows(usuarioId: number): Promise<{ noShows: number }> {
    const noShows = await this.citasRepository.countNoShowsByUsuario(usuarioId);
    return { noShows };
  }

  /**
   * Estadísticas de productividad de un empleado en un rango de fechas:
   * cortes realizados, horas trabajadas, horas de horario laboral abierto,
   * dinero recibido y reparto porcentual por tipo de servicio.
   */
  async getEstadisticasEmpleado(empleadoId: number, desde: string, hasta: string) {
    const citas = await this.citasRepository.findByEmpleadoEnRango(empleadoId, desde, hasta);
    const completadas = citas.filter(c => c.estado === 'COMPLETADA');

    const cortesRealizados = completadas.length;

    const minutosTrabajados = completadas.reduce(
      (acc, c) => acc + (c.servicio?.duracionMin ?? 0), 0
    );
    const horasTrabajadas = Math.round((minutosTrabajados / 60) * 10) / 10;

    const dineroRecibido = completadas.reduce(
      (acc, c) => acc + Number(c.precioFinal ?? c.servicio?.precio ?? 0), 0
    );

    // Reparto por categoría de servicio
    const conteoPorTipo = new Map<string, number>();
    for (const c of completadas) {
      const cat = c.servicio?.categoria ?? 'OTROS';
      conteoPorTipo.set(cat, (conteoPorTipo.get(cat) ?? 0) + 1);
    }
    const porcentajesTipos = [...conteoPorTipo.entries()]
      .map(([categoria, cantidad]) => ({
        categoria,
        cantidad,
        porcentaje: cortesRealizados ? Math.round((cantidad / cortesRealizados) * 1000) / 10 : 0,
      }))
      .sort((a, b) => b.cantidad - a.cantidad);

    const horasHorarioLaboral = await this.calcularHorasHorarioLaboral(desde, hasta);

    return {
      cortesRealizados,
      horasTrabajadas,
      horasHorarioLaboral,
      dineroRecibido: Math.round(dineroRecibido * 100) / 100,
      porcentajesTipos,
    };
  }

  /** Suma las horas de apertura (todas las franjas) de los días activos en el rango */
  private async calcularHorasHorarioLaboral(desde: string, hasta: string): Promise<number> {
    const fechaDesde = desde.slice(0, 10);
    const fechaHasta = hasta.slice(0, 10);

    const horarios = await this.horariosRepo.createQueryBuilder('h')
      .leftJoinAndSelect('h.franjas', 'f')
      .where('h.fecha >= :desde AND h.fecha <= :hasta', { desde: fechaDesde, hasta: fechaHasta })
      .andWhere('h.activo = true')
      .getMany();

    const toMin = (t: string) => {
      const [h, m] = t.split(':').map(Number);
      return h * 60 + m;
    };

    let minutos = 0;
    for (const h of horarios) {
      const franjas = h.franjas?.length
        ? h.franjas
        : (h.horaInicio && h.horaFin ? [{ horaInicio: h.horaInicio, horaFin: h.horaFin }] : []);
      for (const f of franjas) {
        minutos += toMin(f.horaFin) - toMin(f.horaInicio);
      }
    }
    return Math.round((minutos / 60) * 10) / 10;
  }
}

// CC-BY-SA 4.0 — TFG Peluquería
// Servicio de horarios con soporte para turnos partidos (múltiples franjas por día)

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Type } from 'class-transformer';
import {
  IsString, IsNotEmpty, IsOptional, IsInt, IsBoolean,
  IsArray, ValidateNested, ArrayMinSize, Matches
} from 'class-validator';
import { HorarioLaboral } from './entities/horario.entity';
import { FranjaHoraria } from './entities/franja-horaria.entity';
import { CitasRepository } from '../citas/citas.repository';

const HORA_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

export class FranjaDto {
  @IsString()
  @Matches(HORA_REGEX, { message: 'horaInicio debe tener formato HH:mm' })
  horaInicio!: string;

  @IsString()
  @Matches(HORA_REGEX, { message: 'horaFin debe tener formato HH:mm' })
  horaFin!: string;

  @IsOptional()
  @IsInt()
  orden?: number;
}

export class CreateHorarioDto {
  @IsString()
  @IsNotEmpty()
  fecha!: string;

  @IsOptional()
  @IsInt()
  duracionCorteMin?: number;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => FranjaDto)
  franjas!: FranjaDto[];
}


@Injectable()
export class HorariosService {
  constructor(
    @InjectRepository(HorarioLaboral)
    private readonly repo: Repository<HorarioLaboral>,
    @InjectRepository(FranjaHoraria)
    private readonly franjaRepo: Repository<FranjaHoraria>,
    private readonly citasRepo: CitasRepository,
  ) {}

  /** Admin: lista horarios de un mes con sus franjas */
  findAll(anio: number, mes: number) {
    const { inicio, fin } = this.rangoMes(anio, mes);
    return this.repo.createQueryBuilder('h')
      .leftJoinAndSelect('h.franjas', 'f')
      .where('h.fecha >= :inicio AND h.fecha <= :fin', { inicio, fin })
      .orderBy('h.fecha', 'ASC')
      .addOrderBy('f.orden', 'ASC')
      .getMany();
  }

  /** Admin: crear horario con sus franjas */
  async create(dto: CreateHorarioDto): Promise<HorarioLaboral> {
    this.validarFranjas(dto.franjas ?? []);

    const franjas = (dto.franjas ?? [])
      .filter(f => f.horaInicio && f.horaFin)
      .map((f, i) => this.franjaRepo.create({ horaInicio: f.horaInicio, horaFin: f.horaFin, orden: i }));

    const horario = this.repo.create({
      fecha: dto.fecha,
      duracionCorteMin: dto.duracionCorteMin ?? 30,
      activo: dto.activo ?? true,
      // Legacy: primer y último bloque para compatibilidad
      horaInicio: franjas[0]?.horaInicio,
      horaFin: franjas[franjas.length - 1]?.horaFin,
      franjas,
    });
    return this.repo.save(horario);
  }

  /** Admin: actualizar horario — reemplaza franjas completamente */
  async update(id: number, dto: Partial<CreateHorarioDto>): Promise<HorarioLaboral | null> {
    const existing = await this.repo.findOne({ where: { id }, relations: ['franjas'] });
    if (!existing) throw new NotFoundException('Horario no encontrado');

    if (dto.franjas) this.validarFranjas(dto.franjas);

    // Borrar franjas antiguas
    if (existing.franjas?.length) {
      await this.franjaRepo.delete(existing.franjas.map(f => f.id));
    }

    // Construir nuevas franjas
    const franjas = (dto.franjas ?? [])
      .filter(f => f.horaInicio && f.horaFin)
      .map((f, i) => this.franjaRepo.create({ horaInicio: f.horaInicio, horaFin: f.horaFin, orden: i, horarioId: id }));

    const nuevasFranjas = franjas.length ? await this.franjaRepo.save(franjas) : [];

    await this.repo.update(id, {
      ...(dto.duracionCorteMin !== undefined && { duracionCorteMin: dto.duracionCorteMin }),
      ...(dto.activo !== undefined && { activo: dto.activo }),
      horaInicio: nuevasFranjas[0]?.horaInicio,
      horaFin: nuevasFranjas[nuevasFranjas.length - 1]?.horaFin,
    });

    return this.repo.findOne({ where: { id }, relations: ['franjas'] });
  }

  async remove(id: number): Promise<void> {
    await this.repo.delete(id);
  }

  /** Valida que las franjas tengan horas coherentes y no se solapen entre sí */
  private validarFranjas(franjas: FranjaDto[]): void {
    const validas = (franjas ?? []).filter(f => f.horaInicio && f.horaFin);
    if (validas.length === 0) {
      throw new BadRequestException('Debes indicar al menos un bloque horario');
    }
    for (const f of validas) {
      if (f.horaInicio >= f.horaFin) {
        throw new BadRequestException(`El bloque ${f.horaInicio}-${f.horaFin} es inválido: el inicio debe ser anterior al fin`);
      }
    }
    const ordenadas = [...validas].sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));
    for (let i = 0; i < ordenadas.length - 1; i++) {
      if (ordenadas[i].horaFin > ordenadas[i + 1].horaInicio) {
        throw new BadRequestException(
          `Los bloques ${ordenadas[i].horaInicio}-${ordenadas[i].horaFin} y ${ordenadas[i + 1].horaInicio}-${ordenadas[i + 1].horaFin} se solapan`
        );
      }
    }
  }

  // ── Disponibilidad ────────────────────────────────────────────────────────

  /** Mapa fecha → estado para el calendario del usuario */
  async getDiasDisponiblesMes(anio: number, mes: number): Promise<Record<string, string>> {
    const { inicio, fin } = this.rangoMes(anio, mes);

    const horarios = await this.repo.createQueryBuilder('h')
      .leftJoinAndSelect('h.franjas', 'f')
      .where('h.fecha >= :inicio AND h.fecha <= :fin', { inicio, fin })
      .andWhere('h.activo = true')
      .getMany();

    const disponibilidad: Record<string, string> = {};

    for (const h of horarios) {
      const franjas = this.getFranjasEfectivas(h);
      if (franjas.length === 0) continue;

      const totalSlots = franjas.reduce((acc, f) => {
        const mins = this.toMinutes(f.horaFin) - this.toMinutes(f.horaInicio);
        return acc + Math.floor(mins / h.duracionCorteMin);
      }, 0);

      if (totalSlots <= 0) continue;

      // Obtener citas del día para ver cuántos slots hay ocupados
      const citas = await this.citasRepo.findAll({
        fechaDesde: `${h.fecha}T00:00:00Z`,
        fechaHasta: `${h.fecha}T23:59:59Z`,
      });
      const citasActivas = citas.filter(c => c.estado !== 'CANCELADA' && c.estado !== 'COMPLETADA');

      const ocupados = citasActivas.length;
      const ratio = ocupados / totalSlots;

      if (ratio >= 1)          disponibilidad[h.fecha] = 'lleno';
      else if (ratio >= 0.75)  disponibilidad[h.fecha] = 'parcial';
      else                     disponibilidad[h.fecha] = 'disponible';
    }

    return disponibilidad;
  }

  /** Slots disponibles de un día, respetando todos los bloques y descansos */
  async getDisponibilidadDia(fecha: string, duracionSolicitada = 30) {
    const horario = await this.repo.findOne({
      where: { fecha, activo: true },
      relations: ['franjas'],
    });

    if (!horario) return { fecha, bloques: [], slots: [] };

    const franjas = this.getFranjasEfectivas(horario)
      .sort((a, b) => this.toMinutes(a.horaInicio) - this.toMinutes(b.horaInicio));

    const citas = await this.citasRepo.findAll({
      fechaDesde: `${fecha}T00:00:00Z`,
      fechaHasta: `${fecha}T23:59:59Z`,
    });

    const step = 15; // Intervalo de inicio de citas en minutos
    const allSlots: any[] = [];
    const bloques: any[] = [];

    for (const franja of franjas) {
      const franjaInicio = this.toMinutes(franja.horaInicio);
      const franjaFin    = this.toMinutes(franja.horaFin);
      const slotsBloque: any[] = [];

      let current = franjaInicio;
      while (current + duracionSolicitada <= franjaFin) {
        const horaStr   = this.toTime(current);
        const slotInicio = current;
        const slotFin    = current + duracionSolicitada;

        const hasOverlap = citas.some(cita => {
          const citaInicio   = this.toMinutes(new Date(cita.fechaHora).toISOString().slice(11, 16));
          const citaDuracion = cita.servicio?.duracionMin ?? 30;
          const citaFin      = citaInicio + citaDuracion;
          return slotInicio < citaFin && citaInicio < slotFin;
        });

        const slot = { hora: horaStr, disponible: !hasOverlap };
        slotsBloque.push(slot);
        allSlots.push(slot);
        current += step;
      }

      bloques.push({
        horaInicio: franja.horaInicio,
        horaFin: franja.horaFin,
        slots: slotsBloque,
      });
    }

    return { fecha, duracionConsultada: duracionSolicitada, bloques, slots: allSlots };
  }

  /**
   * Agenda semanal completa (7 días desde fechaInicio) con cada franja horaria
   * desglosada en slots discretos (paso = duracionCorteMin del día), marcando
   * si están libres u ocupados y, en ese caso, con quién (cliente o invitado).
   * Pensada para el panel de agendamiento rápido de Admin/Empleado.
   */
  async getDisponibilidadSemana(fechaInicio: string) {
    const nombresDias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const dias: any[] = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date(`${fechaInicio}T00:00:00Z`);
      d.setUTCDate(d.getUTCDate() + i);
      const fecha = d.toISOString().slice(0, 10);

      const horario = await this.repo.findOne({ where: { fecha, activo: true }, relations: ['franjas'] });

      if (!horario) {
        dias.push({ fecha, diaSemana: nombresDias[d.getUTCDay()], activo: false, slots: [] });
        continue;
      }

      const franjas = this.getFranjasEfectivas(horario)
        .sort((a, b) => this.toMinutes(a.horaInicio) - this.toMinutes(b.horaInicio));

      const citasDelDia = await this.citasRepo.findAll({
        fechaDesde: `${fecha}T00:00:00Z`,
        fechaHasta: `${fecha}T23:59:59Z`,
      });
      const citasActivas = citasDelDia.filter(c => c.estado !== 'CANCELADA');

      const step = horario.duracionCorteMin;
      const slots: any[] = [];

      for (const franja of franjas) {
        let current = this.toMinutes(franja.horaInicio);
        const fin = this.toMinutes(franja.horaFin);

        while (current + step <= fin) {
          const horaStr = this.toTime(current);
          const cita = citasActivas.find(
            c => this.toMinutes(new Date(c.fechaHora).toISOString().slice(11, 16)) === current
          );

          slots.push({
            hora: horaStr,
            disponible: !cita,
            cita: cita ? {
              id: cita.id,
              cliente: cita.usuario
                ? `${cita.usuario.nombre} ${cita.usuario.apellidos}`
                : (cita.clienteInvitadoNombre ?? 'Cliente invitado'),
              telefono: cita.usuario?.telefono ?? cita.clienteInvitadoTelefono ?? null,
              servicio: cita.servicio?.nombre ?? null,
              estado: cita.estado,
            } : null,
          });

          current += step;
        }
      }

      dias.push({ fecha, diaSemana: nombresDias[d.getUTCDay()], activo: horario.activo, slots });
    }

    return { fechaInicio, fechaFin: dias[dias.length - 1]?.fecha, dias };
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  /**
   * Devuelve las franjas del horario. Si no tiene franjas guardadas pero sí
   * los campos legacy horaInicio/horaFin, los convierte en una franja virtual
   * para compatibilidad con datos anteriores.
   */
  private getFranjasEfectivas(horario: HorarioLaboral): { horaInicio: string; horaFin: string }[] {
    if (horario.franjas?.length) {
      return horario.franjas;
    }
    // Compatibilidad legacy
    if (horario.horaInicio && horario.horaFin) {
      return [{ horaInicio: horario.horaInicio, horaFin: horario.horaFin }];
    }
    return [];
  }

  /** Calcula el primer y último día reales de un mes (1-indexado), evitando fechas inválidas como "31 de junio" */
  private rangoMes(anio: number, mes: number): { inicio: string; fin: string } {
    const ultimoDia = new Date(anio, mes, 0).getDate(); // mes 1-indexado: día 0 del mes siguiente
    const inicio = `${anio}-${String(mes).padStart(2, '0')}-01`;
    const fin    = `${anio}-${String(mes).padStart(2, '0')}-${String(ultimoDia).padStart(2, '0')}`;
    return { inicio, fin };
  }

  private toMinutes(time: string): number {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  }

  private toTime(minutes: number): string {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  }
}

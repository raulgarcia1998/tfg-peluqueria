// CC-BY-SA 4.0 — TFG Peluquería

import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn, OneToMany
} from 'typeorm';
import { FranjaHoraria } from './franja-horaria.entity';

@Entity('horarios_laborales')
export class HorarioLaboral {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'date', unique: true })
  fecha!: string;

  /** @deprecated Usar franjas[]. Mantenido para compatibilidad con datos legacy. */
  @Column({ name: 'horaInicio', nullable: true })
  horaInicio?: string;

  /** @deprecated Usar franjas[]. Mantenido para compatibilidad con datos legacy. */
  @Column({ name: 'horaFin', nullable: true })
  horaFin?: string;

  /**
   * @deprecated Sustituido por `tiempoTransicionMin`. Era el "paso entre citas"
   * (slot fijo), que no encajaba con servicios de duración variable. Se mantiene
   * la columna para no romper datos antiguos; ya no se usa en la lógica nueva.
   */
  @Column({ name: 'duracion_corte_min', default: 30 })
  duracionCorteMin!: number;

  /**
   * Tiempo de transición (buffer) en minutos que se reserva DESPUÉS de cada cita
   * para que el peluquero limpie, se prepare y descanse antes del siguiente
   * cliente. Sustituye al antiguo "paso entre citas".
   */
  @Column({ name: 'tiempo_transicion_min', default: 10 })
  tiempoTransicionMin!: number;

  @Column({ default: true })
  activo!: boolean;

  /** Bloques horarios del día (permite turnos partidos con descanso) */
  @OneToMany(() => FranjaHoraria, (f) => f.horario, { cascade: true, eager: true })
  franjas!: FranjaHoraria[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}

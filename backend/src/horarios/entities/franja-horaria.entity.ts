// CC-BY-SA 4.0 — TFG Peluquería
// Entidad: un bloque horario dentro de una jornada laboral (permite turnos partidos)

import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn
} from 'typeorm';
import { HorarioLaboral } from './horario.entity';

@Entity('franjas_horarias')
export class FranjaHoraria {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'horario_id' })
  horarioId!: number;

  @ManyToOne(() => HorarioLaboral, (h) => h.franjas, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'horario_id' })
  horario!: HorarioLaboral;

  /** Hora de inicio del bloque, formato 'HH:mm' */
  @Column({ name: 'hora_inicio' })
  horaInicio!: string;

  /** Hora de fin del bloque, formato 'HH:mm' */
  @Column({ name: 'hora_fin' })
  horaFin!: string;

  /** Orden del bloque dentro del día (0 = primero) */
  @Column({ default: 0 })
  orden!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}

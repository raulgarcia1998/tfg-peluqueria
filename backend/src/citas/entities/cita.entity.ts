// CC-BY-SA 4.0 — TFG Peluquería
// TypeORM Entity para PostgreSQL

import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn
} from 'typeorm';

export type EstadoCita = 'PENDIENTE' | 'CONFIRMADA' | 'CANCELADA' | 'COMPLETADA';

@Entity('citas')
export class Cita {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'usuario_id' })
  usuarioId!: number;

  @Column({ name: 'empleado_id' })
  empleadoId!: number;

  @Column({ name: 'servicio_id' })
  servicioId!: number;

  @ManyToOne('User', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'usuario_id' })
  usuario!: any;

  @ManyToOne('User', { onDelete: 'SET NULL' }) // Los empleados también son usuarios
  @JoinColumn({ name: 'empleado_id' })
  empleado!: any;

  @ManyToOne('Servicio')
  @JoinColumn({ name: 'servicio_id' })
  servicio!: any;

  @Column({ name: 'fecha_hora', type: 'timestamptz' })
  fechaHora!: Date;

  @Column({
    type: 'enum',
    enum: ['PENDIENTE', 'CONFIRMADA', 'CANCELADA', 'COMPLETADA'],
    default: 'PENDIENTE'
  })
  estado!: EstadoCita;

  @Column({ type: 'text', nullable: true })
  notas?: string;

  @Column({ name: 'precio_final', type: 'decimal', precision: 10, scale: 2, nullable: true })
  precioFinal?: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}

// CC-BY-SA 4.0 — TFG Peluquería
// TypeORM Entity para PostgreSQL

import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn
} from 'typeorm';

export type EstadoCita = 'PENDIENTE' | 'CONFIRMADA' | 'CANCELADA' | 'COMPLETADA' | 'NO_SHOW';

@Entity('citas')
export class Cita {
  @PrimaryGeneratedColumn()
  id!: number;

  /** Nullable: las citas creadas por Admin/Empleado para clientes sin cuenta no tienen usuario */
  @Column({ name: 'usuario_id', nullable: true })
  usuarioId?: number | null;

  @Column({ name: 'empleado_id' })
  empleadoId!: number;

  @Column({ name: 'servicio_id' })
  servicioId!: number;

  @ManyToOne('User', { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'usuario_id' })
  usuario?: any;

  /** Nombre del cliente cuando la cita la crea Admin/Empleado para alguien sin cuenta (reserva telefónica) */
  @Column({ name: 'cliente_invitado_nombre', nullable: true })
  clienteInvitadoNombre?: string;

  /** Teléfono de contacto del cliente invitado */
  @Column({ name: 'cliente_invitado_telefono', nullable: true })
  clienteInvitadoTelefono?: string;

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
    enum: ['PENDIENTE', 'CONFIRMADA', 'CANCELADA', 'COMPLETADA', 'NO_SHOW'],
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

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export type CategoriaServicio = 'CORTE' | 'COLOR' | 'TRATAMIENTO' | 'BARBA' | 'OTROS';

@Entity('servicios')
export class Servicio {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  nombre!: string;

  @Column({ type: 'text', nullable: true })
  descripcion?: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => (value ? parseFloat(value) : 0)
    }
  })
  precio!: number;

  @Column({ name: 'duracion_min' })
  duracionMin!: number;

  @Column({
    type: 'enum',
    enum: ['CORTE', 'COLOR', 'TRATAMIENTO', 'BARBA', 'OTROS'],
    default: 'OTROS'
  })
  categoria!: CategoriaServicio;

  @Column({ name: 'foto_url', nullable: true })
  fotoUrl?: string;

  @Column({ default: true })
  activo!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}

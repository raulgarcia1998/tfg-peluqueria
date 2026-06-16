import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn, OneToMany
} from 'typeorm';
import { Cita } from '../../citas/entities/cita.entity';

@Entity('usuarios')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  nombre!: string;

  @Column()
  apellidos!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ select: false }) // No devolver el password por defecto
  password!: string;

  @Column({ nullable: true })
  telefono?: string;

  @Column({ default: 'USER' })
  rol!: string; // Podría ser un enum o una entidad aparte, pero simplificamos

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @OneToMany(() => Cita, (cita) => cita.usuarioId)
  citas?: Cita[];
}

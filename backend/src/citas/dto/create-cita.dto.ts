// CC-BY-SA 4.0 — TFG Peluquería

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt, IsString, IsDateString,
  IsOptional, IsPositive, IsIn
} from 'class-validator';
import type { EstadoCita } from '../entities/cita.entity';

export class CreateCitaDto {
  @ApiProperty({ example: 3, description: 'ID del empleado asignado' })
  @IsInt()
  @IsPositive()
  empleadoId!: number;

  @ApiProperty({ example: 1, description: 'ID del servicio solicitado' })
  @IsInt()
  @IsPositive()
  servicioId!: number;

  @ApiProperty({
    example: '2025-09-15T10:30:00Z',
    description: 'Fecha y hora de la cita en formato ISO 8601'
  })
  @IsDateString()
  fechaHora!: string;

  @ApiPropertyOptional({ example: 'Alergia a tintes amoniacales', description: 'Notas adicionales' })
  @IsString()
  @IsOptional()
  notas?: string;

  @ApiPropertyOptional({ description: 'Uso interno Admin/Empleado: ID de un cliente con cuenta existente' })
  @IsInt()
  @IsPositive()
  @IsOptional()
  usuarioId?: number;

  @ApiPropertyOptional({ description: 'Uso interno Admin/Empleado: nombre de un cliente sin cuenta (reserva telefónica)' })
  @IsString()
  @IsOptional()
  clienteInvitadoNombre?: string;

  @ApiPropertyOptional({ description: 'Teléfono de contacto del cliente invitado' })
  @IsString()
  @IsOptional()
  clienteInvitadoTelefono?: string;

  @ApiPropertyOptional({ enum: ['PENDIENTE', 'CONFIRMADA', 'CANCELADA', 'COMPLETADA'], description: 'Uso interno Admin/Empleado: estado inicial de la cita' })
  @IsIn(['PENDIENTE', 'CONFIRMADA', 'CANCELADA', 'COMPLETADA'])
  @IsOptional()
  estado?: EstadoCita;
}

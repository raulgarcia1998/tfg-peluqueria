// CC-BY-SA 4.0 — TFG Peluquería

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt, IsString, IsDateString,
  IsOptional, IsPositive
} from 'class-validator';

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
}

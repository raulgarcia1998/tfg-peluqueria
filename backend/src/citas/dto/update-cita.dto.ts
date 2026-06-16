// CC-BY-SA 4.0 — TFG Peluquería

import { PartialType } from '@nestjs/swagger';
import { CreateCitaDto } from './create-cita.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

export class UpdateCitaDto extends PartialType(CreateCitaDto) {
  @ApiPropertyOptional({
    enum: ['PENDIENTE', 'CONFIRMADA', 'CANCELADA', 'COMPLETADA'],
    example: 'CONFIRMADA'
  })
  @IsEnum(['PENDIENTE', 'CONFIRMADA', 'CANCELADA', 'COMPLETADA'])
  @IsOptional()
  estado?: string;
}

import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Query, ParseIntPipe, UseGuards
} from '@nestjs/common';
import { HorariosService, CreateHorarioDto } from './horarios.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

@ApiTags('Horarios')
@Controller('api/v1/horarios')
export class HorariosController {
  constructor(private readonly horariosService: HorariosService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Admin: obtener horarios por mes (con franjas)' })
  findAll(
    @Query('anio', ParseIntPipe) anio: number,
    @Query('mes', ParseIntPipe) mes: number,
  ) {
    return this.horariosService.findAll(anio, mes);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Admin: crear horario laboral con franjas' })
  create(@Body() dto: CreateHorarioDto) {
    return this.horariosService.create(dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Admin: actualizar horario (reemplaza franjas)' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: CreateHorarioDto) {
    return this.horariosService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Admin: eliminar horario laboral' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.horariosService.remove(id);
  }


  @Get('disponibilidad/dia/:fecha')
  @ApiOperation({ summary: 'Usuario: slots libres de un día (agrupados por franja)' })
  getDisponibilidadDia(
    @Param('fecha') fecha: string,
    @Query('duracion') duracion?: number,
  ) {
    return this.horariosService.getDisponibilidadDia(fecha, duracion ? Number(duracion) : 30);
  }

  @Get('disponibilidad/mes')
  @ApiOperation({ summary: 'Usuario: resumen de disponibilidad del mes' })
  getDiasDisponiblesMes(
    @Query('anio', ParseIntPipe) anio: number,
    @Query('mes', ParseIntPipe) mes: number,
  ) {
    return this.horariosService.getDiasDisponiblesMes(anio, mes);
  }

  @Get('disponibilidad/semana')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'EMPLEADO')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Admin/Empleado: agenda semanal completa (slots libres y ocupados con datos del cliente)' })
  @ApiQuery({ name: 'fechaInicio', required: true, type: String, example: '2026-06-15' })
  getDisponibilidadSemana(@Query('fechaInicio') fechaInicio: string) {
    return this.horariosService.getDisponibilidadSemana(fechaInicio);
  }
}

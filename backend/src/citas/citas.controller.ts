// CC-BY-SA 4.0 — TFG Peluquería

import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, Query, ParseIntPipe,
  UseGuards, HttpCode, HttpStatus, Request
} from '@nestjs/common';
import {
  ApiTags, ApiBearerAuth, ApiOperation,
  ApiResponse, ApiParam, ApiQuery
} from '@nestjs/swagger';
import { CitasService } from './citas.service';
import { CreateCitaDto } from './dto/create-cita.dto';
import { UpdateCitaDto } from './dto/update-cita.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Citas')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('api/v1/citas')
export class CitasController {
  constructor(private readonly citasService: CitasService) {}

  /**
   * GET /api/v1/citas
   * Devuelve todas las citas (solo ADMIN)
   */
  @Get()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({
    summary: 'Obtener todas las citas',
    description: 'Endpoint exclusivo para administradores. Permite filtrar por estado, fechas y servicio.'
  })
  @ApiQuery({ name: 'estado',      required: false, enum: ['PENDIENTE', 'CONFIRMADA', 'CANCELADA', 'COMPLETADA'] })
  @ApiQuery({ name: 'fechaDesde',  required: false, type: String, example: '2025-01-01' })
  @ApiQuery({ name: 'fechaHasta',  required: false, type: String, example: '2025-12-31' })
  @ApiQuery({ name: 'search',      required: false, type: String })
  @ApiQuery({ name: 'servicioId',  required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Lista de citas obtenida correctamente.' })
  @ApiResponse({ status: 401, description: 'No autenticado.' })
  @ApiResponse({ status: 403, description: 'Acceso denegado — se requiere rol ADMIN.' })
  findAll(@Query() query: any) {
    return this.citasService.findAll(query);
  }

  /**
   * GET /api/v1/citas/mis-citas
   * Devuelve las citas del usuario autenticado
   */
  @Get('mis-citas')
  @ApiOperation({ summary: 'Obtener citas del usuario autenticado' })
  @ApiResponse({ status: 200, description: 'Citas del usuario.' })
  getMisCitas(@Request() req: any) {
    return this.citasService.findByUsuario(req.user.sub);
  }

  /**
   * GET /api/v1/citas/:id
   */
  @Get(':id')
  @ApiOperation({ summary: 'Obtener una cita por ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID de la cita' })
  @ApiResponse({ status: 200, description: 'Cita encontrada.' })
  @ApiResponse({ status: 404, description: 'Cita no encontrada.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.citasService.findOne(id);
  }

  /**
   * POST /api/v1/citas
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear una nueva cita' })
  @ApiResponse({ status: 201, description: 'Cita creada correctamente.' })
  @ApiResponse({ status: 400, description: 'Datos inválidos.' })
  @ApiResponse({ status: 409, description: 'Conflicto de horario — el empleado ya tiene una cita en ese rango.' })
  create(@Body() dto: CreateCitaDto, @Request() req: any) {
    return this.citasService.create(dto, req.user.sub);
  }

  /**
   * PATCH /api/v1/citas/:id
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar datos de una cita' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Cita actualizada.' })
  @ApiResponse({ status: 404, description: 'Cita no encontrada.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCitaDto,
    @Request() req: any
  ) {
    return this.citasService.update(id, dto, req.user);
  }

  /**
   * PATCH /api/v1/citas/:id/estado
   */
  @Patch(':id/estado')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'EMPLEADO')
  @ApiOperation({ summary: 'Cambiar el estado de una cita (Admin/Empleado)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Estado actualizado.' })
  updateEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body('estado') estado: string
  ) {
    return this.citasService.updateEstado(id, estado);
  }

  /**
   * DELETE /api/v1/citas/:id
   */
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar una cita (solo Admin)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 204, description: 'Cita eliminada.' })
  @ApiResponse({ status: 403, description: 'Acceso denegado.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.citasService.remove(id);
  }
}

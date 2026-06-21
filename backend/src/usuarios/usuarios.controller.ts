import { Controller, Get, Patch, Param, Query, Body, ParseIntPipe, UseGuards, BadRequestException, ForbiddenException, Request } from '@nestjs/common';
import { UsersService } from './usuarios.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiBody } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, IsEmail, MinLength, Matches } from 'class-validator';

class UpdateUsuarioDto {
  @IsIn(['USER', 'EMPLEADO', 'ADMIN'])
  @IsOptional()
  rol?: string;
}

class UpdatePerfilDto {
  @IsString() @IsOptional() @MinLength(1)
  nombre?: string;

  @IsString() @IsOptional() @MinLength(1)
  apellidos?: string;

  @IsEmail() @IsOptional()
  email?: string;

  @IsString() @IsOptional()
  @Matches(/^\+?[\d\s\-().]{7,20}$/, { message: 'El teléfono no tiene un formato válido' })
  telefono?: string;
}

@ApiTags('Usuarios')
@Controller('api/v1/usuarios')
export class UsuariosController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'EMPLEADO')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Admin/Empleado: buscar usuarios (clientes o equipo)' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Texto a buscar en nombre, apellidos, email o teléfono' })
  @ApiQuery({ name: 'rol', required: false, type: String, example: 'USER' })
  search(@Query('search') search?: string, @Query('rol') rol?: string) {
    return this.usersService.search({ search, rol });
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Obtener perfil de usuario por ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Admin: actualizar rol de un usuario' })
  @ApiBody({ type: UpdateUsuarioDto })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUsuarioDto,
  ) {
    if (!dto.rol) throw new BadRequestException('Debes indicar al menos un campo a actualizar');
    return this.usersService.update(id, dto);
  }

  @Patch(':id/perfil')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Actualizar datos de perfil (el propio usuario o un admin)' })
  @ApiBody({ type: UpdatePerfilDto })
  async updatePerfil(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePerfilDto,
    @Request() req: any,
  ) {
    const esAdmin = req.user.rol === 'ADMIN';
    if (!esAdmin && req.user.sub !== id) {
      throw new ForbiddenException('No puedes modificar los datos de otro usuario');
    }
    if (!dto.nombre && !dto.apellidos && !dto.email && dto.telefono === undefined) {
      throw new BadRequestException('Debes indicar al menos un campo a actualizar');
    }
    return this.usersService.updatePerfil(id, dto);
  }
}

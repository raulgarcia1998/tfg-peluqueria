import { Controller, Get, Param, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { UsersService } from './usuarios.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

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
}

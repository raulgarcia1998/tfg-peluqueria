import { Injectable, OnModuleInit } from '@nestjs/common';
import { UsersService } from './usuarios/usuarios.service';
import { ServiciosService } from './servicios/servicios.service';
import { HorariosService } from './horarios/horarios.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AppService implements OnModuleInit {
  constructor(
    private readonly usersService: UsersService,
    private readonly serviciosService: ServiciosService,
    private readonly horariosService: HorariosService,
  ) {}

  async onModuleInit() {
    await this.seedAdmin();
    await this.seedServicios();
    await this.seedHorarios();
  }

  private async seedAdmin() {
    const adminEmail = 'admin@peluqueria.com';
    const existing = await this.usersService.findByEmail(adminEmail);
    if (!existing) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await this.usersService.create({
        nombre: 'Admin',
        apellidos: 'TFG',
        email: adminEmail,
        password: hashedPassword,
        rol: 'ADMIN',
      });
      console.log('✅ Usuario ADMIN creado: admin@peluqueria.com / admin123');
    }
  }

  private async seedServicios() {
    const servicios = await this.serviciosService.findAll();
    if (servicios.length === 0) {
      const initial = [
        { nombre: 'Corte Caballero', precio: 15, duracionMin: 30, categoria: 'CORTE' as any },
        { nombre: 'Corte y Lavado', precio: 20, duracionMin: 45, categoria: 'CORTE' as any },
        { nombre: 'Tinte', precio: 35, duracionMin: 90, categoria: 'COLOR' as any },
        { nombre: 'Arreglo Barba', precio: 10, duracionMin: 20, categoria: 'BARBA' as any },
      ];
      for (const s of initial) {
        await this.serviciosService.create(s);
      }
      console.log('✅ Servicios iniciales creados');
    }
  }

  private async seedHorarios() {
    const anio = new Date().getFullYear();
    const mes = new Date().getMonth() + 1; // findAll espera el mes 1-indexado
    const horarios = await this.horariosService.findAll(anio, mes);
    
    if (horarios.length === 0) {
      for (let i = 0; i < 7; i++) {
        const fecha = new Date();
        fecha.setDate(fecha.getDate() + i);
        const fechaStr = fecha.toISOString().slice(0, 10);
        
        await this.horariosService.create({
          fecha: fechaStr,
          tiempoTransicionMin: 10,
          activo: true,
          franjas: [
            { horaInicio: '09:00', horaFin: '14:00' },
            { horaInicio: '16:00', horaFin: '19:00' },
          ],
        });
      }
      console.log('✅ Horarios iniciales creados');
    }
  }

  getHello(): string {
    return '🚀 API Peluquería operativa';
  }
}

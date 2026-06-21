import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CitasModule } from './citas/citas.module';
import { AuthModule } from './auth/auth.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { ServiciosModule } from './servicios/servicios.module';
import { HorariosModule } from './horarios/horarios.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env['DB_HOST'] || 'localhost',
      port: parseInt(process.env['DB_PORT'] || '5432', 10),
      username: process.env['DB_USER'] || 'postgres',
      password: process.env['DB_PASSWORD'] || 'changeme',
      database: process.env['DB_NAME'] || 'peluqueria',
      autoLoadEntities: true,
      // Crea/actualiza las tablas automáticamente. Controlado por su propia
      // variable para no depender de NODE_ENV (que algunos PaaS como Railway
      // fuerzan a 'production'). Por defecto está activo; ponlo a 'false'
      // cuando uses migraciones explícitas en producción.
      synchronize: process.env['DB_SYNCHRONIZE'] !== 'false',
    }),
    AuthModule,
    UsuariosModule,
    ServiciosModule,
    HorariosModule,
    CitasModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

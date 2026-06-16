import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Servicio } from './entities/servicio.entity';
import { ServiciosService } from './servicios.service';
import { ServiciosController } from './servicios.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Servicio])],
  providers: [ServiciosService],
  controllers: [ServiciosController],
  exports: [ServiciosService],
})
export class ServiciosModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HorarioLaboral } from './entities/horario.entity';
import { FranjaHoraria } from './entities/franja-horaria.entity';
import { HorariosService } from './horarios.service';
import { HorariosController } from './horarios.controller';
import { CitasModule } from '../citas/citas.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([HorarioLaboral, FranjaHoraria]),
    CitasModule,
  ],
  providers: [HorariosService],
  controllers: [HorariosController],
  exports: [HorariosService],
})
export class HorariosModule {}

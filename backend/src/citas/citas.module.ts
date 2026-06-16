import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CitasController } from './citas.controller';
import { CitasService } from './citas.service';
import { CitasRepository } from './citas.repository';
import { Cita } from './entities/cita.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Cita])],
  controllers: [CitasController],
  providers: [CitasService, CitasRepository],
  exports: [CitasService, CitasRepository],
})
export class CitasModule {}

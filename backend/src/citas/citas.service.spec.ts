import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { CitasService } from './citas.service';
import { CitasRepository } from './citas.repository';
import { Cita, EstadoCita } from './entities/cita.entity';
import { HorarioLaboral } from '../horarios/entities/horario.entity';

const mockCita = (): Cita => ({
  id: 1,
  empleadoId: 10,
  servicioId: 5,
  usuarioId: 2,
  fechaHora: new Date('2025-08-01T10:00:00Z'),
  estado: 'PENDIENTE' as EstadoCita,
  empleado: null as any,
  servicio: null as any,
  createdAt: new Date(),
  updatedAt: new Date(),
});

const mockRepo = {
  findAll: jest.fn(),
  findByUsuario: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  hasConflict: jest.fn(),
};

const mockHorariosRepo = {
  find: jest.fn(),
  findOne: jest.fn(),
};

describe('CitasService', () => {
  let service: CitasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CitasService,
        { provide: CitasRepository, useValue: mockRepo },
        { provide: getRepositoryToken(HorarioLaboral), useValue: mockHorariosRepo },
      ],
    }).compile();

    service = module.get<CitasService>(CitasService);
    jest.clearAllMocks();
  });

  describe('findOne', () => {
    it('devuelve la cita si existe', async () => {
      mockRepo.findById.mockResolvedValue(mockCita());
      const result = await service.findOne(1);
      expect(result.id).toBe(1);
    });

    it('lanza NotFoundException si no existe', async () => {
      mockRepo.findById.mockResolvedValue(null);
      await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    const staffUser = { sub: 10, rol: 'ADMIN' };
    const normalUser = { sub: 2, rol: 'USER' };

    it('asigna el usuario autenticado si el rol es USER', async () => {
      mockRepo.hasConflict.mockResolvedValue(false);
      mockRepo.create.mockResolvedValue(mockCita());

      const dto = { empleadoId: 10, servicioId: 5, fechaHora: '2025-08-01T10:00:00Z' } as any;
      await service.create(dto, normalUser);

      expect(mockRepo.create).toHaveBeenCalledWith(dto, normalUser.sub, undefined);
    });

    it('ADMIN puede crear cita para usuario existente', async () => {
      mockRepo.hasConflict.mockResolvedValue(false);
      mockRepo.create.mockResolvedValue(mockCita());

      const dto = { empleadoId: 10, servicioId: 5, fechaHora: '2025-08-01T10:00:00Z', usuarioId: 3 } as any;
      await service.create(dto, staffUser);

      expect(mockRepo.create).toHaveBeenCalledWith(dto, 3, 'CONFIRMADA');
    });

    it('ADMIN lanza BadRequestException sin cliente ni invitado', async () => {
      const dto = { empleadoId: 10, servicioId: 5, fechaHora: '2025-08-01T10:00:00Z' } as any;
      await expect(service.create(dto, staffUser)).rejects.toThrow(BadRequestException);
    });

    it('lanza ConflictException si hay solapamiento de horario', async () => {
      mockRepo.hasConflict.mockResolvedValue(true);
      const dto = { empleadoId: 10, servicioId: 5, fechaHora: '2025-08-01T10:00:00Z' } as any;
      await expect(service.create(dto, normalUser)).rejects.toThrow(ConflictException);
    });
  });

  describe('update', () => {
    it('lanza ConflictException si un USER intenta editar la cita de otro', async () => {
      const cita = { ...mockCita(), usuarioId: 99 };
      mockRepo.findById.mockResolvedValue(cita);
      const user = { sub: 2, rol: 'USER' };

      await expect(service.update(1, {} as any, user)).rejects.toThrow(ConflictException);
    });

    it('ADMIN puede editar cualquier cita', async () => {
      mockRepo.findById.mockResolvedValue(mockCita());
      mockRepo.hasConflict.mockResolvedValue(false);
      mockRepo.update.mockResolvedValue(mockCita());

      const result = await service.update(1, { notas: 'test' } as any, { sub: 99, rol: 'ADMIN' });
      expect(result).toBeDefined();
    });
  });

  describe('updateEstado', () => {
    it('actualiza el estado de una cita existente', async () => {
      mockRepo.findById.mockResolvedValue(mockCita());
      mockRepo.update.mockResolvedValue({ ...mockCita(), estado: 'CONFIRMADA' as EstadoCita });

      const result = await service.updateEstado(1, 'CONFIRMADA');
      expect(result.estado).toBe('CONFIRMADA');
    });
  });

  describe('remove', () => {
    it('elimina la cita si existe', async () => {
      mockRepo.findById.mockResolvedValue(mockCita());
      mockRepo.delete.mockResolvedValue(undefined);

      await service.remove(1);
      expect(mockRepo.delete).toHaveBeenCalledWith(1);
    });

    it('lanza NotFoundException si la cita no existe', async () => {
      mockRepo.findById.mockResolvedValue(null);
      await expect(service.remove(99)).rejects.toThrow(NotFoundException);
    });
  });
});

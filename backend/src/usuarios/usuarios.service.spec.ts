import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UsersService } from './usuarios.service';
import { User } from './entities/user.entity';

const mockUser = (): Partial<User> => ({
  id: 1,
  nombre: 'Ana',
  apellidos: 'García',
  email: 'ana@test.com',
  password: 'hashed',
  rol: 'USER' as any,
});

const mockQueryBuilder: any = {
  select: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  andWhere: jest.fn().mockReturnThis(),
  getMany: jest.fn(),
};

const mockRepo = {
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
};

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: mockRepo },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    jest.clearAllMocks();
    mockRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);
  });

  describe('create', () => {
    it('crea y guarda un usuario', async () => {
      const userData = mockUser();
      mockRepo.create.mockReturnValue(userData);
      mockRepo.save.mockResolvedValue(userData);

      const result = await service.create(userData);
      expect(mockRepo.save).toHaveBeenCalled();
      expect(result.email).toBe('ana@test.com');
    });
  });

  describe('findByEmail', () => {
    it('devuelve el usuario si el email existe', async () => {
      mockRepo.findOne.mockResolvedValue(mockUser());
      const result = await service.findByEmail('ana@test.com');
      expect(result?.email).toBe('ana@test.com');
    });

    it('devuelve null si el email no existe', async () => {
      mockRepo.findOne.mockResolvedValue(null);
      const result = await service.findByEmail('no@existe.com');
      expect(result).toBeNull();
    });
  });

  describe('findOne', () => {
    it('devuelve el usuario si existe', async () => {
      mockRepo.findOne.mockResolvedValue(mockUser());
      const result = await service.findOne(1);
      expect(result.id).toBe(1);
    });

    it('lanza NotFoundException si no existe', async () => {
      mockRepo.findOne.mockResolvedValue(null);
      await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('setResetToken', () => {
    it('llama a update con el hash y la fecha de expiración', async () => {
      mockRepo.update.mockResolvedValue({ affected: 1 });
      const expires = new Date();
      await service.setResetToken(1, 'hashtoken', expires);
      expect(mockRepo.update).toHaveBeenCalledWith(1, {
        resetPasswordToken: 'hashtoken',
        resetPasswordExpires: expires,
      });
    });
  });

  describe('updatePassword', () => {
    it('actualiza la contraseña y borra el token', async () => {
      mockRepo.update.mockResolvedValue({ affected: 1 });
      await service.updatePassword(1, 'newhashed');
      expect(mockRepo.update).toHaveBeenCalledWith(1, {
        password: 'newhashed',
        resetPasswordToken: null,
        resetPasswordExpires: null,
      });
    });
  });

  describe('search', () => {
    it('devuelve lista de usuarios sin filtros', async () => {
      mockQueryBuilder.getMany.mockResolvedValue([mockUser()]);
      const result = await service.search({});
      expect(result).toHaveLength(1);
      expect(mockQueryBuilder.andWhere).not.toHaveBeenCalled();
    });

    it('aplica filtro de rol cuando se especifica', async () => {
      mockQueryBuilder.getMany.mockResolvedValue([]);
      await service.search({ rol: 'ADMIN' });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('u.rol = :rol', { rol: 'ADMIN' });
    });

    it('aplica filtro de búsqueda de texto cuando se especifica', async () => {
      mockQueryBuilder.getMany.mockResolvedValue([mockUser()]);
      await service.search({ search: 'ana' });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        expect.stringContaining('ILIKE'),
        { q: '%ana%' },
      );
    });
  });
});

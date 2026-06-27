import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { MasterService } from './master.service';
import { Company } from '../../entities/company.entity';
import { Project } from '../../entities/project.entity';
import { Module as ModuleEntity } from '../../entities/module.entity';
import { DrawingType } from '../../entities/drawing-type.entity';
import { Discipline } from '../../entities/discipline.entity';
import { User, UserRole } from '../../entities/user.entity';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';
import { CreateDrawingTypeDto } from './dto/create-drawing-type.dto';
import { UpdateDrawingTypeDto } from './dto/update-drawing-type.dto';
import { CreateDisciplineDto } from './dto/create-discipline.dto';
import { UpdateDisciplineDto } from './dto/update-discipline.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('MasterService', () => {
  let masterService: MasterService;
  let companyRepo: any;
  let projectRepo: any;
  let moduleRepo: any;
  let drawingTypeRepo: any;
  let disciplineRepo: any;
  let userRepo: any;

  const mockCompanyRepo = { find: jest.fn(), findOne: jest.fn(), create: jest.fn(), save: jest.fn() };
  const mockProjectRepo = { find: jest.fn(), findOne: jest.fn(), create: jest.fn(), save: jest.fn() };
  const mockModuleRepo = { find: jest.fn(), findOne: jest.fn(), create: jest.fn(), save: jest.fn() };
  const mockDrawingTypeRepo = { find: jest.fn(), findOne: jest.fn(), create: jest.fn(), save: jest.fn() };
  const mockDisciplineRepo = { find: jest.fn(), findOne: jest.fn(), create: jest.fn(), save: jest.fn() };
  const mockUserRepo = { find: jest.fn(), findOne: jest.fn(), create: jest.fn(), save: jest.fn() };

  function makeCompany(overrides = {}) {
    return { id: 'comp-1', name: 'Test Corp', code: 'TC', is_active: true, created_at: new Date(), ...overrides };
  }

  function makeProject(overrides = {}) {
    return {
      id: 'proj-1', name: 'Test Project', code: 'TP', company_id: 'comp-1',
      is_active: true, company: { name: 'Test Corp' }, ...overrides,
    };
  }

  function makeModule(overrides = {}) {
    return {
      id: 'mod-1', name: 'Test Module', code: 'TM', project_id: 'proj-1',
      is_active: true, project: { name: 'Test Project' }, ...overrides,
    };
  }

  function makeDrawingType(overrides = {}) {
    return { id: 'dt-1', name: 'Test DT', code: 'TDT', ...overrides };
  }

  function makeDiscipline(overrides = {}) {
    return { id: 'disc-1', name: 'Test Disc', code: 'TDC', ...overrides };
  }

  function makeUserRow(overrides = {}) {
    return {
      id: 'user-1', name: 'Test User', email: 'test@test.com', password: 'hashed',
      role: UserRole.ENGINEER, is_active: true, created_at: new Date(), updated_at: new Date(),
      ...overrides,
    };
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MasterService,
        { provide: getRepositoryToken(Company), useValue: mockCompanyRepo },
        { provide: getRepositoryToken(Project), useValue: mockProjectRepo },
        { provide: getRepositoryToken(ModuleEntity), useValue: mockModuleRepo },
        { provide: getRepositoryToken(DrawingType), useValue: mockDrawingTypeRepo },
        { provide: getRepositoryToken(Discipline), useValue: mockDisciplineRepo },
        { provide: getRepositoryToken(User), useValue: mockUserRepo },
      ],
    }).compile();

    masterService = module.get<MasterService>(MasterService);
    companyRepo = module.get(getRepositoryToken(Company));
    projectRepo = module.get(getRepositoryToken(Project));
    moduleRepo = module.get(getRepositoryToken(ModuleEntity));
    drawingTypeRepo = module.get(getRepositoryToken(DrawingType));
    disciplineRepo = module.get(getRepositoryToken(Discipline));
    userRepo = module.get(getRepositoryToken(User));

    jest.clearAllMocks();
  });

  // ==================== Companies ====================
  describe('getCompanies', () => {
    it('should return all companies ordered by name ASC', async () => {
      const company = makeCompany();
      mockCompanyRepo.find.mockResolvedValue([company]);
      const result = await masterService.getCompanies();
      expect(result).toEqual([company]);
      expect(mockCompanyRepo.find).toHaveBeenCalledWith({ order: { name: 'ASC' } });
    });

    it('should return empty array when no companies exist', async () => {
      mockCompanyRepo.find.mockResolvedValue([]);
      const result = await masterService.getCompanies();
      expect(result).toEqual([]);
    });
  });

  describe('createCompany', () => {
    const dto: CreateCompanyDto = { name: 'New Corp', code: 'NC' };

    it('should create a company successfully', async () => {
      const company = makeCompany();
      mockCompanyRepo.findOne.mockResolvedValue(null);
      mockCompanyRepo.create.mockReturnValue(company);
      mockCompanyRepo.save.mockResolvedValue(company);

      const result = await masterService.createCompany(dto);
      expect(result).toEqual(company);
      expect(mockCompanyRepo.create).toHaveBeenCalledWith(expect.objectContaining({ name: 'New Corp', code: 'NC' }));
    });

    it('should throw ConflictException when company code already exists', async () => {
      mockCompanyRepo.findOne.mockResolvedValue(makeCompany());

      await expect(masterService.createCompany(dto)).rejects.toThrow(ConflictException);
      await expect(masterService.createCompany(dto)).rejects.toThrow('Company code already exists');
    });
  });

  describe('updateCompany', () => {
    const dto: UpdateCompanyDto = { name: 'Updated Corp', code: 'UC' };

    it('should update a company successfully', async () => {
      const company = makeCompany();
      mockCompanyRepo.findOne.mockResolvedValue(company);
      mockCompanyRepo.save.mockResolvedValue({ ...company, ...dto });

      const result = await masterService.updateCompany('comp-1', dto);
      expect(result.name).toBe('Updated Corp');
      expect(result.code).toBe('UC');
    });

    it('should throw NotFoundException when company not found', async () => {
      mockCompanyRepo.findOne.mockResolvedValue(null);

      await expect(masterService.updateCompany('bad-id', dto)).rejects.toThrow(NotFoundException);
      await expect(masterService.updateCompany('bad-id', dto)).rejects.toThrow('Company not found');
    });

    it('should throw ConflictException when updating to an existing code', async () => {
      mockCompanyRepo.findOne.mockImplementation(({ where }) => {
        if (where.id === 'comp-1') return makeCompany();
        if (where.code === 'UC') return makeCompany({ id: 'comp-2' });
        return null;
      });

      await expect(masterService.updateCompany('comp-1', dto)).rejects.toThrow(ConflictException);
      await expect(masterService.updateCompany('comp-1', dto)).rejects.toThrow('Company code already exists');
    });
  });

  // ==================== Projects ====================
  describe('getProjects', () => {
    it('should return all projects when no filter', async () => {
      const project = makeProject();
      mockProjectRepo.find.mockResolvedValue([project]);
      const result = await masterService.getProjects();
      expect(result).toHaveLength(1);
      expect(result[0].company_name).toBe('Test Corp');
      expect(result[0].company).toBeUndefined();
    });

    it('should filter projects by company_id', async () => {
      mockProjectRepo.find.mockResolvedValue([makeProject()]);
      await masterService.getProjects('comp-1');
      expect(mockProjectRepo.find).toHaveBeenCalledWith(expect.objectContaining({ where: { company_id: 'comp-1' } }));
    });
  });

  describe('createProject', () => {
    const dto: CreateProjectDto = { name: 'New Project', code: 'NP', company_id: 'comp-1' };

    it('should create a project successfully', async () => {
      const company = makeCompany();
      mockCompanyRepo.findOne.mockResolvedValue(company);
      mockProjectRepo.create.mockReturnValue(makeProject());
      mockProjectRepo.save.mockResolvedValue(makeProject());

      const result = await masterService.createProject(dto);
      expect(result.company_name).toBe('Test Corp');
    });

    it('should throw NotFoundException when company not found', async () => {
      mockCompanyRepo.findOne.mockResolvedValue(null);

      await expect(masterService.createProject(dto)).rejects.toThrow(NotFoundException);
      await expect(masterService.createProject(dto)).rejects.toThrow('Company not found');
    });
  });

  describe('updateProject', () => {
    const dto: UpdateProjectDto = { name: 'Updated Project', company_id: 'comp-1' };

    it('should update a project successfully', async () => {
      const company = makeCompany();
      mockProjectRepo.findOne.mockResolvedValueOnce(makeProject()).mockResolvedValueOnce(makeProject({ company }));
      mockCompanyRepo.findOne.mockResolvedValue(company);
      mockProjectRepo.save.mockResolvedValue(makeProject());

      const result = await masterService.updateProject('proj-1', dto);
      expect(result).toBeDefined();
    });

    it('should throw NotFoundException when project not found', async () => {
      mockProjectRepo.findOne.mockResolvedValue(null);

      await expect(masterService.updateProject('bad-id', dto)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when referenced company not found', async () => {
      mockProjectRepo.findOne.mockResolvedValue(makeProject());
      mockCompanyRepo.findOne.mockResolvedValue(null);

      await expect(masterService.updateProject('proj-1', dto)).rejects.toThrow(NotFoundException);
      await expect(masterService.updateProject('proj-1', dto)).rejects.toThrow('Company not found');
    });
  });

  // ==================== Modules ====================
  describe('getModules', () => {
    it('should return all modules when no filter', async () => {
      const mod = makeModule();
      mockModuleRepo.find.mockResolvedValue([mod]);
      const result = await masterService.getModules();
      expect(result[0].project_name).toBe('Test Project');
      expect(result[0].project).toBeUndefined();
    });
  });

  describe('createModule', () => {
    const dto: CreateModuleDto = { name: 'New Module', code: 'NM', project_id: 'proj-1' };

    it('should create a module successfully', async () => {
      const project = makeProject();
      mockProjectRepo.findOne.mockResolvedValue(project);
      mockModuleRepo.create.mockReturnValue(makeModule());
      mockModuleRepo.save.mockResolvedValue(makeModule());

      const result = await masterService.createModule(dto);
      expect(result.project_name).toBe('Test Project');
    });

    it('should throw NotFoundException when project not found', async () => {
      mockProjectRepo.findOne.mockResolvedValue(null);
      await expect(masterService.createModule(dto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateModule', () => {
    const dto: UpdateModuleDto = { name: 'Updated Module' };

    it('should update a module successfully', async () => {
      mockModuleRepo.findOne.mockResolvedValueOnce(makeModule()).mockResolvedValueOnce(makeModule());
      mockModuleRepo.save.mockResolvedValue(makeModule());

      const result = await masterService.updateModule('mod-1', dto);
      expect(result).toBeDefined();
    });

    it('should throw NotFoundException when module not found', async () => {
      mockModuleRepo.findOne.mockResolvedValue(null);
      await expect(masterService.updateModule('bad-id', dto)).rejects.toThrow(NotFoundException);
    });
  });

  // ==================== Drawing Types ====================
  describe('getDrawingTypes', () => {
    it('should return all drawing types', async () => {
      const dt = makeDrawingType();
      mockDrawingTypeRepo.find.mockResolvedValue([dt]);
      const result = await masterService.getDrawingTypes();
      expect(result).toEqual([dt]);
    });
  });

  describe('createDrawingType', () => {
    const dto: CreateDrawingTypeDto = { name: 'New DT', code: 'NDT' };

    it('should create a drawing type successfully', async () => {
      const dt = makeDrawingType();
      mockDrawingTypeRepo.findOne.mockResolvedValue(null);
      mockDrawingTypeRepo.create.mockReturnValue(dt);
      mockDrawingTypeRepo.save.mockResolvedValue(dt);

      const result = await masterService.createDrawingType(dto);
      expect(result).toEqual(dt);
    });

    it('should throw ConflictException when code already exists', async () => {
      mockDrawingTypeRepo.findOne.mockResolvedValue(makeDrawingType());
      await expect(masterService.createDrawingType(dto)).rejects.toThrow(ConflictException);
    });
  });

  describe('updateDrawingType', () => {
    const dto: UpdateDrawingTypeDto = { name: 'Updated DT' };

    it('should update a drawing type successfully', async () => {
      const dt = makeDrawingType();
      mockDrawingTypeRepo.findOne.mockResolvedValue(dt);
      mockDrawingTypeRepo.save.mockResolvedValue({ ...dt, ...dto });

      const result = await masterService.updateDrawingType('dt-1', dto);
      expect(result.name).toBe('Updated DT');
    });

    it('should throw NotFoundException when not found', async () => {
      mockDrawingTypeRepo.findOne.mockResolvedValue(null);
      await expect(masterService.updateDrawingType('bad-id', dto)).rejects.toThrow(NotFoundException);
    });
  });

  // ==================== Disciplines ====================
  describe('getDisciplines', () => {
    it('should return all disciplines', async () => {
      const disc = makeDiscipline();
      mockDisciplineRepo.find.mockResolvedValue([disc]);
      const result = await masterService.getDisciplines();
      expect(result).toEqual([disc]);
    });
  });

  describe('createDiscipline', () => {
    const dto: CreateDisciplineDto = { name: 'New Disc', code: 'NDC' };

    it('should create a discipline successfully', async () => {
      const disc = makeDiscipline();
      mockDisciplineRepo.findOne.mockResolvedValue(null);
      mockDisciplineRepo.create.mockReturnValue(disc);
      mockDisciplineRepo.save.mockResolvedValue(disc);

      const result = await masterService.createDiscipline(dto);
      expect(result).toEqual(disc);
    });

    it('should throw ConflictException when code already exists', async () => {
      mockDisciplineRepo.findOne.mockResolvedValue(makeDiscipline());
      await expect(masterService.createDiscipline(dto)).rejects.toThrow(ConflictException);
    });
  });

  describe('updateDiscipline', () => {
    const dto: UpdateDisciplineDto = { name: 'Updated Disc' };

    it('should update a discipline successfully', async () => {
      const disc = makeDiscipline();
      mockDisciplineRepo.findOne.mockResolvedValue(disc);
      mockDisciplineRepo.save.mockResolvedValue({ ...disc, ...dto });

      const result = await masterService.updateDiscipline('disc-1', dto);
      expect(result.name).toBe('Updated Disc');
    });

    it('should throw NotFoundException when not found', async () => {
      mockDisciplineRepo.findOne.mockResolvedValue(null);
      await expect(masterService.updateDiscipline('bad-id', dto)).rejects.toThrow(NotFoundException);
    });
  });

  // ==================== Users ====================
  describe('getUsers', () => {
    it('should return all users when no role filter', async () => {
      const user = makeUserRow();
      mockUserRepo.find.mockResolvedValue([user]);
      const result = await masterService.getUsers();
      expect(result).toEqual([user]);
    });

    it('should filter users by role', async () => {
      mockUserRepo.find.mockResolvedValue([makeUserRow()]);
      await masterService.getUsers('engineer');
      expect(mockUserRepo.find).toHaveBeenCalledWith(expect.objectContaining({ where: { role: 'engineer' } }));
    });
  });

  describe('createUser', () => {
    const dto: CreateUserDto = { name: 'New User', email: 'new@test.com', role: UserRole.DRAFTER };

    it('should create a user successfully', async () => {
      const user = makeUserRow();
      mockUserRepo.findOne.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-pw');
      mockUserRepo.create.mockReturnValue(user);
      mockUserRepo.save.mockResolvedValue(user);

      const result = await masterService.createUser(dto);
      expect(result.password).toBeUndefined();
    });

    it('should throw ConflictException when email already exists', async () => {
      mockUserRepo.findOne.mockResolvedValue(makeUserRow());

      await expect(masterService.createUser(dto)).rejects.toThrow(ConflictException);
      await expect(masterService.createUser(dto)).rejects.toThrow('Email already exists');
    });

    it('should use default password when not provided', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-pw');
      mockUserRepo.create.mockReturnValue(makeUserRow());
      mockUserRepo.save.mockResolvedValue(makeUserRow());

      await masterService.createUser(dto);
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
    });
  });

  describe('updateUser', () => {
    const dto: UpdateUserDto = { name: 'Updated User', email: 'updated@test.com' };

    it('should update a user successfully', async () => {
      const user = makeUserRow();
      mockUserRepo.findOne.mockResolvedValue(user);
      mockUserRepo.save.mockResolvedValue({ ...user, ...dto });

      const result = await masterService.updateUser('user-1', dto);
      expect(result.password).toBeUndefined();
    });

    it('should throw NotFoundException when user not found', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);
      await expect(masterService.updateUser('bad-id', dto)).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException when email is taken by another user', async () => {
      mockUserRepo.findOne.mockImplementation(({ where }) => {
        if (where.id === 'user-1') return makeUserRow();
        if (where.email === 'updated@test.com') return makeUserRow({ id: 'user-2', email: 'updated@test.com' });
        return null;
      });

      await expect(masterService.updateUser('user-1', dto)).rejects.toThrow(ConflictException);
      await expect(masterService.updateUser('user-1', dto)).rejects.toThrow('Email already exists');
    });

    it('should hash password when updating password', async () => {
      const user = makeUserRow();
      const dtoWithPw: UpdateUserDto = { password: 'newpassword123' };
      mockUserRepo.findOne.mockResolvedValue(user);
      (bcrypt.hash as jest.Mock).mockResolvedValue('new-hashed-pw');
      mockUserRepo.save.mockResolvedValue({ ...user, password: 'new-hashed-pw' });

      await masterService.updateUser('user-1', dtoWithPw);
      expect(bcrypt.hash).toHaveBeenCalledWith('newpassword123', 10);
    });
  });
});

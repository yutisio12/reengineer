import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { Company } from '../../entities/company.entity';
import { Project } from '../../entities/project.entity';
import { Module as ModuleEntity } from '../../entities/module.entity';
import { DrawingType } from '../../entities/drawing-type.entity';
import { Discipline } from '../../entities/discipline.entity';
import { User } from '../../entities/user.entity';
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

@Injectable()
export class MasterService {
  constructor(
    @InjectRepository(Company) private companyRepo: Repository<Company>,
    @InjectRepository(Project) private projectRepo: Repository<Project>,
    @InjectRepository(ModuleEntity) private moduleRepo: Repository<ModuleEntity>,
    @InjectRepository(DrawingType) private drawingTypeRepo: Repository<DrawingType>,
    @InjectRepository(Discipline) private disciplineRepo: Repository<Discipline>,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  // Companies
  async getCompanies(): Promise<Company[]> {
    return this.companyRepo.find({ order: { name: 'ASC' } });
  }

  async createCompany(dto: CreateCompanyDto): Promise<Company> {
    const existing = await this.companyRepo.findOne({ where: { code: dto.code } });
    if (existing) throw new ConflictException('Company code already exists');
    const company = this.companyRepo.create({ id: uuidv4(), ...dto });
    return this.companyRepo.save(company);
  }

  async updateCompany(id: string, dto: UpdateCompanyDto): Promise<Company> {
    const company = await this.companyRepo.findOne({ where: { id } });
    if (!company) throw new NotFoundException('Company not found');
    if (dto.code) {
      const existing = await this.companyRepo.findOne({ where: { code: dto.code } });
      if (existing && existing.id !== id) throw new ConflictException('Company code already exists');
    }
    Object.assign(company, dto);
    return this.companyRepo.save(company);
  }

  // Projects
  async getProjects(company_id?: string) {
    const where = company_id ? { company_id } : {};
    const projects = await this.projectRepo.find({
      where,
      relations: { company: true },
      order: { name: 'ASC' },
    });
    return projects.map((p) => ({
      ...p,
      company_name: p.company?.name || null,
      company: undefined,
    }));
  }

  async createProject(dto: CreateProjectDto) {
    const company = await this.companyRepo.findOne({ where: { id: dto.company_id } });
    if (!company) throw new NotFoundException('Company not found');
    const project = this.projectRepo.create({ id: uuidv4(), ...dto });
    const saved = await this.projectRepo.save(project);
    return {
      ...saved,
      company_name: company.name,
    };
  }

  async updateProject(id: string, dto: UpdateProjectDto) {
    const project = await this.projectRepo.findOne({ where: { id } });
    if (!project) throw new NotFoundException('Project not found');
    if (dto.company_id) {
      const company = await this.companyRepo.findOne({ where: { id: dto.company_id } });
      if (!company) throw new NotFoundException('Company not found');
    }
    Object.assign(project, dto);
    await this.projectRepo.save(project);
    const updated = await this.projectRepo.findOne({ where: { id }, relations: { company: true } });
    return {
      ...updated,
      company_name: updated?.company?.name || null,
      company: undefined,
    };
  }

  // Modules
  async getModules(project_id?: string) {
    const where = project_id ? { project_id } : {};
    const modules = await this.moduleRepo.find({
      where,
      relations: { project: true },
      order: { name: 'ASC' },
    });
    return modules.map((m) => ({
      ...m,
      project_name: m.project?.name || null,
      project: undefined,
    }));
  }

  async createModule(dto: CreateModuleDto) {
    const project = await this.projectRepo.findOne({ where: { id: dto.project_id } });
    if (!project) throw new NotFoundException('Project not found');
    const mod = this.moduleRepo.create({ id: uuidv4(), ...dto });
    const saved = await this.moduleRepo.save(mod);
    return {
      ...saved,
      project_name: project.name,
    };
  }

  async updateModule(id: string, dto: UpdateModuleDto) {
    const mod = await this.moduleRepo.findOne({ where: { id } });
    if (!mod) throw new NotFoundException('Module not found');
    if (dto.project_id) {
      const project = await this.projectRepo.findOne({ where: { id: dto.project_id } });
      if (!project) throw new NotFoundException('Project not found');
    }
    Object.assign(mod, dto);
    await this.moduleRepo.save(mod);
    const updated = await this.moduleRepo.findOne({ where: { id }, relations: { project: true } });
    return {
      ...updated,
      project_name: updated?.project?.name || null,
      project: undefined,
    };
  }

  // Drawing Types
  async getDrawingTypes(): Promise<DrawingType[]> {
    return this.drawingTypeRepo.find({ order: { name: 'ASC' } });
  }

  async createDrawingType(dto: CreateDrawingTypeDto): Promise<DrawingType> {
    const existing = await this.drawingTypeRepo.findOne({ where: { code: dto.code } });
    if (existing) throw new ConflictException('Drawing type code already exists');
    const dt = this.drawingTypeRepo.create({ id: uuidv4(), ...dto });
    return this.drawingTypeRepo.save(dt);
  }

  async updateDrawingType(id: string, dto: UpdateDrawingTypeDto): Promise<DrawingType> {
    const dt = await this.drawingTypeRepo.findOne({ where: { id } });
    if (!dt) throw new NotFoundException('Drawing type not found');
    Object.assign(dt, dto);
    return this.drawingTypeRepo.save(dt);
  }

  // Disciplines
  async getDisciplines(): Promise<Discipline[]> {
    return this.disciplineRepo.find({ order: { name: 'ASC' } });
  }

  async createDiscipline(dto: CreateDisciplineDto): Promise<Discipline> {
    const existing = await this.disciplineRepo.findOne({ where: { code: dto.code } });
    if (existing) throw new ConflictException('Discipline code already exists');
    const disc = this.disciplineRepo.create({ id: uuidv4(), ...dto });
    return this.disciplineRepo.save(disc);
  }

  async updateDiscipline(id: string, dto: UpdateDisciplineDto): Promise<Discipline> {
    const disc = await this.disciplineRepo.findOne({ where: { id } });
    if (!disc) throw new NotFoundException('Discipline not found');
    Object.assign(disc, dto);
    return this.disciplineRepo.save(disc);
  }

  // Users
  async getUsers(role?: string): Promise<User[]> {
    const where = role ? { role: role as any } : {};
    return this.userRepo.find({
      where,
      order: { name: 'ASC' },
    });
  }

  async createUser(dto: CreateUserDto): Promise<Omit<User, 'password'>> {
    const existing = await this.userRepo.findOne({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already exists');
    const password = dto.password || 'password123';
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.userRepo.create({
      id: uuidv4(),
      ...dto,
      password: hashedPassword,
    });
    const saved = await this.userRepo.save(user);
    const { password: _, ...result } = saved;
    return result;
  }

  async updateUser(id: string, dto: UpdateUserDto): Promise<Omit<User, 'password'>> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    if (dto.email) {
      const existing = await this.userRepo.findOne({ where: { email: dto.email } });
      if (existing && existing.id !== id) throw new ConflictException('Email already exists');
    }
    if (dto.password) {
      dto.password = await bcrypt.hash(dto.password, 10);
    }
    Object.assign(user, dto);
    const saved = await this.userRepo.save(user);
    const { password: _, ...result } = saved;
    return result;
  }
}

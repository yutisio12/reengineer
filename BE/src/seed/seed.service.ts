import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Company } from '../entities/company.entity';
import { Project } from '../entities/project.entity';
import { Module as ModuleEntity } from '../entities/module.entity';
import { DrawingType } from '../entities/drawing-type.entity';
import { Discipline } from '../entities/discipline.entity';
import { Drawing } from '../entities/drawing.entity';
import {
  SEED_USERS, SEED_COMPANIES, SEED_PROJECTS, SEED_MODULES,
  SEED_DRAWING_TYPES, SEED_DISCIPLINES, SEED_DRAWINGS,
} from './seed-data';

@Injectable()
export class SeedService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Company) private companyRepo: Repository<Company>,
    @InjectRepository(Project) private projectRepo: Repository<Project>,
    @InjectRepository(ModuleEntity) private moduleRepo: Repository<ModuleEntity>,
    @InjectRepository(DrawingType) private drawingTypeRepo: Repository<DrawingType>,
    @InjectRepository(Discipline) private disciplineRepo: Repository<Discipline>,
    @InjectRepository(Drawing) private drawingRepo: Repository<Drawing>,
  ) {}

  async seed() {
    const userCount = await this.userRepo.count();
    if (userCount > 0) {
      return { message: 'Seed data already exists' };
    }

    await this.userRepo.save(SEED_USERS as any);
    await this.companyRepo.save(SEED_COMPANIES as any);
    await this.projectRepo.save(SEED_PROJECTS as any);
    await this.moduleRepo.save(SEED_MODULES as any);
    await this.drawingTypeRepo.save(SEED_DRAWING_TYPES as any);
    await this.disciplineRepo.save(SEED_DISCIPLINES as any);
    await this.drawingRepo.save(SEED_DRAWINGS as any);

    return { message: 'Seed data created successfully' };
  }
}

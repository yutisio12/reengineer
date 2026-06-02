import { Module as NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed.service';
import { User } from '../entities/user.entity';
import { Company } from '../entities/company.entity';
import { Project } from '../entities/project.entity';
import { Module as ModuleEntity } from '../entities/module.entity';
import { DrawingType } from '../entities/drawing-type.entity';
import { Discipline } from '../entities/discipline.entity';
import { Drawing } from '../entities/drawing.entity';

@NestModule({
  imports: [
    TypeOrmModule.forFeature([User, Company, Project, ModuleEntity, DrawingType, Discipline, Drawing]),
  ],
  providers: [SeedService],
  exports: [SeedService],
})
export class SeedModule {}

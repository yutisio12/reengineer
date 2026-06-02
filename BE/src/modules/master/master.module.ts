import { Module as NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MasterController } from './master.controller';
import { MasterService } from './master.service';
import { Company } from '../../entities/company.entity';
import { Project } from '../../entities/project.entity';
import { Module as ModuleEntity } from '../../entities/module.entity';
import { DrawingType } from '../../entities/drawing-type.entity';
import { Discipline } from '../../entities/discipline.entity';
import { User } from '../../entities/user.entity';

@NestModule({
  imports: [
    TypeOrmModule.forFeature([Company, Project, ModuleEntity, DrawingType, Discipline, User]),
  ],
  controllers: [MasterController],
  providers: [MasterService],
})
export class MasterModule {}

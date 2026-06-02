import {
  Entity, PrimaryColumn, Column, ManyToOne, JoinColumn, OneToMany,
} from 'typeorm';
import { Company } from './company.entity';
import { Project } from './project.entity';
import { Module } from './module.entity';
import { Discipline } from './discipline.entity';
import { DrawingType } from './drawing-type.entity';
import { User } from './user.entity';
import { DrawingActivity } from './drawing-activity.entity';
import { DrawingRevision } from './drawing-revision.entity';

@Entity('drawings')
export class Drawing {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ length: 100, unique: true })
  document_no: string;

  @Column('text', { nullable: true })
  description: string;

  @Column({ length: 30 })
  status: string;

  @Column('uuid')
  company_id: string;

  @ManyToOne(() => Company)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Column('uuid')
  project_id: string;

  @ManyToOne(() => Project)
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @Column('uuid')
  module_id: string;

  @ManyToOne(() => Module)
  @JoinColumn({ name: 'module_id' })
  module: Module;

  @Column('uuid')
  discipline_id: string;

  @ManyToOne(() => Discipline)
  @JoinColumn({ name: 'discipline_id' })
  discipline: Discipline;

  @Column('uuid')
  drawing_type_id: string;

  @ManyToOne(() => DrawingType)
  @JoinColumn({ name: 'drawing_type_id' })
  drawing_type: DrawingType;

  @Column('uuid')
  created_by: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @Column('uuid')
  assigned_drafter: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'assigned_drafter' })
  drafter: User;

  @Column({ type: 'timestamp', default: () => 'NOW()' })
  created_at: Date;

  @Column({ type: 'timestamp', default: () => 'NOW()' })
  updated_at: Date;

  @OneToMany(() => DrawingActivity, (a) => a.drawing)
  activities: DrawingActivity[];

  @OneToMany(() => DrawingRevision, (r) => r.drawing)
  revisions: DrawingRevision[];
}

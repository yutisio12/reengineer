import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Project } from './project.entity';

@Entity('master_modules')
export class Module {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 50 })
  code: string;

  @Column('uuid')
  project_id: string;

  @ManyToOne(() => Project, (p) => p.modules)
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @Column({ default: true })
  is_active: boolean;

  @Column({ type: 'timestamp', default: () => 'NOW()' })
  created_at: Date;
}

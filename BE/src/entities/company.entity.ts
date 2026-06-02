import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';
import { Project } from './project.entity';

@Entity('master_companies')
export class Company {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 50, unique: true })
  code: string;

  @Column({ default: true })
  is_active: boolean;

  @Column({ type: 'timestamp', default: () => 'NOW()' })
  created_at: Date;

  @OneToMany(() => Project, (p) => p.company)
  projects: Project[];
}

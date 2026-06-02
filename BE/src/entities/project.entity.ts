import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Company } from './company.entity';
import { Module } from './module.entity';

@Entity('master_projects')
export class Project {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 50, unique: true })
  code: string;

  @Column('uuid')
  company_id: string;

  @ManyToOne(() => Company, (c) => c.projects)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Column({ default: true })
  is_active: boolean;

  @Column({ type: 'timestamp', default: () => 'NOW()' })
  created_at: Date;

  @OneToMany(() => Module, (m) => m.project)
  modules: Module[];
}

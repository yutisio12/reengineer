import {
  Entity, PrimaryColumn, Column, OneToMany,
} from 'typeorm';
import { Drawing } from './drawing.entity';
import { DrawingActivity } from './drawing-activity.entity';
import { DrawingRevision } from './drawing-revision.entity';
import { TransmitLog } from './transmit-log.entity';

export enum UserRole {
  ADMIN = 'admin',
  DRAFTER = 'drafter',
  CHECKER = 'checker',
  ENGINEER = 'engineer',
}

@Entity('master_users')
export class User {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 100, unique: true })
  email: string;

  @Column({ length: 255 })
  password: string;

  @Column({ type: 'enum', enum: UserRole })
  role: UserRole;

  @Column({ default: true })
  is_active: boolean;

  @Column({ type: 'timestamp', default: () => 'NOW()' })
  created_at: Date;

  @Column({ type: 'timestamp', default: () => 'NOW()' })
  updated_at: Date;

  @OneToMany(() => Drawing, (d) => d.created_by)
  created_drawings: Drawing[];

  @OneToMany(() => Drawing, (d) => d.assigned_drafter)
  assigned_drawings: Drawing[];

  @OneToMany(() => DrawingActivity, (a) => a.user)
  activities: DrawingActivity[];

  @OneToMany(() => DrawingRevision, (r) => r.created_by)
  revisions: DrawingRevision[];

  @OneToMany(() => TransmitLog, (t) => t.transmitted_by)
  transmit_logs: TransmitLog[];
}

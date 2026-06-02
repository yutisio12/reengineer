import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Drawing } from './drawing.entity';
import { User } from './user.entity';
import { RevisionFile } from './revision-file.entity';

@Entity('drawing_revisions')
export class DrawingRevision {
  @PrimaryColumn('uuid')
  id: string;

  @Column('uuid')
  drawing_id: string;

  @ManyToOne(() => Drawing, (d) => d.revisions)
  @JoinColumn({ name: 'drawing_id' })
  drawing: Drawing;

  @Column({ length: 20 })
  revision_no: string;

  @Column('text')
  description: string;

  @Column('uuid')
  created_by: string;

  @ManyToOne(() => User, (u) => u.revisions)
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @Column({ type: 'timestamp', default: () => 'NOW()' })
  created_at: Date;

  @OneToMany(() => RevisionFile, (f) => f.revision)
  files: RevisionFile[];
}

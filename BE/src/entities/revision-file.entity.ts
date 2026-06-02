import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { DrawingRevision } from './drawing-revision.entity';

@Entity('revision_files')
export class RevisionFile {
  @PrimaryColumn('uuid')
  id: string;

  @Column('uuid')
  revision_id: string;

  @ManyToOne(() => DrawingRevision, (r) => r.files)
  @JoinColumn({ name: 'revision_id' })
  revision: DrawingRevision;

  @Column({ length: 255 })
  file_name: string;

  @Column({ length: 500 })
  file_path: string;

  @Column({ length: 100 })
  file_type: string;

  @Column()
  file_size: number;

  @Column({ type: 'timestamp', default: () => 'NOW()' })
  uploaded_at: Date;
}

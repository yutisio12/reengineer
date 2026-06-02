import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('master_disciplines')
export class Discipline {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 50, unique: true })
  code: string;
}

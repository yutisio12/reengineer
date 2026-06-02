import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('master_drawing_types')
export class DrawingType {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 50, unique: true })
  code: string;
}

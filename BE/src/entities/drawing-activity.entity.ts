import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Drawing } from './drawing.entity';
import { User } from './user.entity';

@Entity('drawing_activities')
export class DrawingActivity {
  @PrimaryColumn('uuid')
  id: string;

  @Column('uuid')
  drawing_id: string;

  @ManyToOne(() => Drawing, (d) => d.activities)
  @JoinColumn({ name: 'drawing_id' })
  drawing: Drawing;

  @Column('uuid')
  user_id: string;

  @ManyToOne(() => User, (u) => u.activities)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ length: 30 })
  action: string;

  @Column({ length: 30 })
  stage: string;

  @Column('text', { nullable: true })
  return_reason: string;

  @Column({ type: 'timestamp', default: () => 'NOW()' })
  action_time: Date;
}

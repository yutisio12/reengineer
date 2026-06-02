import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { TransmitDrawing } from './transmit-drawing.entity';

@Entity('transmit_logs')
export class TransmitLog {
  @PrimaryColumn('uuid')
  id: string;

  @Column('uuid')
  transmitted_by: string;

  @ManyToOne(() => User, (u) => u.transmit_logs)
  @JoinColumn({ name: 'transmitted_by' })
  transmitter: User;

  @Column('text', { nullable: true })
  notes: string;

  @Column({ type: 'timestamp', default: () => 'NOW()' })
  transmitted_at: Date;

  @OneToMany(() => TransmitDrawing, (td) => td.transmit_log)
  transmit_drawings: TransmitDrawing[];
}

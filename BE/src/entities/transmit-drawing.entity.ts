import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { TransmitLog } from './transmit-log.entity';
import { Drawing } from './drawing.entity';

@Entity('transmit_drawings')
export class TransmitDrawing {
  @PrimaryColumn('uuid')
  id: string;

  @Column('uuid')
  transmit_log_id: string;

  @ManyToOne(() => TransmitLog, (tl) => tl.transmit_drawings)
  @JoinColumn({ name: 'transmit_log_id' })
  transmit_log: TransmitLog;

  @Column('uuid')
  drawing_id: string;

  @ManyToOne(() => Drawing)
  @JoinColumn({ name: 'drawing_id' })
  drawing: Drawing;
}

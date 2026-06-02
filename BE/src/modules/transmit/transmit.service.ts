import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Drawing } from '../../entities/drawing.entity';
import { TransmitLog } from '../../entities/transmit-log.entity';
import { TransmitDrawing } from '../../entities/transmit-drawing.entity';
import { TransmitDto } from './dto/transmit.dto';

@Injectable()
export class TransmitService {
  constructor(
    @InjectRepository(Drawing)
    private drawingRepo: Repository<Drawing>,
    @InjectRepository(TransmitLog)
    private transmitLogRepo: Repository<TransmitLog>,
    @InjectRepository(TransmitDrawing)
    private transmitDrawingRepo: Repository<TransmitDrawing>,
  ) {}

  async getTransmittableDrawings(): Promise<Drawing[]> {
    return this.drawingRepo.find({
      where: { status: 'fully_approved' },
      relations: { company: true, project: true, module: true, discipline: true, drawing_type: true, creator: true, drafter: true },
      order: { document_no: 'ASC' },
    });
  }

  async transmit(dto: TransmitDto, userId: string) {
    const drawings = await this.drawingRepo.find({
      where: { id: In(dto.drawing_ids) },
    });

    if (drawings.length !== dto.drawing_ids.length) {
      throw new NotFoundException('Some drawings were not found');
    }

    const invalidDrawings = drawings.filter((d) => d.status !== 'fully_approved');
    if (invalidDrawings.length > 0) {
      throw new BadRequestException(
        `Drawings must be in 'fully_approved' status: ${invalidDrawings.map((d) => d.document_no).join(', ')}`,
      );
    }

    const savedLog = await this.transmitLogRepo.save({
      id: uuidv4(),
      transmitted_by: userId,
      notes: dto.notes || null,
    } as any);

    for (const drawing of drawings) {
      drawing.status = 'transmitted';
      drawing.updated_at = new Date();
      await this.drawingRepo.save(drawing);

      await this.transmitDrawingRepo.save({
        id: uuidv4(),
        transmit_log_id: savedLog.id,
        drawing_id: drawing.id,
      } as any);
    }

    const fullLog = await this.transmitLogRepo.findOne({
      where: { id: savedLog.id },
      relations: { transmitter: true, transmit_drawings: { drawing: true } },
    });

    const updatedDrawings = await this.drawingRepo.find({
      where: { id: In(dto.drawing_ids) },
      relations: { company: true, project: true, module: true, discipline: true, drawing_type: true, creator: true, drafter: true },
    });

    return { transmit_log: fullLog, drawings: updatedDrawings };
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Drawing } from '../../entities/drawing.entity';
import { DrawingRevision } from '../../entities/drawing-revision.entity';
import { DrawingActivity } from '../../entities/drawing-activity.entity';
import { RaiseRevisionDto } from './dto/raise-revision.dto';

@Injectable()
export class ProductionService {
  constructor(
    @InjectRepository(Drawing)
    private drawingRepo: Repository<Drawing>,
    @InjectRepository(DrawingRevision)
    private revisionRepo: Repository<DrawingRevision>,
    @InjectRepository(DrawingActivity)
    private activityRepo: Repository<DrawingActivity>,
  ) {}

  async getProductionDrawings(
    company_id?: string,
    project_id?: string,
    module_id?: string,
    search?: string,
  ): Promise<Drawing[]> {
    const where: any = { status: 'transmitted' };
    if (company_id) where.company_id = company_id;
    if (project_id) where.project_id = project_id;
    if (module_id) where.module_id = module_id;
    if (search) where.document_no = Like(`%${search}%`);

    return this.drawingRepo.find({
      where,
      relations: { company: true, project: true, module: true, discipline: true, drawing_type: true, creator: true, drafter: true },
      order: { document_no: 'ASC' },
    });
  }

  async raiseRevision(
    id: string,
    dto: RaiseRevisionDto,
    userId: string,
  ): Promise<Drawing> {
    const drawing = await this.drawingRepo.findOne({
      where: { id },
      relations: { company: true, project: true, module: true, discipline: true, drawing_type: true, creator: true, drafter: true },
    });
    if (!drawing) throw new NotFoundException('Drawing not found');

    if (drawing.status !== 'transmitted') {
      throw new NotFoundException('Only transmitted drawings can be raised for revision');
    }

    const revision = this.revisionRepo.create({
      id: uuidv4(),
      drawing_id: id,
      revision_no: dto.revision_no,
      description: dto.description,
      created_by: userId,
    });
    await this.revisionRepo.save(revision);

    drawing.status = 'in_progress_drafter';
    drawing.updated_at = new Date();
    await this.drawingRepo.save(drawing);

    const activity = this.activityRepo.create({
      id: uuidv4(),
      drawing_id: id,
      user_id: userId,
      action: 'start',
      stage: 'drafter',
    });
    await this.activityRepo.save(activity);

    return (await this.drawingRepo.findOne({
      where: { id },
      relations: { company: true, project: true, module: true, discipline: true, drawing_type: true, creator: true, drafter: true },
    }))!;
  }
}

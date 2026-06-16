import {
  Injectable, NotFoundException, BadRequestException, ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Drawing } from '../../entities/drawing.entity';
import { DrawingActivity } from '../../entities/drawing-activity.entity';
import { DrawingRevision } from '../../entities/drawing-revision.entity';
import { RevisionFile } from '../../entities/revision-file.entity';
import { CreateDrawingDto } from './dto/create-drawing.dto';
import { UpdateDrawingDto } from './dto/update-drawing.dto';
import { DrawingActionDto } from './dto/drawing-action.dto';
import { CreateRevisionDto } from './dto/create-revision.dto';
import { QueryDrawingDto } from './dto/query-drawing.dto';

const VALID_TRANSITIONS: Record<string, Record<string, string>> = {
  assigned: { 'start:drafter': 'in_progress_drafter' },
  in_progress_drafter: {
    'stop:drafter': 'in_progress_drafter',
    'submit:checker': 'in_progress_checker',
  },
  in_progress_checker: {
    'stop:checker': 'in_progress_checker',
    'submit:engineer': 'in_progress_engineer',
    'return:drafter': 'in_progress_drafter',
  },
  in_progress_engineer: {
    'stop:engineer': 'in_progress_engineer',
    'approve:engineer': 'fully_approved',
    'return:checker': 'in_progress_checker',
  },
};

@Injectable()
export class DrawingService {
  constructor(
    @InjectRepository(Drawing)
    private drawingRepo: Repository<Drawing>,
    @InjectRepository(DrawingActivity)
    private activityRepo: Repository<DrawingActivity>,
    @InjectRepository(DrawingRevision)
    private revisionRepo: Repository<DrawingRevision>,
    @InjectRepository(RevisionFile)
    private fileRepo: Repository<RevisionFile>,
  ) {}

  async findAll(query: QueryDrawingDto) {
    const {
      company_id, project_id, discipline_id, drawing_type_id,
      module_id, status, search, page = 1, per_page = 20,
    } = query;

    const where: any = {};
    if (company_id) where.company_id = company_id;
    if (project_id) where.project_id = project_id;
    if (discipline_id) where.discipline_id = discipline_id;
    if (drawing_type_id) where.drawing_type_id = drawing_type_id;
    if (module_id) where.module_id = module_id;
    if (status) where.status = status;
    if (search) where.document_no = Like(`%${search}%`);

    const [data, total] = await this.drawingRepo.findAndCount({
      where,
      relations: { company: true, project: true, module: true, discipline: true, drawing_type: true, creator: true, drafter: true },
      order: { created_at: 'DESC' },
      skip: (page - 1) * per_page,
      take: per_page,
    });

    return {
      data,
      total,
      page,
      per_page,
      total_pages: Math.ceil(total / per_page),
    };
  }

  async findOne(id: string): Promise<Drawing> {
    const drawing = await this.drawingRepo.findOne({
      where: { id },
      relations: { company: true, project: true, module: true, discipline: true, drawing_type: true, creator: true, drafter: true },
    });
    if (!drawing) throw new NotFoundException('Drawing not found');
    return drawing;
  }

  async create(dto: CreateDrawingDto, userId: string): Promise<Drawing> {
    const existing = await this.drawingRepo.findOne({ where: { document_no: dto.document_no } });
    if (existing) throw new ConflictException('Document number already exists');

    const drawing = this.drawingRepo.create({
      id: uuidv4(),
      ...dto,
      status: 'assigned',
      created_by: userId,
    });
    return this.drawingRepo.save(drawing);
  }

  async update(id: string, dto: UpdateDrawingDto): Promise<Drawing> {
    const drawing = await this.drawingRepo.findOne({ where: { id } });
    if (!drawing) throw new NotFoundException('Drawing not found');
    Object.assign(drawing, dto);
    return this.drawingRepo.save(drawing);
  }

  async getActivities(id: string): Promise<DrawingActivity[]> {
    await this.findOne(id);
    return this.activityRepo.find({
      where: { drawing_id: id },
      relations: { user: true },
      order: { action_time: 'ASC' },
    });
  }

  async performAction(id: string, dto: DrawingActionDto, userId: string): Promise<DrawingActivity> {
    const drawing = await this.drawingRepo.findOne({ where: { id } });
    if (!drawing) throw new NotFoundException('Drawing not found');

    const transitionKey = `${dto.action}:${dto.stage}`;
    const allowedTransitions = VALID_TRANSITIONS[drawing.status];
    const nextStatus = allowedTransitions?.[transitionKey];

    if (!nextStatus) {
      throw new BadRequestException(
        `Cannot perform '${dto.action}' on stage '${dto.stage}' for drawing in status '${drawing.status}'`,
      );
    }

    if (dto.action === 'return' && !dto.return_reason) {
      throw new BadRequestException('Return reason is required for return action');
    }

    drawing.status = nextStatus;
    await this.drawingRepo.save(drawing);

    return this.activityRepo.save({
      id: uuidv4(),
      drawing_id: id,
      user_id: userId,
      action: dto.action,
      stage: dto.stage,
      return_reason: dto.return_reason || null,
    } as any);
  }

  async getRevisions(id: string): Promise<DrawingRevision[]> {
    await this.findOne(id);
    return this.revisionRepo.find({
      where: { drawing_id: id },
      relations: { creator: true, files: true },
      order: { created_at: 'ASC' },
    });
  }

  async createRevision(id: string, dto: CreateRevisionDto, userId: string): Promise<DrawingRevision> {
    await this.findOne(id);
    const revision = this.revisionRepo.create({
      id: uuidv4(),
      drawing_id: id,
      revision_no: dto.revision_no,
      description: dto.description,
      created_by: userId,
    });
    return this.revisionRepo.save(revision);
  }

  async getFile(fileId: string): Promise<RevisionFile> {
    const file = await this.fileRepo.findOne({ where: { id: fileId } });
    if (!file) throw new NotFoundException('File not found');
    return file;
  }
}

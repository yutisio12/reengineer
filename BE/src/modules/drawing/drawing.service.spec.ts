import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { DrawingService } from './drawing.service';
import { Drawing } from '../../entities/drawing.entity';
import { DrawingActivity } from '../../entities/drawing-activity.entity';
import { DrawingRevision } from '../../entities/drawing-revision.entity';
import { RevisionFile } from '../../entities/revision-file.entity';
import { CreateDrawingDto } from './dto/create-drawing.dto';
import { UpdateDrawingDto } from './dto/update-drawing.dto';
import { DrawingActionDto } from './dto/drawing-action.dto';
import { CreateRevisionDto } from './dto/create-revision.dto';
import { QueryDrawingDto } from './dto/query-drawing.dto';

describe('DrawingService', () => {
  let drawingService: DrawingService;
  let drawingRepo: any;
  let activityRepo: any;
  let revisionRepo: any;
  let fileRepo: any;

  const mockDrawingRepo = {
    find: jest.fn(), findOne: jest.fn(), findAndCount: jest.fn(),
    create: jest.fn(), save: jest.fn(),
  };
  const mockActivityRepo = { find: jest.fn(), findOne: jest.fn(), save: jest.fn(), create: jest.fn() };
  const mockRevisionRepo = { find: jest.fn(), findOne: jest.fn(), create: jest.fn(), save: jest.fn() };
  const mockFileRepo = { find: jest.fn(), findOne: jest.fn(), create: jest.fn(), save: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DrawingService,
        { provide: getRepositoryToken(Drawing), useValue: mockDrawingRepo },
        { provide: getRepositoryToken(DrawingActivity), useValue: mockActivityRepo },
        { provide: getRepositoryToken(DrawingRevision), useValue: mockRevisionRepo },
        { provide: getRepositoryToken(RevisionFile), useValue: mockFileRepo },
      ],
    }).compile();

    drawingService = module.get<DrawingService>(DrawingService);
    drawingRepo = module.get(getRepositoryToken(Drawing));
    activityRepo = module.get(getRepositoryToken(DrawingActivity));
    revisionRepo = module.get(getRepositoryToken(DrawingRevision));
    fileRepo = module.get(getRepositoryToken(RevisionFile));

    jest.clearAllMocks();
  });

  const mockDrawing = {
    id: 'draw-1',
    document_no: 'DOC-001',
    description: 'Test drawing',
    status: 'assigned',
    company_id: 'comp-1',
    project_id: 'proj-1',
    module_id: 'mod-1',
    discipline_id: 'disc-1',
    drawing_type_id: 'dt-1',
    created_by: 'user-1',
    assigned_drafter: 'user-2',
    created_at: new Date(),
    updated_at: new Date(),
    company: {}, project: {}, module: {}, discipline: {}, drawing_type: {}, creator: {}, drafter: {},
  };

  const mockActivity = {
    id: 'act-1', drawing_id: 'draw-1', user_id: 'user-1',
    action: 'start', stage: 'drafter', return_reason: null,
    action_time: new Date(), user: {},
  };

  const mockRevision = {
    id: 'rev-1', drawing_id: 'draw-1', revision_no: 'A',
    description: 'First revision', created_by: 'user-1',
    created_at: new Date(), creator: {}, files: [],
  };

  const mockFile = {
    id: 'file-1', revision_id: 'rev-1', file_name: 'test.pdf',
    file_path: '/uploads/test.pdf', file_type: 'application/pdf',
    file_size: 1024, uploaded_at: new Date(),
  };

  // ==================== findAll ====================
  describe('findAll', () => {
    it('should return paginated drawings without filters', async () => {
      mockDrawingRepo.findAndCount.mockResolvedValue([[mockDrawing], 1]);

      const result = await drawingService.findAll({});

      expect(result.data).toEqual([mockDrawing]);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.per_page).toBe(20);
      expect(result.total_pages).toBe(1);
    });

    it('should apply all provided filters', async () => {
      const query: QueryDrawingDto = {
        company_id: 'comp-1', project_id: 'proj-1',
        status: 'assigned', search: 'DOC',
        page: 2, per_page: 10, sort: 'document_no', order: 'DESC',
      };
      mockDrawingRepo.findAndCount.mockResolvedValue([[mockDrawing], 1]);

      await drawingService.findAll(query);

      const callArgs = mockDrawingRepo.findAndCount.mock.calls[0][0];
      expect(callArgs.where.company_id).toBe('comp-1');
      expect(callArgs.where.project_id).toBe('proj-1');
      expect(callArgs.where.status).toBe('assigned');
      expect(callArgs.skip).toBe(10);
      expect(callArgs.take).toBe(10);
    });

    it('should return empty result when no drawings match', async () => {
      mockDrawingRepo.findAndCount.mockResolvedValue([[], 0]);
      const result = await drawingService.findAll({});
      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
      expect(result.total_pages).toBe(0);
    });
  });

  // ==================== findOne ====================
  describe('findOne', () => {
    it('should return a drawing by id', async () => {
      mockDrawingRepo.findOne.mockResolvedValue(mockDrawing);

      const result = await drawingService.findOne('draw-1');
      expect(result).toEqual(mockDrawing);
      expect(result.id).toBe('draw-1');
    });

    it('should throw NotFoundException when drawing not found', async () => {
      mockDrawingRepo.findOne.mockResolvedValue(null);

      await expect(drawingService.findOne('bad-id')).rejects.toThrow(NotFoundException);
      await expect(drawingService.findOne('bad-id')).rejects.toThrow('Drawing not found');
    });
  });

  // ==================== create ====================
  describe('create', () => {
    const dto: CreateDrawingDto = {
      document_no: 'DOC-002', company_id: 'comp-1', project_id: 'proj-1',
      module_id: 'mod-1', discipline_id: 'disc-1', drawing_type_id: 'dt-1',
      assigned_drafter: 'user-2',
    };

    it('should create a drawing successfully', async () => {
      mockDrawingRepo.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce(mockDrawing);
      mockDrawingRepo.create.mockReturnValue(mockDrawing);
      mockDrawingRepo.save.mockResolvedValue(mockDrawing);

      const result = await drawingService.create(dto, 'user-1');
      expect(result).toBeDefined();
      expect(mockDrawingRepo.create).toHaveBeenCalledWith(expect.objectContaining({
        document_no: 'DOC-002', status: 'assigned', created_by: 'user-1',
      }));
    });

    it('should throw ConflictException when document number already exists', async () => {
      mockDrawingRepo.findOne.mockResolvedValue(mockDrawing);

      await expect(drawingService.create(dto, 'user-1')).rejects.toThrow(ConflictException);
      await expect(drawingService.create(dto, 'user-1')).rejects.toThrow('Document number already exists');
    });
  });

  // ==================== update ====================
  describe('update', () => {
    const dto: UpdateDrawingDto = { description: 'Updated description' };

    it('should update a drawing successfully', async () => {
      mockDrawingRepo.findOne.mockResolvedValueOnce(mockDrawing).mockResolvedValueOnce(mockDrawing);
      mockDrawingRepo.save.mockResolvedValue(mockDrawing);

      const result = await drawingService.update('draw-1', dto);
      expect(result).toBeDefined();
    });

    it('should throw NotFoundException when drawing not found', async () => {
      mockDrawingRepo.findOne.mockResolvedValue(null);

      await expect(drawingService.update('bad-id', dto)).rejects.toThrow(NotFoundException);
    });
  });

  // ==================== getActivities ====================
  describe('getActivities', () => {
    it('should return activities for a drawing', async () => {
      mockDrawingRepo.findOne.mockResolvedValue(mockDrawing);
      mockActivityRepo.find.mockResolvedValue([mockActivity]);

      const result = await drawingService.getActivities('draw-1');
      expect(result).toEqual([mockActivity]);
      expect(mockActivityRepo.find).toHaveBeenCalledWith({
        where: { drawing_id: 'draw-1' },
        relations: { user: true },
        order: { action_time: 'ASC' },
      });
    });

    it('should throw NotFoundException when drawing not found', async () => {
      mockDrawingRepo.findOne.mockResolvedValue(null);
      await expect(drawingService.getActivities('bad-id')).rejects.toThrow(NotFoundException);
    });
  });

  // ==================== performAction ====================
  describe('performAction', () => {
    const userId = 'user-1';

    it('should perform start:drafter action from assigned status', async () => {
      mockDrawingRepo.findOne.mockResolvedValue(mockDrawing);
      mockDrawingRepo.save.mockResolvedValue({ ...mockDrawing, status: 'in_progress_drafter' });
      mockActivityRepo.save.mockResolvedValue(mockActivity);
      mockActivityRepo.findOne.mockResolvedValue(mockActivity);

      const dto: DrawingActionDto = { action: 'start', stage: 'drafter' };
      const result = await drawingService.performAction('draw-1', dto, userId);
      expect(result).toBeDefined();
      expect(mockDrawingRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'in_progress_drafter' }),
      );
    });

    it('should perform submit:checker from in_progress_drafter', async () => {
      const drawingInProgress = { ...mockDrawing, status: 'in_progress_drafter' };
      mockDrawingRepo.findOne.mockResolvedValue(drawingInProgress);
      mockDrawingRepo.save.mockResolvedValue({ ...drawingInProgress, status: 'in_progress_checker' });
      mockActivityRepo.save.mockResolvedValue(mockActivity);
      mockActivityRepo.findOne.mockResolvedValue(mockActivity);

      const dto: DrawingActionDto = { action: 'submit', stage: 'checker' };
      const result = await drawingService.performAction('draw-1', dto, userId);
      expect(result).toBeDefined();
    });

    it('should perform approve:engineer from in_progress_engineer', async () => {
      const drawingInEng = { ...mockDrawing, status: 'in_progress_engineer' };
      mockDrawingRepo.findOne.mockResolvedValue(drawingInEng);
      mockDrawingRepo.save.mockResolvedValue({ ...drawingInEng, status: 'fully_approved' });
      mockActivityRepo.save.mockResolvedValue(mockActivity);
      mockActivityRepo.findOne.mockResolvedValue(mockActivity);

      const dto: DrawingActionDto = { action: 'approve', stage: 'engineer' };
      const result = await drawingService.performAction('draw-1', dto, userId);
      expect(result).toBeDefined();
    });

    it('should perform return:drafter from in_progress_checker', async () => {
      const drawingInCheck = { ...mockDrawing, status: 'in_progress_checker' };
      mockDrawingRepo.findOne.mockResolvedValue(drawingInCheck);
      mockDrawingRepo.save.mockResolvedValue({ ...drawingInCheck, status: 'in_progress_drafter' });
      mockActivityRepo.save.mockResolvedValue(mockActivity);
      mockActivityRepo.findOne.mockResolvedValue(mockActivity);

      const dto: DrawingActionDto = { action: 'return', stage: 'drafter', return_reason: 'Fix alignment' };
      const result = await drawingService.performAction('draw-1', dto, userId);
      expect(result).toBeDefined();
    });

    it('should throw BadRequestException for invalid transition', async () => {
      mockDrawingRepo.findOne.mockResolvedValue(mockDrawing);

      const dto: DrawingActionDto = { action: 'approve', stage: 'engineer' };
      await expect(drawingService.performAction('draw-1', dto, userId)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when return action without reason', async () => {
      const drawingInCheck = { ...mockDrawing, status: 'in_progress_checker' };
      mockDrawingRepo.findOne.mockResolvedValue(drawingInCheck);

      const dto: DrawingActionDto = { action: 'return', stage: 'drafter' };
      await expect(drawingService.performAction('draw-1', dto, userId)).rejects.toThrow(BadRequestException);
      await expect(drawingService.performAction('draw-1', dto, userId)).rejects.toThrow(
        'Return reason is required for return action',
      );
    });

    it('should throw NotFoundException when drawing not found', async () => {
      mockDrawingRepo.findOne.mockResolvedValue(null);

      const dto: DrawingActionDto = { action: 'start', stage: 'drafter' };
      await expect(drawingService.performAction('bad-id', dto, userId)).rejects.toThrow(NotFoundException);
    });
  });

  // ==================== getRevisions ====================
  describe('getRevisions', () => {
    it('should return revisions for a drawing', async () => {
      mockDrawingRepo.findOne.mockResolvedValue(mockDrawing);
      mockRevisionRepo.find.mockResolvedValue([mockRevision]);

      const result = await drawingService.getRevisions('draw-1');
      expect(result).toEqual([mockRevision]);
      expect(mockRevisionRepo.find).toHaveBeenCalledWith({
        where: { drawing_id: 'draw-1' },
        relations: { creator: true, files: true },
        order: { created_at: 'ASC' },
      });
    });

    it('should throw NotFoundException when drawing not found', async () => {
      mockDrawingRepo.findOne.mockResolvedValue(null);
      await expect(drawingService.getRevisions('bad-id')).rejects.toThrow(NotFoundException);
    });
  });

  // ==================== createRevision ====================
  describe('createRevision', () => {
    const dto: CreateRevisionDto = { revision_no: 'B', description: 'Second revision' };

    it('should create a revision successfully', async () => {
      mockDrawingRepo.findOne.mockResolvedValue(mockDrawing);
      mockRevisionRepo.create.mockReturnValue(mockRevision);
      mockRevisionRepo.save.mockResolvedValue(mockRevision);
      mockRevisionRepo.findOne.mockResolvedValue(mockRevision);

      const result = await drawingService.createRevision('draw-1', dto, 'user-1');
      expect(result).toBeDefined();
      expect(mockRevisionRepo.create).toHaveBeenCalledWith(expect.objectContaining({
        revision_no: 'B', description: 'Second revision', created_by: 'user-1',
      }));
    });

    it('should throw NotFoundException when drawing not found', async () => {
      mockDrawingRepo.findOne.mockResolvedValue(null);
      await expect(drawingService.createRevision('bad-id', dto, 'user-1')).rejects.toThrow(NotFoundException);
    });
  });

  // ==================== getFile ====================
  describe('getFile', () => {
    it('should return a file by id', async () => {
      mockFileRepo.findOne.mockResolvedValue(mockFile);

      const result = await drawingService.getFile('file-1');
      expect(result).toEqual(mockFile);
    });

    it('should throw NotFoundException when file not found', async () => {
      mockFileRepo.findOne.mockResolvedValue(null);

      await expect(drawingService.getFile('bad-id')).rejects.toThrow(NotFoundException);
      await expect(drawingService.getFile('bad-id')).rejects.toThrow('File not found');
    });
  });
});

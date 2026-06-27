import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { ProductionService } from './production.service';
import { Drawing } from '../../entities/drawing.entity';
import { DrawingRevision } from '../../entities/drawing-revision.entity';
import { DrawingActivity } from '../../entities/drawing-activity.entity';
import { RaiseRevisionDto } from './dto/raise-revision.dto';

describe('ProductionService', () => {
  let productionService: ProductionService;
  let drawingRepo: any;
  let revisionRepo: any;
  let activityRepo: any;

  const mockDrawingRepo = {
    find: jest.fn(), findOne: jest.fn(), save: jest.fn(),
  };
  const mockRevisionRepo = {
    create: jest.fn(), save: jest.fn(),
  };
  const mockActivityRepo = {
    create: jest.fn(), save: jest.fn(),
  };

  const mockTransmittedDrawing = {
    id: 'draw-1',
    document_no: 'DOC-001',
    status: 'transmitted',
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

  const mockNonTransmittedDrawing = {
    ...mockTransmittedDrawing,
    id: 'draw-2',
    document_no: 'DOC-002',
    status: 'assigned',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductionService,
        { provide: getRepositoryToken(Drawing), useValue: mockDrawingRepo },
        { provide: getRepositoryToken(DrawingRevision), useValue: mockRevisionRepo },
        { provide: getRepositoryToken(DrawingActivity), useValue: mockActivityRepo },
      ],
    }).compile();

    productionService = module.get<ProductionService>(ProductionService);
    drawingRepo = module.get(getRepositoryToken(Drawing));
    revisionRepo = module.get(getRepositoryToken(DrawingRevision));
    activityRepo = module.get(getRepositoryToken(DrawingActivity));

    jest.clearAllMocks();
  });

  // ==================== getProductionDrawings ====================
  describe('getProductionDrawings', () => {
    it('should return all transmitted drawings without filters', async () => {
      mockDrawingRepo.find.mockResolvedValue([mockTransmittedDrawing]);

      const result = await productionService.getProductionDrawings();

      expect(result).toEqual([mockTransmittedDrawing]);
      expect(mockDrawingRepo.find).toHaveBeenCalledWith(expect.objectContaining({
        where: { status: 'transmitted' },
      }));
    });

    it('should filter by company_id, project_id, and module_id', async () => {
      mockDrawingRepo.find.mockResolvedValue([mockTransmittedDrawing]);

      await productionService.getProductionDrawings('comp-1', 'proj-1', 'mod-1');

      const callArgs = mockDrawingRepo.find.mock.calls[0][0];
      expect(callArgs.where.company_id).toBe('comp-1');
      expect(callArgs.where.project_id).toBe('proj-1');
      expect(callArgs.where.module_id).toBe('mod-1');
    });

    it('should filter by search term on document_no', async () => {
      mockDrawingRepo.find.mockResolvedValue([mockTransmittedDrawing]);

      await productionService.getProductionDrawings(undefined, undefined, undefined, 'DOC');

      const callArgs = mockDrawingRepo.find.mock.calls[0][0];
      expect(callArgs.where.document_no).toBeDefined();
    });

    it('should return empty array when no transmitted drawings exist', async () => {
      mockDrawingRepo.find.mockResolvedValue([]);

      const result = await productionService.getProductionDrawings();
      expect(result).toEqual([]);
    });
  });

  // ==================== raiseRevision ====================
  describe('raiseRevision', () => {
    const userId = 'user-1';
    const dto: RaiseRevisionDto = { revision_no: 'C', description: 'Production revision' };

    it('should raise a revision on a transmitted drawing', async () => {
      mockDrawingRepo.findOne
        .mockResolvedValueOnce(mockTransmittedDrawing)
        .mockResolvedValueOnce(mockTransmittedDrawing);
      mockRevisionRepo.create.mockReturnValue({ id: 'rev-new', ...dto, drawing_id: 'draw-1', created_by: userId });
      mockRevisionRepo.save.mockResolvedValue({ id: 'rev-new', ...dto, drawing_id: 'draw-1', created_by: userId });
      mockActivityRepo.create.mockReturnValue({ id: 'act-new', drawing_id: 'draw-1', user_id: userId, action: 'start', stage: 'drafter' });
      mockActivityRepo.save.mockResolvedValue({ id: 'act-new', drawing_id: 'draw-1', user_id: userId, action: 'start', stage: 'drafter' });
      mockDrawingRepo.save.mockResolvedValue({ ...mockTransmittedDrawing, status: 'in_progress_drafter' });

      const result = await productionService.raiseRevision('draw-1', dto, userId);

      expect(result).toBeDefined();
      expect(mockDrawingRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'in_progress_drafter' }),
      );
      expect(mockRevisionRepo.create).toHaveBeenCalledWith(expect.objectContaining({
        revision_no: 'C', description: 'Production revision', created_by: userId,
      }));
      expect(mockActivityRepo.create).toHaveBeenCalledWith(expect.objectContaining({
        action: 'start', stage: 'drafter',
      }));
    });

    it('should throw NotFoundException when drawing not found', async () => {
      mockDrawingRepo.findOne.mockResolvedValue(null);

      await expect(productionService.raiseRevision('bad-id', dto, userId)).rejects.toThrow(NotFoundException);
      await expect(productionService.raiseRevision('bad-id', dto, userId)).rejects.toThrow('Drawing not found');
    });

    it('should throw NotFoundException when drawing is not transmitted', async () => {
      mockDrawingRepo.findOne.mockResolvedValue(mockNonTransmittedDrawing);

      await expect(productionService.raiseRevision('draw-2', dto, userId)).rejects.toThrow(NotFoundException);
      await expect(productionService.raiseRevision('draw-2', dto, userId)).rejects.toThrow(
        'Only transmitted drawings can be raised for revision',
      );
    });
  });
});

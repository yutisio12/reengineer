import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { TransmitService } from './transmit.service';
import { Drawing } from '../../entities/drawing.entity';
import { TransmitLog } from '../../entities/transmit-log.entity';
import { TransmitDrawing } from '../../entities/transmit-drawing.entity';
import { TransmitDto } from './dto/transmit.dto';

describe('TransmitService', () => {
  let transmitService: TransmitService;
  let drawingRepo: any;
  let transmitLogRepo: any;
  let transmitDrawingRepo: any;

  const mockDrawingRepo = {
    find: jest.fn(), findOne: jest.fn(), save: jest.fn(),
  };
  const mockTransmitLogRepo = {
    findOne: jest.fn(), save: jest.fn(),
  };
  const mockTransmitDrawingRepo = {
    save: jest.fn(),
  };

  function makeApprovedDrawing(id = 'draw-1', docNo = 'DOC-001') {
    return {
      id,
      document_no: docNo,
      status: 'fully_approved',
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
  }

  function makeAssignedDrawing(id = 'draw-2', docNo = 'DOC-002') {
    return {
      ...makeApprovedDrawing(id, docNo),
      status: 'assigned',
    };
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransmitService,
        { provide: getRepositoryToken(Drawing), useValue: mockDrawingRepo },
        { provide: getRepositoryToken(TransmitLog), useValue: mockTransmitLogRepo },
        { provide: getRepositoryToken(TransmitDrawing), useValue: mockTransmitDrawingRepo },
      ],
    }).compile();

    transmitService = module.get<TransmitService>(TransmitService);
    drawingRepo = module.get(getRepositoryToken(Drawing));
    transmitLogRepo = module.get(getRepositoryToken(TransmitLog));
    transmitDrawingRepo = module.get(getRepositoryToken(TransmitDrawing));

    jest.clearAllMocks();
  });

  // ==================== getTransmittableDrawings ====================
  describe('getTransmittableDrawings', () => {
    it('should return all fully_approved drawings', async () => {
      const drawing = makeApprovedDrawing();
      mockDrawingRepo.find.mockResolvedValue([drawing]);

      const result = await transmitService.getTransmittableDrawings();

      expect(result).toEqual([drawing]);
      expect(mockDrawingRepo.find).toHaveBeenCalledWith(expect.objectContaining({
        where: { status: 'fully_approved' },
      }));
    });

    it('should return empty array when no drawings are fully_approved', async () => {
      mockDrawingRepo.find.mockResolvedValue([]);

      const result = await transmitService.getTransmittableDrawings();
      expect(result).toEqual([]);
    });
  });

  // ==================== transmit ====================
  describe('transmit', () => {
    const userId = 'user-1';

    it('should transmit approved drawings successfully', async () => {
      const drawing = makeApprovedDrawing();
      const dto: TransmitDto = { drawing_ids: ['draw-1'], notes: 'Transmittal notes' };

      mockDrawingRepo.find.mockResolvedValueOnce([drawing]);
      mockTransmitLogRepo.save.mockResolvedValue({ id: 'log-1', transmitted_by: userId, notes: 'Transmittal notes' });
      mockDrawingRepo.save.mockReturnValue({ ...drawing, status: 'transmitted' });
      mockTransmitDrawingRepo.save.mockResolvedValue({ id: 'td-1', transmit_log_id: 'log-1', drawing_id: 'draw-1' });
      mockTransmitLogRepo.findOne.mockResolvedValue({
        id: 'log-1', transmitter: {}, notes: 'Transmittal notes',
        transmit_drawings: [{ drawing }],
      });
      mockDrawingRepo.find.mockResolvedValueOnce([{ ...drawing, status: 'transmitted' }]);

      const result = await transmitService.transmit(dto, userId);

      expect(result.transmit_log).toBeDefined();
      expect(result.drawings).toBeDefined();
      expect(result.drawings).toHaveLength(1);
      expect(mockDrawingRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'transmitted' }),
      );
    });

    it('should transmit multiple drawings successfully', async () => {
      const drawA = makeApprovedDrawing('draw-1', 'DOC-001');
      const drawB = makeApprovedDrawing('draw-3', 'DOC-003');
      const dto: TransmitDto = { drawing_ids: ['draw-1', 'draw-3'] };

      mockDrawingRepo.find.mockResolvedValueOnce([drawA, drawB]);
      mockTransmitLogRepo.save.mockResolvedValue({ id: 'log-1', transmitted_by: userId, notes: null });
      mockDrawingRepo.save.mockReturnValue(undefined);
      mockTransmitDrawingRepo.save.mockResolvedValue(undefined);
      mockTransmitLogRepo.findOne.mockResolvedValue({
        id: 'log-1', transmitter: {}, notes: null,
        transmit_drawings: [{ drawing: drawA }, { drawing: drawB }],
      });
      mockDrawingRepo.find.mockResolvedValueOnce([
        { ...drawA, status: 'transmitted' },
        { ...drawB, status: 'transmitted' },
      ]);

      const result = await transmitService.transmit(dto, userId);
      expect(result.drawings).toHaveLength(2);
    });

    it('should throw NotFoundException when some drawings are not found', async () => {
      const drawing = makeApprovedDrawing();
      const dto: TransmitDto = { drawing_ids: ['draw-1', 'nonexistent'] };

      mockDrawingRepo.find.mockResolvedValue([drawing]);

      await expect(transmitService.transmit(dto, userId)).rejects.toThrow(NotFoundException);
      await expect(transmitService.transmit(dto, userId)).rejects.toThrow('Some drawings were not found');
    });

    it('should throw BadRequestException when drawings are not fully_approved', async () => {
      const nonApproved = makeAssignedDrawing();
      const dto: TransmitDto = { drawing_ids: ['draw-2'] };

      mockDrawingRepo.find.mockResolvedValue([nonApproved]);

      await expect(transmitService.transmit(dto, userId)).rejects.toThrow(BadRequestException);
      await expect(transmitService.transmit(dto, userId)).rejects.toThrow(
        "Drawings must be in 'fully_approved' status",
      );
    });

    it('should transmit without notes when notes is not provided', async () => {
      const drawing = makeApprovedDrawing();
      const dto: TransmitDto = { drawing_ids: ['draw-1'] };

      mockDrawingRepo.find.mockResolvedValueOnce([drawing]);
      mockTransmitLogRepo.save.mockResolvedValue({ id: 'log-1', transmitted_by: userId, notes: null });
      mockDrawingRepo.save.mockReturnValue(undefined);
      mockTransmitDrawingRepo.save.mockResolvedValue(undefined);
      mockTransmitLogRepo.findOne.mockResolvedValue({
        id: 'log-1', transmitter: {}, notes: null,
        transmit_drawings: [{ drawing }],
      });
      mockDrawingRepo.find.mockResolvedValueOnce([{ ...drawing, status: 'transmitted' }]);

      const result = await transmitService.transmit(dto, userId);
      expect(result.transmit_log).toBeDefined();
      expect(mockTransmitLogRepo.save).toHaveBeenCalledWith(expect.objectContaining({ notes: null }));
    });
  });
});

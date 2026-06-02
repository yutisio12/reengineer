import {
  Controller, Get, Post, Patch, Param, Query, Body,
  UseGuards, UseInterceptors, UploadedFile, Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { diskStorage } from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { DrawingService } from './drawing.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../../entities/user.entity';
import { RevisionFile } from '../../entities/revision-file.entity';
import { CreateDrawingDto } from './dto/create-drawing.dto';
import { UpdateDrawingDto } from './dto/update-drawing.dto';
import { DrawingActionDto } from './dto/drawing-action.dto';
import { CreateRevisionDto } from './dto/create-revision.dto';
import { QueryDrawingDto } from './dto/query-drawing.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@UseGuards(JwtAuthGuard)
@Controller('engineering/api')
export class DrawingController {
  constructor(
    private drawingService: DrawingService,
    @InjectRepository(RevisionFile)
    private fileRepo: Repository<RevisionFile>,
  ) {}

  @Get('drawings')
  findAll(@Query() query: QueryDrawingDto) {
    return this.drawingService.findAll(query);
  }

  @Get('drawings/:id')
  findOne(@Param('id') id: string) {
    return this.drawingService.findOne(id);
  }

  @Post('drawings')
  create(@Body() dto: CreateDrawingDto, @CurrentUser() user: User) {
    return this.drawingService.create(dto, user.id);
  }

  @Patch('drawings/:id')
  update(@Param('id') id: string, @Body() dto: UpdateDrawingDto) {
    return this.drawingService.update(id, dto);
  }

  @Get('drawings/:id/activities')
  getActivities(@Param('id') id: string) {
    return this.drawingService.getActivities(id);
  }

  @Post('drawings/:id/actions')
  performAction(
    @Param('id') id: string,
    @Body() dto: DrawingActionDto,
    @CurrentUser() user: User,
  ) {
    return this.drawingService.performAction(id, dto, user.id);
  }

  @Get('drawings/:id/revisions')
  getRevisions(@Param('id') id: string) {
    return this.drawingService.getRevisions(id);
  }

  @Post('drawings/:id/revisions')
  createRevision(
    @Param('id') id: string,
    @Body() dto: CreateRevisionDto,
    @CurrentUser() user: User,
  ) {
    return this.drawingService.createRevision(id, dto, user.id);
  }

  @Post('revisions/:revisionId/files')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const dir = path.join(process.cwd(), 'uploads', 'revisions', req.params.revisionId);
          fs.mkdirSync(dir, { recursive: true });
          cb(null, dir);
        },
        filename: (req, file, cb) => {
          const ext = path.extname(file.originalname);
          cb(null, `${uuidv4()}${ext}`);
        },
      }),
      limits: { fileSize: 20 * 1024 * 1024 },
    }),
  )
  async uploadFile(
    @Param('revisionId') revisionId: string,
    @UploadedFile() file: any,
  ) {
    const savedFile = this.fileRepo.create({
      id: uuidv4(),
      revision_id: revisionId,
      file_name: file.originalname,
      file_path: file.path,
      file_type: file.mimetype,
      file_size: file.size,
    });
    return this.fileRepo.save(savedFile);
  }

  @Get('revisions/files/:fileId/download')
  async downloadFile(@Param('fileId') fileId: string, @Res() res: Response) {
    const file = await this.drawingService.getFile(fileId);
    if (!fs.existsSync(file.file_path)) {
      return res.status(404).json({ message: 'File not found on disk' });
    }
    res.setHeader('Content-Type', file.file_type);
    res.setHeader('Content-Disposition', `attachment; filename="${file.file_name}"`);
    const stream = fs.createReadStream(file.file_path);
    stream.pipe(res);
  }
}

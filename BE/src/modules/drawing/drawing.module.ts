import { Module as NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { DrawingController } from './drawing.controller';
import { DrawingService } from './drawing.service';
import { Drawing } from '../../entities/drawing.entity';
import { DrawingActivity } from '../../entities/drawing-activity.entity';
import { DrawingRevision } from '../../entities/drawing-revision.entity';
import { RevisionFile } from '../../entities/revision-file.entity';

@NestModule({
  imports: [
    TypeOrmModule.forFeature([Drawing, DrawingActivity, DrawingRevision, RevisionFile]),
    AuthModule,
  ],
  controllers: [DrawingController],
  providers: [DrawingService],
  exports: [DrawingService],
})
export class DrawingModule {}

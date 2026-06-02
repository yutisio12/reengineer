import { Module as NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductionController } from './production.controller';
import { ProductionService } from './production.service';
import { Drawing } from '../../entities/drawing.entity';
import { DrawingRevision } from '../../entities/drawing-revision.entity';
import { DrawingActivity } from '../../entities/drawing-activity.entity';

@NestModule({
  imports: [
    TypeOrmModule.forFeature([Drawing, DrawingRevision, DrawingActivity]),
  ],
  controllers: [ProductionController],
  providers: [ProductionService],
})
export class ProductionModule {}

import { Module as NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { TransmitController } from './transmit.controller';
import { TransmitService } from './transmit.service';
import { Drawing } from '../../entities/drawing.entity';
import { TransmitLog } from '../../entities/transmit-log.entity';
import { TransmitDrawing } from '../../entities/transmit-drawing.entity';

@NestModule({
  imports: [
    TypeOrmModule.forFeature([Drawing, TransmitLog, TransmitDrawing]),
    AuthModule,
  ],
  controllers: [TransmitController],
  providers: [TransmitService],
})
export class TransmitModule {}

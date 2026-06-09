import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { TransmitService } from './transmit.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../../entities/user.entity';
import { TransmitDto } from './dto/transmit.dto';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT')
@ApiTags('Transmit')
@Controller('engineering/api')
export class TransmitController {
  constructor(private transmitService: TransmitService) {}

  @ApiOperation({ summary: 'Get drawings available for transmittal' })
  @Get('drawings/transmittable')
  getTransmittable() {
    return this.transmitService.getTransmittableDrawings();
  }

  @ApiOperation({ summary: 'Transmit drawings' })
  @Post('transmit')
  transmit(@Body() dto: TransmitDto, @CurrentUser() user: User) {
    return this.transmitService.transmit(dto, user.id);
  }
}

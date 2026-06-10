import { Controller, Get, Post, Param, Query, Body, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ProductionService } from './production.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../../entities/user.entity';
import { RaiseRevisionDto } from './dto/raise-revision.dto';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT')
@ApiTags('Production')
@Controller('engineering/api/production')
export class ProductionController {
  constructor(private productionService: ProductionService) {}

  @ApiOperation({ summary: 'Get production drawings with optional filters' })
  @Get('drawings')
  getDrawings(
    @Query('company_id') company_id?: string,
    @Query('project_id') project_id?: string,
    @Query('module_id') module_id?: string,
    @Query('search') search?: string,
  ) {
    return this.productionService.getProductionDrawings(company_id, project_id, module_id, search);
  }

  @ApiOperation({ summary: 'Raise a revision for a production drawing' })
  @Post('drawings/:id/raise-revision')
  raiseRevision(
    @Param('id') id: string,
    @Body() dto: RaiseRevisionDto,
    @CurrentUser() user: User,
  ) {
    return this.productionService.raiseRevision(id, dto, user.id);
  }
}

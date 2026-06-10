import {
  Controller, Get, Post, Patch, Param, Query, Body, UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { MasterService } from './master.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';
import { CreateDrawingTypeDto } from './dto/create-drawing-type.dto';
import { UpdateDrawingTypeDto } from './dto/update-drawing-type.dto';
import { CreateDisciplineDto } from './dto/create-discipline.dto';
import { UpdateDisciplineDto } from './dto/update-discipline.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT')
@ApiTags('Master Data')
@Controller('engineering/api/master')
export class MasterController {
  constructor(private masterService: MasterService) {}

  @ApiOperation({ summary: 'Get all companies' })
  @Get('companies')
  getCompanies() {
    return this.masterService.getCompanies();
  }

  @ApiOperation({ summary: 'Create a new company' })
  @Post('companies')
  createCompany(@Body() dto: CreateCompanyDto) {
    return this.masterService.createCompany(dto);
  }

  @ApiOperation({ summary: 'Update a company' })
  @Patch('companies/:id')
  updateCompany(@Param('id') id: string, @Body() dto: UpdateCompanyDto) {
    return this.masterService.updateCompany(id, dto);
  }

  @ApiOperation({ summary: 'Get all projects' })
  @Get('projects')
  getProjects(@Query('company_id') company_id?: string) {
    return this.masterService.getProjects(company_id);
  }

  @ApiOperation({ summary: 'Create a new project' })
  @Post('projects')
  createProject(@Body() dto: CreateProjectDto) {
    return this.masterService.createProject(dto);
  }

  @ApiOperation({ summary: 'Update a project' })
  @Patch('projects/:id')
  updateProject(@Param('id') id: string, @Body() dto: UpdateProjectDto) {
    return this.masterService.updateProject(id, dto);
  }

  @ApiOperation({ summary: 'Get all modules' })
  @Get('modules')
  getModules(@Query('project_id') project_id?: string) {
    return this.masterService.getModules(project_id);
  }

  @ApiOperation({ summary: 'Create a new module' })
  @Post('modules')
  createModule(@Body() dto: CreateModuleDto) {
    return this.masterService.createModule(dto);
  }

  @ApiOperation({ summary: 'Update a module' })
  @Patch('modules/:id')
  updateModule(@Param('id') id: string, @Body() dto: UpdateModuleDto) {
    return this.masterService.updateModule(id, dto);
  }

  @ApiOperation({ summary: 'Get all drawing types' })
  @Get('drawing-types')
  getDrawingTypes() {
    return this.masterService.getDrawingTypes();
  }

  @ApiOperation({ summary: 'Create a new drawing type' })
  @Post('drawing-types')
  createDrawingType(@Body() dto: CreateDrawingTypeDto) {
    return this.masterService.createDrawingType(dto);
  }

  @ApiOperation({ summary: 'Update a drawing type' })
  @Patch('drawing-types/:id')
  updateDrawingType(@Param('id') id: string, @Body() dto: UpdateDrawingTypeDto) {
    return this.masterService.updateDrawingType(id, dto);
  }

  @ApiOperation({ summary: 'Get all disciplines' })
  @Get('disciplines')
  getDisciplines() {
    return this.masterService.getDisciplines();
  }

  @ApiOperation({ summary: 'Create a new discipline' })
  @Post('disciplines')
  createDiscipline(@Body() dto: CreateDisciplineDto) {
    return this.masterService.createDiscipline(dto);
  }

  @ApiOperation({ summary: 'Update a discipline' })
  @Patch('disciplines/:id')
  updateDiscipline(@Param('id') id: string, @Body() dto: UpdateDisciplineDto) {
    return this.masterService.updateDiscipline(id, dto);
  }

  @ApiOperation({ summary: 'Get all users' })
  @Get('users')
  getUsers(@Query('role') role?: string) {
    return this.masterService.getUsers(role);
  }

  @ApiOperation({ summary: 'Create a new user' })
  @Post('users')
  createUser(@Body() dto: CreateUserDto) {
    return this.masterService.createUser(dto);
  }

  @ApiOperation({ summary: 'Update a user' })
  @Patch('users/:id')
  updateUser(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.masterService.updateUser(id, dto);
  }
}

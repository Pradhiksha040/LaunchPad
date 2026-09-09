import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto, UpdateApplicationDto } from './dto/create-application.dto';
import { CreateModuleDto, UpdateModuleDto } from './dto/module.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserPayload } from '../common/interfaces/authenticated-request.interface';

@ApiTags('Applications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post()
  @Roles('SUPER_ADMIN', 'ORG_ADMIN', 'DEVELOPER')
  @ApiOperation({ summary: 'Create a new application' })
  @ApiResponse({ status: 201, description: 'Application successfully created' })
  create(
    @Body() dto: CreateApplicationDto,
    @CurrentUser() currentUser: UserPayload,
  ) {
    return this.applicationsService.create(dto, currentUser);
  }

  @Get()
  @Roles('SUPER_ADMIN', 'ORG_ADMIN', 'DEVELOPER', 'USER', 'VIEWER')
  @ApiOperation({ summary: 'List all applications for user organization' })
  findAll(@CurrentUser() currentUser: UserPayload) {
    return this.applicationsService.findAll(currentUser);
  }

  @Get(':id')
  @Roles('SUPER_ADMIN', 'ORG_ADMIN', 'DEVELOPER', 'USER', 'VIEWER')
  @ApiOperation({ summary: 'Get application configuration details by ID or slug' })
  findOne(@Param('id') id: string, @CurrentUser() currentUser: UserPayload) {
    return this.applicationsService.findOne(id, currentUser);
  }

  @Patch(':id')
  @Roles('SUPER_ADMIN', 'ORG_ADMIN', 'DEVELOPER')
  @ApiOperation({ summary: 'Update application settings or configuration' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateApplicationDto,
    @CurrentUser() currentUser: UserPayload,
  ) {
    return this.applicationsService.update(id, dto, currentUser);
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN', 'ORG_ADMIN')
  @ApiOperation({ summary: 'Delete application' })
  remove(@Param('id') id: string, @CurrentUser() currentUser: UserPayload) {
    return this.applicationsService.remove(id, currentUser);
  }

  @Get(':id/modules')
  @Roles('SUPER_ADMIN', 'ORG_ADMIN', 'DEVELOPER', 'USER', 'VIEWER')
  @ApiOperation({ summary: 'Get all modules for an application' })
  getModules(@Param('id') id: string, @CurrentUser() currentUser: UserPayload) {
    return this.applicationsService.getApplicationModules(id, currentUser);
  }

  @Post(':id/modules')
  @Roles('SUPER_ADMIN', 'ORG_ADMIN', 'DEVELOPER')
  @ApiOperation({ summary: 'Add a new module to an application' })
  addModule(
    @Param('id') id: string,
    @Body() dto: CreateModuleDto,
    @CurrentUser() currentUser: UserPayload,
  ) {
    return this.applicationsService.addApplicationModule(id, dto, currentUser);
  }

  @Patch(':id/modules/:moduleId')
  @Roles('SUPER_ADMIN', 'ORG_ADMIN', 'DEVELOPER')
  @ApiOperation({ summary: 'Update a module configuration within an application' })
  updateModule(
    @Param('id') id: string,
    @Param('moduleId') moduleId: string,
    @Body() dto: UpdateModuleDto,
    @CurrentUser() currentUser: UserPayload,
  ) {
    return this.applicationsService.updateApplicationModule(id, moduleId, dto, currentUser);
  }

  @Delete(':id/modules/:moduleId')
  @Roles('SUPER_ADMIN', 'ORG_ADMIN', 'DEVELOPER')
  @ApiOperation({ summary: 'Delete or remove a module from an application' })
  deleteModule(
    @Param('id') id: string,
    @Param('moduleId') moduleId: string,
    @CurrentUser() currentUser: UserPayload,
  ) {
    return this.applicationsService.deleteApplicationModule(id, moduleId, currentUser);
  }
}

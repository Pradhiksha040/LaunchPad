import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { WorkflowsService } from './workflows.service';
import { CreateWorkflowDto } from './dto/create-workflow.dto';
import { UpdateWorkflowDto } from './dto/update-workflow.dto';
import { RunWorkflowDto } from './dto/run-workflow.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserPayload } from '../common/interfaces/authenticated-request.interface';

@Controller('workflows')
@UseGuards(JwtAuthGuard, RolesGuard)
export class WorkflowsController {
  constructor(private readonly workflowsService: WorkflowsService) {}

  @Post()
  @Roles('SUPER_ADMIN', 'ORG_ADMIN', 'DEVELOPER')
  create(@Body() dto: CreateWorkflowDto, @CurrentUser() currentUser: UserPayload) {
    return this.workflowsService.create(dto, currentUser);
  }

  @Get()
  @Roles('SUPER_ADMIN', 'ORG_ADMIN', 'DEVELOPER', 'USER', 'VIEWER')
  findAll(
    @CurrentUser() currentUser: UserPayload,
    @Query('applicationId') applicationId?: string,
  ) {
    return this.workflowsService.findAll(currentUser, applicationId);
  }

  @Get(':id')
  @Roles('SUPER_ADMIN', 'ORG_ADMIN', 'DEVELOPER', 'USER', 'VIEWER')
  findOne(@Param('id') id: string, @CurrentUser() currentUser: UserPayload) {
    return this.workflowsService.findOne(id, currentUser);
  }

  @Patch(':id')
  @Roles('SUPER_ADMIN', 'ORG_ADMIN', 'DEVELOPER')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateWorkflowDto,
    @CurrentUser() currentUser: UserPayload,
  ) {
    return this.workflowsService.update(id, dto, currentUser);
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN', 'ORG_ADMIN')
  remove(@Param('id') id: string, @CurrentUser() currentUser: UserPayload) {
    return this.workflowsService.remove(id, currentUser);
  }

  @Post(':id/activate')
  @Roles('SUPER_ADMIN', 'ORG_ADMIN', 'DEVELOPER')
  @HttpCode(HttpStatus.OK)
  activate(@Param('id') id: string, @CurrentUser() currentUser: UserPayload) {
    return this.workflowsService.activate(id, currentUser);
  }

  @Post(':id/pause')
  @Roles('SUPER_ADMIN', 'ORG_ADMIN', 'DEVELOPER')
  @HttpCode(HttpStatus.OK)
  pause(@Param('id') id: string, @CurrentUser() currentUser: UserPayload) {
    return this.workflowsService.pause(id, currentUser);
  }

  @Post(':id/run')
  @Roles('SUPER_ADMIN', 'ORG_ADMIN', 'DEVELOPER')
  @HttpCode(HttpStatus.OK)
  runWorkflow(
    @Param('id') id: string,
    @Body() dto: RunWorkflowDto,
    @CurrentUser() currentUser: UserPayload,
  ) {
    return this.workflowsService.runWorkflow(id, dto, currentUser);
  }

  @Post(':id/test')
  @Roles('SUPER_ADMIN', 'ORG_ADMIN', 'DEVELOPER')
  @HttpCode(HttpStatus.OK)
  testWorkflow(
    @Param('id') id: string,
    @Body() dto: RunWorkflowDto,
    @CurrentUser() currentUser: UserPayload,
  ) {
    return this.workflowsService.runWorkflow(id, { ...dto, isTest: true }, currentUser);
  }

  @Get(':id/executions')
  @Roles('SUPER_ADMIN', 'ORG_ADMIN', 'DEVELOPER', 'USER', 'VIEWER')
  getExecutions(@Param('id') id: string, @CurrentUser() currentUser: UserPayload) {
    return this.workflowsService.getExecutions(currentUser, id);
  }
}

@Controller('workflow-executions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class WorkflowExecutionsController {
  constructor(private readonly workflowsService: WorkflowsService) {}

  @Get(':id')
  @Roles('SUPER_ADMIN', 'ORG_ADMIN', 'DEVELOPER', 'USER', 'VIEWER')
  getExecutionById(@Param('id') id: string, @CurrentUser() currentUser: UserPayload) {
    return this.workflowsService.getExecutionById(id, currentUser);
  }
}

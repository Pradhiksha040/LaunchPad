import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { WorkflowsService } from './workflows.service';

@ApiTags('Workflow Engine')
@Controller('workflows')
export class WorkflowsController {
  constructor(private workflowsService: WorkflowsService) {}

  @Get()
  @ApiOperation({ summary: 'List active automation workflows' })
  async getWorkflows() {
    return this.workflowsService.getWorkflows();
  }

  @Post()
  @ApiOperation({ summary: 'Create new automation workflow' })
  async createWorkflow(@Body() body: { name: string; triggerEvent: string; steps: string[] }) {
    return this.workflowsService.createWorkflow(body);
  }
}

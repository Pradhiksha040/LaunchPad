import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TemplatesService } from './templates.service';

@ApiTags('Templates')
@Controller('templates')
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @Get()
  @ApiOperation({ summary: 'List all available application templates' })
  @ApiResponse({ status: 200, description: 'Returns array of templates' })
  findAll() {
    return this.templatesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get template details by ID' })
  @ApiResponse({ status: 200, description: 'Returns template details' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  findOne(@Param('id') id: string) {
    return this.templatesService.findOne(id);
  }

  @Get(':id/modules')
  @ApiOperation({ summary: 'Get template-specific recommended modules catalog' })
  @ApiResponse({ status: 200, description: 'Returns array of template modules' })
  getModules(@Param('id') id: string) {
    return this.templatesService.getTemplateModules(id);
  }
}

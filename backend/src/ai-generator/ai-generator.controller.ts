import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import {
  AiGeneratorService,
  ParseRequirementDto,
  AiAppGenerationPlan,
} from './ai-generator.service';

@ApiTags('AI-Assisted App & Workflow Generator')
@Controller('ai-generator')
export class AiGeneratorController {
  constructor(private readonly aiGeneratorService: AiGeneratorService) {}

  @Post('parse-requirement')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Parse Natural Language Requirement into App Generation Plan' })
  async parseRequirement(@Body() dto: ParseRequirementDto) {
    return this.aiGeneratorService.parseRequirement(dto);
  }

  @Post('deploy')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Approve & Deploy Generated Application Blueprint' })
  async deployPlan(@Req() req: any, @Body() body: { plan: AiAppGenerationPlan }) {
    const orgId = req.user.organizationId;
    const userId = req.user.userId || req.user.id;
    return this.aiGeneratorService.deployPlan(orgId, userId, body.plan);
  }
}

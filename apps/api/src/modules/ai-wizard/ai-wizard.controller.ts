import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AIWizardService } from './ai-wizard.service';
import { AISetupWizardRequest } from '@launchpad/shared';

@ApiTags('AI Setup Wizard')
@Controller('ai-wizard')
export class AIWizardController {
  constructor(private wizardService: AIWizardService) {}

  @Post('recommend')
  @ApiOperation({ summary: 'Generate intelligent enterprise connector selection and field mapping config' })
  async recommend(@Body() body: AISetupWizardRequest) {
    return this.wizardService.processSetupWizard(body);
  }
}

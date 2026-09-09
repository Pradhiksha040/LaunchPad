import { Module } from '@nestjs/common';
import { AIWizardService } from './ai-wizard.service';
import { AIWizardController } from './ai-wizard.controller';

@Module({
  providers: [AIWizardService],
  controllers: [AIWizardController],
  exports: [AIWizardService],
})
export class AIWizardModule {}

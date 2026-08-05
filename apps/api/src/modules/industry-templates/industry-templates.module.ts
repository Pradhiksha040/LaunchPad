import { Module } from '@nestjs/common';
import { IndustryTemplatesController } from './industry-templates.controller';

@Module({
  controllers: [IndustryTemplatesController],
})
export class IndustryTemplatesModule {}

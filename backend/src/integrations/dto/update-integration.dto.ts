import { PartialType } from '@nestjs/swagger';
import { CreateIntegrationDto } from './create-integration.dto';
import { IsOptional, IsEnum } from 'class-validator';
import { IntegrationStatus } from '@prisma/client';

export class UpdateIntegrationDto extends PartialType(CreateIntegrationDto) {
  @IsOptional()
  @IsEnum(IntegrationStatus)
  status?: IntegrationStatus;
}

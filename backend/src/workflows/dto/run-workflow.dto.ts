import { IsOptional, IsObject, IsBoolean } from 'class-validator';

export class RunWorkflowDto {
  @IsOptional()
  @IsObject()
  payload?: Record<string, any>;

  @IsOptional()
  @IsBoolean()
  isTest?: boolean;
}

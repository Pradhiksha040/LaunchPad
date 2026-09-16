import { IsString, IsNotEmpty, IsOptional, IsEnum, IsBoolean, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { WorkflowTriggerType, WorkflowStatus, WorkflowOperator, WorkflowActionType } from '@prisma/client';

export class TriggerConfigDto {
  @IsEnum(WorkflowTriggerType)
  type: WorkflowTriggerType;

  @IsOptional()
  @IsString()
  eventName?: string;

  @IsOptional()
  configuration?: Record<string, any>;
}

export class ConditionConfigDto {
  @IsString()
  @IsNotEmpty()
  field: string;

  @IsEnum(WorkflowOperator)
  operator: WorkflowOperator;

  @IsOptional()
  @IsString()
  value?: string;

  @IsOptional()
  @IsString()
  logicalOperator?: string;

  @IsOptional()
  order?: number;
}

export class ActionConfigDto {
  @IsEnum(WorkflowActionType)
  type: WorkflowActionType;

  @IsOptional()
  configuration?: Record<string, any>;

  @IsOptional()
  order?: number;

  @IsOptional()
  @IsBoolean()
  enabled?: boolean;
}

export class CreateWorkflowDto {
  @IsString()
  @IsNotEmpty()
  applicationId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(WorkflowStatus)
  status?: WorkflowStatus;

  @IsOptional()
  @IsEnum(WorkflowTriggerType)
  triggerType?: WorkflowTriggerType;

  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @IsOptional()
  @ValidateNested()
  @Type(() => TriggerConfigDto)
  trigger?: TriggerConfigDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConditionConfigDto)
  conditions?: ConditionConfigDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ActionConfigDto)
  actions?: ActionConfigDto[];
}

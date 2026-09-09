import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { AppMode, AppStatus } from '@prisma/client';

export class BrandingConfigDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  logoUrl?: string;

  @ApiProperty()
  @IsString()
  appName: string;

  @ApiProperty()
  @IsString()
  primaryColor: string;

  @ApiProperty()
  @IsString()
  secondaryColor: string;

  @ApiProperty()
  @IsString()
  font: string;

  @ApiProperty()
  @IsString()
  buttonStyle: string;

  @ApiProperty()
  @IsString()
  borderRadius: string;
}

export class TargetBackendDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  systemName?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  techStack?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  connectorType?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  endpointUrl?: string;
}

export class CreateApplicationDto {
  @ApiProperty({ example: 'Visitor Access Hub' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Visitor check-in & host notifications' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 'Corporate Facilities' })
  @IsString()
  @IsOptional()
  industry?: string;

  @ApiPropertyOptional({ enum: AppMode, default: AppMode.STANDALONE })
  @IsEnum(AppMode)
  @IsOptional()
  mode?: AppMode;

  @ApiPropertyOptional({ enum: AppStatus, default: AppStatus.ACTIVE })
  @IsEnum(AppStatus)
  @IsOptional()
  status?: AppStatus;

  @ApiPropertyOptional({ example: 'template-vms-01' })
  @IsString()
  @IsOptional()
  templateId?: string;

  @ApiPropertyOptional({ example: 'Visitor Management' })
  @IsString()
  @IsOptional()
  templateName?: string;

  @ApiPropertyOptional({ example: ['Visitor Registration', 'Appointment', 'Check-in / Check-out', 'Host Management', 'QR Code', 'Reports'] })
  @IsArray()
  @IsOptional()
  modules?: string[];

  @ApiPropertyOptional({ type: BrandingConfigDto })
  @IsOptional()
  branding?: BrandingConfigDto;

  @ApiPropertyOptional({ type: TargetBackendDto })
  @IsOptional()
  targetBackend?: TargetBackendDto;
}

export class UpdateApplicationDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ enum: AppMode })
  @IsEnum(AppMode)
  @IsOptional()
  mode?: AppMode;

  @ApiPropertyOptional({ enum: AppStatus })
  @IsEnum(AppStatus)
  @IsOptional()
  status?: AppStatus;

  @ApiPropertyOptional()
  @IsArray()
  @IsOptional()
  modules?: string[];

  @ApiPropertyOptional({ type: BrandingConfigDto })
  @IsOptional()
  branding?: BrandingConfigDto;

  @ApiPropertyOptional({ type: TargetBackendDto })
  @IsOptional()
  targetBackend?: TargetBackendDto;
}

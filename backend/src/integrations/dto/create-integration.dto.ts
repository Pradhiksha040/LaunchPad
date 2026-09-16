import { IsString, IsNotEmpty, IsOptional, IsEnum, IsUrl, IsObject } from 'class-validator';
import { IntegrationAuthType } from '@prisma/client';

export class CreateIntegrationDto {
  @IsString()
  @IsNotEmpty()
  applicationId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  connectorId?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsString()
  @IsNotEmpty()
  baseUrl: string;

  @IsEnum(IntegrationAuthType)
  authType: IntegrationAuthType;

  @IsOptional()
  @IsObject()
  credentials?: {
    apiKey?: string;
    headerKey?: string;
    bearerToken?: string;
    jwtToken?: string;
  };

  @IsOptional()
  @IsObject()
  configuration?: Record<string, any>;
}

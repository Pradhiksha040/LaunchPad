import { IsString, IsOptional, IsEnum, IsObject } from 'class-validator';
import { IntegrationAuthType } from '@prisma/client';

export class TestIntegrationDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  baseUrl?: string;

  @IsOptional()
  @IsString()
  endpoint?: string;

  @IsOptional()
  @IsEnum(IntegrationAuthType)
  authType?: IntegrationAuthType;

  @IsOptional()
  @IsObject()
  credentials?: {
    apiKey?: string;
    headerKey?: string;
    bearerToken?: string;
    jwtToken?: string;
  };
}

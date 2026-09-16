import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean, IsArray } from 'class-validator';

export class RegisterPublisherDto {
  @IsString()
  @IsNotEmpty()
  publisherName: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  logoUrl?: string;

  @IsString()
  @IsOptional()
  website?: string;

  @IsString()
  @IsOptional()
  contactEmail?: string;
}

export class CreateMarketplaceAssetDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  type?: 'APPLICATION' | 'MODULE' | 'WORKFLOW';

  @IsString()
  @IsOptional()
  version?: string;

  @IsString()
  @IsOptional()
  iconUrl?: string;

  @IsArray()
  @IsOptional()
  screenshots?: string[];

  @IsArray()
  @IsOptional()
  tags?: string[];

  @IsString()
  @IsOptional()
  pricingType?: 'FREE' | 'ONE_TIME' | 'SUBSCRIPTION' | 'CUSTOM';

  @IsNumber()
  @IsOptional()
  price?: number;

  @IsString()
  @IsOptional()
  visibility?: 'PUBLIC' | 'PRIVATE';

  @IsArray()
  @IsOptional()
  requiredModules?: string[];

  @IsOptional()
  configuration?: Record<string, any>;

  @IsString()
  @IsOptional()
  changelog?: string;
}

export class UpdateMarketplaceAssetDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  type?: 'APPLICATION' | 'MODULE' | 'WORKFLOW';

  @IsString()
  @IsOptional()
  version?: string;

  @IsString()
  @IsOptional()
  iconUrl?: string;

  @IsArray()
  @IsOptional()
  screenshots?: string[];

  @IsArray()
  @IsOptional()
  tags?: string[];

  @IsString()
  @IsOptional()
  pricingType?: 'FREE' | 'ONE_TIME' | 'SUBSCRIPTION' | 'CUSTOM';

  @IsNumber()
  @IsOptional()
  price?: number;

  @IsString()
  @IsOptional()
  visibility?: 'PUBLIC' | 'PRIVATE';

  @IsArray()
  @IsOptional()
  requiredModules?: string[];

  @IsOptional()
  configuration?: Record<string, any>;

  @IsString()
  @IsOptional()
  changelog?: string;
}

export class RejectAssetDto {
  @IsString()
  @IsNotEmpty()
  reason: string;
}

export class InstallAssetDto {
  @IsString()
  @IsOptional()
  targetApplicationId?: string;

  @IsString()
  @IsOptional()
  customAppName?: string;
}

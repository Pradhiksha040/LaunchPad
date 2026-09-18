import { IsString, IsNotEmpty, IsOptional, IsNumber, Max, Min } from 'class-validator';

export class CreateCheckoutSessionDto {
  @IsString()
  @IsNotEmpty()
  assetId: string;

  @IsOptional()
  @IsString()
  successUrl?: string;

  @IsOptional()
  @IsString()
  cancelUrl?: string;
}

export class UpdateCommissionRateDto {
  @IsNumber()
  @Min(0)
  @Max(1)
  commissionRate: number; // e.g., 0.15 for 15%

  @IsOptional()
  @IsString()
  organizationId?: string; // Optional per-org override
}

export class OnboardPublisherDto {
  @IsOptional()
  @IsString()
  returnUrl?: string;

  @IsOptional()
  @IsString()
  refreshUrl?: string;
}

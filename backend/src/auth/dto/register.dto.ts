import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { SystemRole } from '@prisma/client';

export class RegisterDto {
  @ApiProperty({ example: 'Alex Mercer' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'alexander@launchpad-os.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'demoPass123!' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional({ example: 'TechSolutions Inc.' })
  @IsString()
  @IsOptional()
  organizationName?: string;

  @ApiPropertyOptional({ enum: SystemRole, default: SystemRole.ORG_ADMIN })
  @IsOptional()
  role?: SystemRole;
}

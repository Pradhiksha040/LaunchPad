import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'alexander@launchpad-os.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'demoPass123!' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}

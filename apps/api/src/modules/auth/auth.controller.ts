import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { OperatingMode, IndustryType } from '@launchpad/shared';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register Organization & Super Admin User' })
  async register(
    @Body()
    body: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      organizationName: string;
      domain: string;
      industry?: IndustryType;
      mode?: OperatingMode;
    }
  ) {
    return this.authService.register(body);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login user and return JWT access token' })
  async login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body);
  }
}

import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getHealth() {
    return {
      status: 'online',
      message: 'LaunchPad OS Backend API is running',
      frontendUrl: 'http://localhost:3000',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    };
  }
}

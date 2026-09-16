import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { IntegrationsService } from './integrations.service';
import { ConnectorManagerService } from './services/connector-manager.service';
import { CreateIntegrationDto } from './dto/create-integration.dto';
import { UpdateIntegrationDto } from './dto/update-integration.dto';
import { TestIntegrationDto } from './dto/test-integration.dto';
import { ExecuteRequestDto } from './dto/execute-request.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserPayload } from '../common/interfaces/authenticated-request.interface';

@Controller('integrations')
@UseGuards(JwtAuthGuard)
export class IntegrationsController {
  constructor(
    private readonly integrationsService: IntegrationsService,
    private readonly connectorManager: ConnectorManagerService,
  ) {}

  @Get('connectors')
  getConnectors() {
    return this.connectorManager.getConnectors();
  }

  @Get('logs')
  getLogs(@CurrentUser() currentUser: UserPayload) {
    return this.integrationsService.getLogs(currentUser);
  }

  @Post('test')
  @HttpCode(HttpStatus.OK)
  testAdHocConnection(@Body() dto: TestIntegrationDto) {
    return this.integrationsService.testAdHocConnection(dto);
  }

  @Post()
  create(@Body() dto: CreateIntegrationDto, @CurrentUser() currentUser: UserPayload) {
    return this.integrationsService.create(dto, currentUser);
  }

  @Get()
  findAll(
    @CurrentUser() currentUser: UserPayload,
    @Query('applicationId') applicationId?: string,
  ) {
    return this.integrationsService.findAll(currentUser, applicationId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() currentUser: UserPayload) {
    return this.integrationsService.findOne(id, currentUser);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateIntegrationDto,
    @CurrentUser() currentUser: UserPayload,
  ) {
    return this.integrationsService.update(id, dto, currentUser);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() currentUser: UserPayload) {
    return this.integrationsService.remove(id, currentUser);
  }

  @Post(':id/test')
  @HttpCode(HttpStatus.OK)
  testConnection(@Param('id') id: string, @CurrentUser() currentUser: UserPayload) {
    return this.integrationsService.testIntegrationById(id, currentUser);
  }

  @Get(':id/logs')
  getIntegrationLogs(@Param('id') id: string, @CurrentUser() currentUser: UserPayload) {
    return this.integrationsService.getLogs(currentUser, id);
  }

  @Post(':id/execute')
  @HttpCode(HttpStatus.OK)
  executeRequest(
    @Param('id') id: string,
    @Body() dto: ExecuteRequestDto,
    @CurrentUser() currentUser: UserPayload,
  ) {
    return this.integrationsService.executeRequest(id, dto, currentUser);
  }
}

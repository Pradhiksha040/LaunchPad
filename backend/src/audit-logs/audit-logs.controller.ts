import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuditLogsService } from './audit-logs.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserPayload } from '../common/interfaces/authenticated-request.interface';

@ApiTags('Audit Logs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('audit-logs')
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Get()
  @Roles('SUPER_ADMIN', 'ORG_ADMIN', 'DEVELOPER')
  @ApiOperation({ summary: 'Get organization audit logs' })
  async getAuditLogs(
    @CurrentUser() user: UserPayload,
    @Query('limit') limit?: string,
  ) {
    const orgId = user.role === 'SUPER_ADMIN' ? undefined : user.organizationId;
    return this.auditLogsService.findAll(orgId, limit ? parseInt(limit, 10) : 50);
  }
}

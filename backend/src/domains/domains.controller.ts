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
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DomainsService } from './domains.service';
import { CreateDomainDto, UpdateBrandingDto } from './dto/create-domain.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Domains & White-Label')
@Controller('domains')
export class DomainsController {
  constructor(private readonly domainsService: DomainsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add custom domain for organization' })
  async createDomain(@Body() dto: CreateDomainDto, @Req() req: any) {
    return this.domainsService.createDomain(dto, req.user);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List custom domains for current organization' })
  async findAll(@Req() req: any) {
    return this.domainsService.findAllForOrg(req.user);
  }

  @Post(':id/verify')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify DNS records for custom domain' })
  async verifyDomain(@Param('id') id: string, @Req() req: any) {
    return this.domainsService.verifyDomain(id, req.user);
  }

  @Patch(':id/primary')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Set custom domain as primary domain' })
  async setPrimaryDomain(@Param('id') id: string, @Req() req: any) {
    return this.domainsService.setPrimaryDomain(id, req.user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove custom domain' })
  async removeDomain(@Param('id') id: string, @Req() req: any) {
    return this.domainsService.removeDomain(id, req.user);
  }

  @Get('resolve')
  @ApiOperation({ summary: 'Public tenant and white-label branding resolution by hostname' })
  async resolveTenant(@Query('hostname') hostname: string) {
    const targetHost = hostname || 'localhost';
    return this.domainsService.resolveTenant(targetHost);
  }

  @Get('branding')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get white-label branding for organization' })
  async getBranding(@Req() req: any) {
    return this.domainsService.getOrgBranding(req.user.organizationId, req.user);
  }

  @Patch('branding')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update white-label branding for organization' })
  async updateBranding(@Body() dto: UpdateBrandingDto, @Req() req: any) {
    return this.domainsService.updateOrgBranding(req.user.organizationId, dto, req.user);
  }
}

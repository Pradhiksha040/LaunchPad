import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto, UpdateOrganizationDto } from './dto/create-organization.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserPayload } from '../common/interfaces/authenticated-request.interface';

@ApiTags('Organizations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Post()
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Create a new organization (Super Admin)' })
  create(
    @Body() dto: CreateOrganizationDto,
    @CurrentUser() currentUser: UserPayload,
  ) {
    return this.organizationsService.create(dto, currentUser);
  }

  @Get()
  @Roles('SUPER_ADMIN', 'ORG_ADMIN', 'DEVELOPER', 'USER', 'VIEWER')
  @ApiOperation({ summary: 'List user organization(s)' })
  findAll(@CurrentUser() currentUser: UserPayload) {
    return this.organizationsService.findAll(currentUser);
  }

  @Get(':id')
  @Roles('SUPER_ADMIN', 'ORG_ADMIN', 'DEVELOPER', 'USER', 'VIEWER')
  @ApiOperation({ summary: 'Get organization by ID' })
  findOne(@Param('id') id: string, @CurrentUser() currentUser: UserPayload) {
    return this.organizationsService.findOne(id, currentUser);
  }

  @Patch(':id')
  @Roles('SUPER_ADMIN', 'ORG_ADMIN')
  @ApiOperation({ summary: 'Update organization details' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateOrganizationDto,
    @CurrentUser() currentUser: UserPayload,
  ) {
    return this.organizationsService.update(id, dto, currentUser);
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Delete organization (Super Admin)' })
  remove(@Param('id') id: string, @CurrentUser() currentUser: UserPayload) {
    return this.organizationsService.remove(id, currentUser);
  }
}

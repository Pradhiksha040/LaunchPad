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
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserPayload } from '../common/interfaces/authenticated-request.interface';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles('SUPER_ADMIN', 'ORG_ADMIN')
  @ApiOperation({ summary: 'Create a new user in the organization' })
  create(@Body() dto: CreateUserDto, @CurrentUser() currentUser: UserPayload) {
    return this.usersService.create(dto, currentUser);
  }

  @Get()
  @Roles('SUPER_ADMIN', 'ORG_ADMIN', 'DEVELOPER', 'USER', 'VIEWER')
  @ApiOperation({ summary: 'List all users in the organization' })
  findAll(@CurrentUser() currentUser: UserPayload) {
    return this.usersService.findAll(currentUser);
  }

  @Get(':id')
  @Roles('SUPER_ADMIN', 'ORG_ADMIN', 'DEVELOPER', 'USER', 'VIEWER')
  @ApiOperation({ summary: 'Get user details by ID' })
  findOne(@Param('id') id: string, @CurrentUser() currentUser: UserPayload) {
    return this.usersService.findOne(id, currentUser);
  }

  @Patch(':id')
  @Roles('SUPER_ADMIN', 'ORG_ADMIN')
  @ApiOperation({ summary: 'Update user profile or role' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser() currentUser: UserPayload,
  ) {
    return this.usersService.update(id, dto, currentUser);
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN', 'ORG_ADMIN')
  @ApiOperation({ summary: 'Delete user from organization' })
  remove(@Param('id') id: string, @CurrentUser() currentUser: UserPayload) {
    return this.usersService.remove(id, currentUser);
  }
}

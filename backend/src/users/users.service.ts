import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { CreateUserDto, UpdateUserDto } from './dto/create-user.dto';
import { UserPayload } from '../common/interfaces/authenticated-request.interface';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private auditLogsService: AuditLogsService,
  ) {}

  async create(dto: CreateUserDto, currentUser: UserPayload) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (existing) {
      throw new ConflictException('A user with this email address already exists.');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email.toLowerCase(),
        passwordHash,
        organizationId: currentUser.organizationId,
        role: dto.role || 'USER',
        avatar: dto.avatar || null,
      },
      include: {
        organization: true,
      },
    });

    await this.auditLogsService.logAction({
      userId: currentUser.userId,
      organizationId: currentUser.organizationId,
      action: 'User Created',
      resource: 'User',
      resourceId: user.id,
      details: `Created user ${user.name} (${user.email}) with role ${user.role}`,
    });

    return this.sanitizeUser(user);
  }

  async findAll(currentUser: UserPayload) {
    const where = currentUser.role === 'SUPER_ADMIN' ? {} : { organizationId: currentUser.organizationId };

    const users = await this.prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        organization: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    return users.map((u) => this.sanitizeUser(u));
  }

  async findOne(id: string, currentUser: UserPayload) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        organization: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID '${id}' not found.`);
    }

    if (currentUser.role !== 'SUPER_ADMIN' && user.organizationId !== currentUser.organizationId) {
      throw new ForbiddenException("Access denied to another organization's user.");
    }

    return this.sanitizeUser(user);
  }

  async update(id: string, dto: UpdateUserDto, currentUser: UserPayload) {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User with ID '${id}' not found.`);
    }

    if (currentUser.role !== 'SUPER_ADMIN' && user.organizationId !== currentUser.organizationId) {
      throw new ForbiddenException("Access denied to another organization's user.");
    }

    const isRoleChanged = dto.role && dto.role !== user.role;

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.role && { role: dto.role }),
        ...(dto.status && { status: dto.status }),
        ...(dto.avatar !== undefined && { avatar: dto.avatar }),
      },
      include: {
        organization: true,
      },
    });

    if (isRoleChanged) {
      await this.auditLogsService.logAction({
        userId: currentUser.userId,
        organizationId: currentUser.organizationId,
        action: 'User Role Changed',
        resource: 'User',
        resourceId: updatedUser.id,
        details: `Changed role of ${updatedUser.email} from ${user.role} to ${dto.role}`,
      });
    }

    return this.sanitizeUser(updatedUser);
  }

  async remove(id: string, currentUser: UserPayload) {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User with ID '${id}' not found.`);
    }

    if (currentUser.role !== 'SUPER_ADMIN' && user.organizationId !== currentUser.organizationId) {
      throw new ForbiddenException("Access denied to another organization's user.");
    }

    await this.prisma.user.delete({ where: { id } });

    await this.auditLogsService.logAction({
      userId: currentUser.userId,
      organizationId: currentUser.organizationId,
      action: 'User Deleted',
      resource: 'User',
      resourceId: id,
      details: `Deleted user ${user.email}`,
    });

    return { success: true, message: `User '${user.email}' deleted successfully.` };
  }

  private sanitizeUser(user: any) {
    const { passwordHash, ...rest } = user;
    return rest;
  }
}

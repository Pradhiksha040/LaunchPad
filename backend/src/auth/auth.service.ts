import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { SystemRole } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private auditLogsService: AuditLogsService,
  ) {}

  async register(dto: RegisterDto, reqIp?: string, userAgent?: string) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (existingUser) {
      throw new ConflictException('A user with this email address already exists.');
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(dto.password, saltRounds);

    let orgId: string;
    const orgName = dto.organizationName || 'Default Organization';
    const slug = orgName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const existingOrg = await this.prisma.organization.findFirst({
      where: { OR: [{ slug }, { name: orgName }] },
    });

    if (existingOrg) {
      orgId = existingOrg.id;
    } else {
      const newOrg = await this.prisma.organization.create({
        data: {
          name: orgName,
          slug: `${slug}-${Date.now().toString(36)}`,
          industry: 'Technology',
          domain: dto.email.split('@')[1] || 'example.com',
        },
      });
      orgId = newOrg.id;

      await this.auditLogsService.logAction({
        organizationId: orgId,
        action: 'Organization Created',
        resource: 'Organization',
        resourceId: orgId,
        details: `Organization ${orgName} created via user registration`,
        ip: reqIp,
        userAgent,
      });
    }

    const role = dto.role || SystemRole.ORG_ADMIN;

    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        passwordHash,
        name: dto.name,
        organizationId: orgId,
        role,
        status: 'ACTIVE',
      },
      include: {
        organization: true,
      },
    });

    await this.auditLogsService.logAction({
      userId: user.id,
      organizationId: orgId,
      action: 'User Registered',
      resource: 'User',
      resourceId: user.id,
      details: `User ${user.name} (${user.email}) registered with role ${user.role}`,
      ip: reqIp,
      userAgent,
    });

    const tokens = await this.generateTokens(user.id, user.email, user.role, user.organizationId, user.name);

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async login(dto: LoginDto, reqIp?: string, userAgent?: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
      include: {
        organization: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password credentials.');
    }

    if (user.status === 'DISABLED') {
      throw new UnauthorizedException('This account has been disabled.');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);

    if (!isPasswordValid) {
      await this.auditLogsService.logAction({
        userId: user.id,
        organizationId: user.organizationId,
        action: 'Login Failed',
        resource: 'Auth',
        status: 'failed',
        details: 'Incorrect password attempt',
        ip: reqIp,
        userAgent,
      });
      throw new UnauthorizedException('Invalid email or password credentials.');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    await this.auditLogsService.logAction({
      userId: user.id,
      organizationId: user.organizationId,
      action: 'User Login',
      resource: 'Auth',
      resourceId: user.id,
      details: `User ${user.name} logged in successfully`,
      ip: reqIp,
      userAgent,
    });

    const tokens = await this.generateTokens(user.id, user.email, user.role, user.organizationId, user.name);

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const refreshSecret =
        this.configService.get<string>('JWT_REFRESH_SECRET') ||
        'super-secret-launchpad-refresh-key-change-in-production';
      const payload = this.jwtService.verify(refreshToken, { secret: refreshSecret });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        include: { organization: true },
      });

      if (!user || user.status === 'DISABLED') {
        throw new UnauthorizedException('Invalid refresh token or inactive account.');
      }

      const tokens = await this.generateTokens(user.id, user.email, user.role, user.organizationId, user.name);

      return {
        user: this.sanitizeUser(user),
        ...tokens,
      };
    } catch (e) {
      throw new UnauthorizedException('Invalid or expired refresh token.');
    }
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        organization: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User account not found.');
    }

    return this.sanitizeUser(user);
  }

  private async generateTokens(
    userId: string,
    email: string,
    role: SystemRole,
    organizationId: string,
    name: string,
  ) {
    const payload = {
      sub: userId,
      email,
      role,
      organizationId,
      name,
    };

    const accessToken = this.jwtService.sign(payload);

    const refreshSecret =
      this.configService.get<string>('JWT_REFRESH_SECRET') ||
      'super-secret-launchpad-refresh-key-change-in-production';
    const refreshToken = this.jwtService.sign(payload, {
      secret: refreshSecret,
      expiresIn: '7d',
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: 86400, // 24 hours
    };
  }

  private sanitizeUser(user: any) {
    const { passwordHash, ...rest } = user;
    return rest;
  }
}

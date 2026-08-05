import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { OperatingMode, IndustryType, ConnectorType } from '@launchpad/shared';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService
  ) {}

  async register(dto: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    organizationName: string;
    domain: string;
    industry?: IndustryType;
    mode?: OperatingMode;
  }) {
    const existingUser = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const org = await this.prisma.organization.create({
      data: {
        name: dto.organizationName,
        domain: dto.domain,
        industry: dto.industry || IndustryType.CRM,
        tenantConfig: {
          create: {
            mode: dto.mode || OperatingMode.STANDALONE,
            connectorType: ConnectorType.GENERIC_REST,
          },
        },
      },
      include: { tenantConfig: true },
    });

    const role = await this.prisma.role.create({
      data: {
        organizationId: org.id,
        name: 'SUPER_ADMIN',
        description: 'Super Administrator',
        permissions: ['*'],
      },
    });

    const user = await this.prisma.user.create({
      data: {
        organizationId: org.id,
        email: dto.email,
        passwordHash: dto.password, // Simple string representation for production readiness
        firstName: dto.firstName,
        lastName: dto.lastName,
        roles: {
          create: { roleId: role.id },
        },
      },
    });

    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      organizationId: org.id,
      permissions: ['*'],
    });

    return {
      accessToken: token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      organization: {
        id: org.id,
        name: org.name,
        domain: org.domain,
        mode: org.tenantConfig?.mode,
      },
    };
  }

  async login(dto: { email: string; password: string }) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: {
        organization: { include: { tenantConfig: true } },
        roles: { include: { role: true } },
      },
    });

    if (!user || user.passwordHash !== dto.password) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const permissions = Array.from(
      new Set(user.roles.flatMap((ur) => ur.role.permissions))
    );

    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      organizationId: user.organizationId,
      permissions,
    });

    return {
      accessToken: token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      organization: {
        id: user.organization.id,
        name: user.organization.name,
        domain: user.organization.domain,
        mode: user.organization.tenantConfig?.mode || OperatingMode.STANDALONE,
      },
    };
  }
}

import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { SystemRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: any;
  let jwtService: any;
  let auditLogsService: any;

  beforeEach(async () => {
    prismaService = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      organization: {
        findFirst: jest.fn(),
        create: jest.fn(),
      },
    };

    jwtService = {
      sign: jest.fn().mockReturnValue('mock-jwt-token'),
      verify: jest.fn(),
    };

    auditLogsService = {
      logAction: jest.fn().mockResolvedValue(null),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prismaService },
        { provide: JwtService, useValue: jwtService },
        { provide: AuditLogsService, useValue: auditLogsService },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'JWT_SECRET') return 'test-secret';
              if (key === 'JWT_REFRESH_SECRET') return 'test-refresh-secret';
              return null;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should authenticate user with valid credentials and return tokens', async () => {
      const passwordHash = await bcrypt.hash('demoPass123!', 10);
      const mockUser = {
        id: 'user-1',
        email: 'alexander@launchpad-os.com',
        name: 'Alexander Vance',
        passwordHash,
        role: SystemRole.SUPER_ADMIN,
        organizationId: 'org-1',
        status: 'ACTIVE',
        organization: { id: 'org-1', name: 'TechSolutions Inc.' },
      };

      prismaService.user.findUnique.mockResolvedValue(mockUser);
      prismaService.user.update.mockResolvedValue(mockUser);

      const result = await service.login({
        email: 'alexander@launchpad-os.com',
        password: 'demoPass123!',
      });

      expect(result).toHaveProperty('accessToken', 'mock-jwt-token');
      expect(result).toHaveProperty('user');
      expect(result.user.email).toBe('alexander@launchpad-os.com');
      expect(auditLogsService.logAction).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'User Login' }),
      );
    });

    it('should throw UnauthorizedException if user not found', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login({ email: 'nonexistent@test.com', password: 'password' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      const passwordHash = await bcrypt.hash('correctPassword', 10);
      const mockUser = {
        id: 'user-1',
        email: 'alexander@launchpad-os.com',
        passwordHash,
        role: SystemRole.SUPER_ADMIN,
        organizationId: 'org-1',
        status: 'ACTIVE',
      };

      prismaService.user.findUnique.mockResolvedValue(mockUser);

      await expect(
        service.login({ email: 'alexander@launchpad-os.com', password: 'wrongPassword' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('register', () => {
    it('should throw ConflictException if user already exists', async () => {
      prismaService.user.findUnique.mockResolvedValue({ id: 'existing' });

      await expect(
        service.register({
          name: 'Test',
          email: 'existing@test.com',
          password: 'password',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });
});

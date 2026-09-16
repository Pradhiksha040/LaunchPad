import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import {
  RegisterPublisherDto,
  CreateMarketplaceAssetDto,
  UpdateMarketplaceAssetDto,
  RejectAssetDto,
  InstallAssetDto,
} from './dto/create-asset.dto';
import { UserPayload } from '../common/interfaces/authenticated-request.interface';

import { MarketplaceSecurityService } from './marketplace-security.service';

@Injectable()
export class MarketplaceService {
  constructor(
    private prisma: PrismaService,
    private auditLogsService: AuditLogsService,
    private securityService: MarketplaceSecurityService,
  ) {}

  async registerPublisher(dto: RegisterPublisherDto, currentUser: UserPayload) {
    if (!currentUser.organizationId) {
      throw new ForbiddenException('Organization required to become a publisher.');
    }

    const org = await this.prisma.organization.findUnique({
      where: { id: currentUser.organizationId },
    });

    if (!org) {
      throw new NotFoundException('Organization not found.');
    }

    const profile = {
      publisherName: dto.publisherName || org.name,
      description: dto.description || '',
      logoUrl: dto.logoUrl || '',
      website: dto.website || '',
      contactEmail: dto.contactEmail || currentUser.email,
    };

    const updated = await this.prisma.organization.update({
      where: { id: org.id },
      data: {
        isPublisher: true,
        publisherProfile: profile,
      },
    });

    await this.auditLogsService.logAction({
      userId: currentUser.userId,
      organizationId: org.id,
      action: 'MARKETPLACE_PUBLISHER_REGISTERED',
      resource: 'Organization',
      resourceId: org.id,
      details: `Organization registered as Marketplace Publisher: ${dto.publisherName}`,
    });

    return updated;
  }

  async verifyPublisher(orgId: string, status: string, currentUser: UserPayload) {
    if (currentUser.role !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Only Super Admins can verify publishers.');
    }

    const org = await this.prisma.organization.findUnique({ where: { id: orgId } });
    if (!org) {
      throw new NotFoundException(`Publisher Organization '${orgId}' not found.`);
    }

    const updated = await this.prisma.organization.update({
      where: { id: orgId },
      data: {
        isPublisher: true,
        publisherStatus: status || 'VERIFIED_PARTNER',
        verifiedPublisherAt: new Date(),
      },
    });

    await this.auditLogsService.logAction({
      userId: currentUser.userId,
      organizationId: orgId,
      action: 'MARKETPLACE_PUBLISHER_VERIFIED',
      resource: 'Organization',
      resourceId: orgId,
      details: `SuperAdmin verified publisher status for ${org.name} to ${status}`,
    });

    return updated;
  }

  async createAsset(dto: CreateMarketplaceAssetDto, currentUser: UserPayload) {
    if (!currentUser.organizationId) {
      throw new ForbiddenException('Organization required to create marketplace assets.');
    }

    const org = await this.prisma.organization.findUnique({
      where: { id: currentUser.organizationId },
    });

    const slug = `${dto.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}-${Date.now().toString(36)}`;

    const asset = await this.prisma.marketplaceAsset.create({
      data: {
        name: dto.name,
        slug,
        description: dto.description,
        category: dto.category || 'General',
        type: dto.type || 'APPLICATION',
        version: dto.version || '1.0.0',
        publisherId: currentUser.organizationId,
        authorName: org?.name || currentUser.email,
        iconUrl: dto.iconUrl || '',
        screenshots: dto.screenshots || [],
        tags: dto.tags || ['Marketplace', dto.category || 'General'],
        pricingType: dto.pricingType || 'FREE',
        price: dto.price || 0,
        status: 'DRAFT',
        scanStatus: 'SCAN_PENDING',
        visibility: dto.visibility || 'PUBLIC',
        requiredModules: dto.requiredModules || [],
        configuration: dto.configuration || {},
        changelog: dto.changelog || 'Initial release.',
      },
    });

    await this.auditLogsService.logAction({
      userId: currentUser.userId,
      organizationId: currentUser.organizationId,
      action: 'MARKETPLACE_ASSET_CREATED',
      resource: 'MarketplaceAsset',
      resourceId: asset.id,
      details: `Created draft marketplace asset ${asset.name} (${asset.type})`,
    });

    return asset;
  }

  async updateAsset(id: string, dto: UpdateMarketplaceAssetDto, currentUser: UserPayload) {
    const asset = await this.prisma.marketplaceAsset.findUnique({ where: { id } });
    if (!asset) {
      throw new NotFoundException(`Marketplace asset '${id}' not found.`);
    }

    if (currentUser.role !== 'SUPER_ADMIN' && asset.publisherId !== currentUser.organizationId) {
      throw new ForbiddenException('Cross-tenant asset modification denied.');
    }

    const isVersionOrConfigChange = Boolean(dto.version || dto.configuration || dto.requiredModules);

    const updated = await this.prisma.marketplaceAsset.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.description && { description: dto.description }),
        ...(dto.category && { category: dto.category }),
        ...(dto.type && { type: dto.type }),
        ...(dto.version && { version: dto.version }),
        ...(dto.iconUrl !== undefined && { iconUrl: dto.iconUrl }),
        ...(dto.screenshots && { screenshots: dto.screenshots }),
        ...(dto.tags && { tags: dto.tags }),
        ...(dto.pricingType && { pricingType: dto.pricingType }),
        ...(dto.price !== undefined && { price: dto.price }),
        ...(dto.visibility && { visibility: dto.visibility }),
        ...(dto.requiredModules && { requiredModules: dto.requiredModules }),
        ...(dto.configuration && { configuration: dto.configuration }),
        ...(dto.changelog && { changelog: dto.changelog }),
        ...(isVersionOrConfigChange && {
          scanStatus: 'SCAN_PENDING',
          status: 'DRAFT',
        }),
      },
    });

    await this.auditLogsService.logAction({
      userId: currentUser.userId,
      organizationId: currentUser.organizationId,
      action: 'MARKETPLACE_ASSET_UPDATED',
      resource: 'MarketplaceAsset',
      resourceId: asset.id,
      details: `Updated marketplace asset ${updated.name}${isVersionOrConfigChange ? ' (Version reset to DRAFT / SCAN_PENDING)' : ''}`,
    });

    return updated;
  }

  async submitForReview(id: string, currentUser: UserPayload) {
    const asset = await this.prisma.marketplaceAsset.findUnique({ where: { id } });
    if (!asset) {
      throw new NotFoundException(`Marketplace asset '${id}' not found.`);
    }

    if (currentUser.role !== 'SUPER_ADMIN' && asset.publisherId !== currentUser.organizationId) {
      throw new ForbiddenException('Cross-tenant submission denied.');
    }

    // Automatically trigger security scan prior to submission approval
    const scanResult = await this.securityService.runSecurityScan(id);

    const updated = await this.prisma.marketplaceAsset.update({
      where: { id },
      data: {
        status: 'SUBMITTED',
        rejectionReason: null,
      },
    });

    await this.auditLogsService.logAction({
      userId: currentUser.userId,
      organizationId: currentUser.organizationId,
      action: 'MARKETPLACE_ASSET_SUBMITTED',
      resource: 'MarketplaceAsset',
      resourceId: asset.id,
      details: `Submitted marketplace asset ${asset.name} for admin approval. Scan Status: ${scanResult.scanStatus}`,
    });

    return {
      asset: updated,
      scanResult,
    };
  }

  async approveAsset(id: string, currentUser: UserPayload) {
    if (currentUser.role !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Only Super Admins can approve marketplace assets.');
    }

    const asset = await this.prisma.marketplaceAsset.findUnique({ where: { id } });
    if (!asset) {
      throw new NotFoundException(`Marketplace asset '${id}' not found.`);
    }

    if (asset.scanStatus === 'SCAN_FAILED') {
      throw new BadRequestException(`Cannot approve asset '${asset.name}' with SCAN_FAILED security status. Resolve critical security findings first.`);
    }

    const updated = await this.prisma.marketplaceAsset.update({
      where: { id },
      data: { status: 'APPROVED' },
    });

    await this.auditLogsService.logAction({
      userId: currentUser.userId,
      organizationId: asset.publisherId,
      action: 'MARKETPLACE_REVIEW_APPROVED',
      resource: 'MarketplaceAsset',
      resourceId: asset.id,
      details: `Approved marketplace asset ${asset.name}`,
    });

    return updated;
  }

  async rejectAsset(id: string, dto: RejectAssetDto, currentUser: UserPayload) {
    if (currentUser.role !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Only Super Admins can reject marketplace assets.');
    }

    const asset = await this.prisma.marketplaceAsset.findUnique({ where: { id } });
    if (!asset) {
      throw new NotFoundException(`Marketplace asset '${id}' not found.`);
    }

    const updated = await this.prisma.marketplaceAsset.update({
      where: { id },
      data: { status: 'REJECTED', rejectionReason: dto.reason },
    });

    await this.auditLogsService.logAction({
      userId: currentUser.userId,
      organizationId: asset.publisherId,
      action: 'MARKETPLACE_REVIEW_REJECTED',
      resource: 'MarketplaceAsset',
      resourceId: asset.id,
      details: `Rejected marketplace asset ${asset.name}. Reason: ${dto.reason}`,
    });

    return updated;
  }

  async publishAsset(id: string, currentUser: UserPayload) {
    const asset = await this.prisma.marketplaceAsset.findUnique({ where: { id } });
    if (!asset) {
      throw new NotFoundException(`Marketplace asset '${id}' not found.`);
    }

    if (currentUser.role !== 'SUPER_ADMIN' && asset.publisherId !== currentUser.organizationId) {
      throw new ForbiddenException('Cross-tenant publishing denied.');
    }

    if (asset.scanStatus === 'SCAN_FAILED') {
      throw new BadRequestException(`Cannot publish asset '${asset.name}' with SCAN_FAILED security status.`);
    }

    if (asset.status !== 'APPROVED' && asset.status !== 'UNPUBLISHED' && currentUser.role !== 'SUPER_ADMIN') {
      throw new BadRequestException('Asset must be approved by SuperAdmin before publishing.');
    }

    const updated = await this.prisma.marketplaceAsset.update({
      where: { id },
      data: { status: 'PUBLISHED' },
    });

    await this.auditLogsService.logAction({
      userId: currentUser.userId,
      organizationId: asset.publisherId,
      action: 'MARKETPLACE_ASSET_PUBLISHED',
      resource: 'MarketplaceAsset',
      resourceId: asset.id,
      details: `Published marketplace asset ${asset.name} live to catalog`,
    });

    return updated;
  }

  async unpublishAsset(id: string, currentUser: UserPayload) {
    const asset = await this.prisma.marketplaceAsset.findUnique({ where: { id } });
    if (!asset) {
      throw new NotFoundException(`Marketplace asset '${id}' not found.`);
    }

    if (currentUser.role !== 'SUPER_ADMIN' && asset.publisherId !== currentUser.organizationId) {
      throw new ForbiddenException('Cross-tenant unpublishing denied.');
    }

    const updated = await this.prisma.marketplaceAsset.update({
      where: { id },
      data: { status: 'UNPUBLISHED' },
    });

    await this.auditLogsService.logAction({
      userId: currentUser.userId,
      organizationId: asset.publisherId,
      action: 'MARKETPLACE_ASSET_UNPUBLISHED',
      resource: 'MarketplaceAsset',
      resourceId: asset.id,
      details: `Unpublished marketplace asset ${asset.name}`,
    });

    return updated;
  }

  async findAllPublic(query?: {
    search?: string;
    category?: string;
    type?: string;
    pricingType?: string;
  }) {
    const where: any = {
      status: 'PUBLISHED',
      visibility: 'PUBLIC',
    };

    if (query?.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query?.category && query.category !== 'All') {
      where.category = query.category;
    }

    if (query?.type && query.type !== 'All') {
      where.type = query.type;
    }

    if (query?.pricingType && query.pricingType !== 'All') {
      where.pricingType = query.pricingType;
    }

    return this.prisma.marketplaceAsset.findMany({
      where,
      orderBy: [{ installationsCount: 'desc' }, { createdAt: 'desc' }],
      include: {
        publisher: {
          select: { id: true, name: true, slug: true, isPublisher: true, publisherProfile: true },
        },
      },
    });
  }

  async findBySlug(slug: string) {
    const asset = await this.prisma.marketplaceAsset.findUnique({
      where: { slug },
      include: {
        publisher: {
          select: { id: true, name: true, slug: true, isPublisher: true, publisherProfile: true },
        },
        installations: {
          take: 5,
          select: { id: true, installedAt: true, installedVersion: true },
        },
      },
    });

    if (!asset) {
      throw new NotFoundException(`Marketplace asset with slug '${slug}' not found.`);
    }

    return asset;
  }

  async installAsset(id: string, dto: InstallAssetDto, currentUser: UserPayload) {
    if (!currentUser.organizationId) {
      throw new ForbiddenException('Organization required to install marketplace assets.');
    }

    const asset = await this.prisma.marketplaceAsset.findUnique({ where: { id } });
    if (!asset) {
      throw new NotFoundException(`Marketplace asset '${id}' not found.`);
    }

    let installedAppId: string | null = null;

    // If installing an APPLICATION type asset, create a new Application for the organization
    if (asset.type === 'APPLICATION') {
      const appName = dto.customAppName || asset.name;
      const appSlug = `${appName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}-${Date.now().toString(36)}`;

      const newApp = await this.prisma.application.create({
        data: {
          organizationId: currentUser.organizationId,
          name: appName,
          slug: appSlug,
          description: asset.description,
          mode: 'STANDALONE',
          status: 'ACTIVE',
          environment: 'development',
        },
      });
      installedAppId = newApp.id;

      // Add default modules required by the marketplace asset
      const requiredModules = (asset.requiredModules as string[]) || ['Core Module', 'Analytics', 'Settings'];
      for (let i = 0; i < requiredModules.length; i++) {
        await this.prisma.applicationModule.create({
          data: {
            applicationId: newApp.id,
            name: requiredModules[i],
            code: requiredModules[i].toLowerCase().replace(/[^a-z0-9]+/g, '_'),
            description: `Installed via Marketplace asset '${asset.name}'`,
            category: asset.category,
            isEnabled: true,
            order: i,
          },
        });
      }
    }

    // Record Marketplace Installation
    const installation = await this.prisma.marketplaceInstallation.create({
      data: {
        assetId: asset.id,
        organizationId: currentUser.organizationId,
        applicationId: installedAppId || dto.targetApplicationId || null,
        installedVersion: asset.version,
        status: 'ACTIVE',
      },
    });

    // Increment installation counter
    await this.prisma.marketplaceAsset.update({
      where: { id: asset.id },
      data: { installationsCount: { increment: 1 } },
    });

    await this.auditLogsService.logAction({
      userId: currentUser.userId,
      organizationId: currentUser.organizationId,
      action: 'MARKETPLACE_ASSET_INSTALLED',
      resource: 'MarketplaceAsset',
      resourceId: asset.id,
      details: `Installed marketplace asset '${asset.name}' (v${asset.version}) into organization`,
    });

    return {
      success: true,
      message: `Successfully installed '${asset.name}' into organization.`,
      installation,
      installedApplicationId: installedAppId,
    };
  }

  async getPendingReviews(currentUser: UserPayload) {
    if (currentUser.role !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Only Super Admins can access the marketplace review dashboard.');
    }

    return this.prisma.marketplaceAsset.findMany({
      where: {
        status: { in: ['SUBMITTED', 'DRAFT'] },
      },
      orderBy: { updatedAt: 'desc' },
      include: {
        publisher: {
          select: { id: true, name: true, slug: true, isPublisher: true, publisherStatus: true, publisherProfile: true },
        },
        securityFindings: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async runAssetSecurityScan(id: string, currentUser: UserPayload) {
    const asset = await this.prisma.marketplaceAsset.findUnique({ where: { id } });
    if (!asset) {
      throw new NotFoundException(`Marketplace asset '${id}' not found.`);
    }

    if (currentUser.role !== 'SUPER_ADMIN' && asset.publisherId !== currentUser.organizationId) {
      throw new ForbiddenException('Cross-tenant scan trigger denied.');
    }

    return this.securityService.runSecurityScan(id);
  }

  async getAssetFindings(id: string) {
    return this.securityService.getAssetFindings(id);
  }
}

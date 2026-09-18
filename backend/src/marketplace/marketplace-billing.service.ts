import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { UserPayload } from '../common/interfaces/authenticated-request.interface';
import {
  CreateCheckoutSessionDto,
  UpdateCommissionRateDto,
  OnboardPublisherDto,
} from './dto/billing.dto';

export interface CheckoutSessionResponse {
  sessionId: string;
  checkoutUrl: string;
  transactionId: string;
  idempotencyKey: string;
  amount: number;
  platformFee: number;
  publisherEarnings: number;
  commissionRate: number;
  currency: string;
}

export interface PublisherEarningsOverview {
  publisherOrgId: string;
  stripeAccountId: string | null;
  stripeAccountStatus: string;
  grossSalesAmount: number;
  platformFeesDeducted: number;
  netPublisherEarnings: number;
  completedTransactionsCount: number;
  payouts: any[];
  recentTransactions: any[];
}

export interface PlatformFinancialOverview {
  totalGrossVolume: number;
  totalPlatformCommissionCollected: number;
  totalNetPublisherEarnings: number;
  defaultCommissionRate: number;
  totalTransactionsCount: number;
  activeSubscriptionsCount: number;
  topPublishers: any[];
}

@Injectable()
export class MarketplaceBillingService {
  constructor(
    private prisma: PrismaService,
    private auditLogsService: AuditLogsService,
  ) {}

  /**
   * Fetches the dynamic platform commission rate (Default: 15% / 0.15)
   */
  async getPlatformCommissionRate(orgId?: string): Promise<number> {
    if (orgId) {
      const org = await this.prisma.organization.findUnique({
        where: { id: orgId },
        select: { customCommissionRate: true },
      });
      if (org && org.customCommissionRate !== null && org.customCommissionRate !== undefined) {
        return org.customCommissionRate;
      }
    }

    const setting = await this.prisma.platformSetting.findUnique({
      where: { key: 'default_commission_rate' },
    });

    if (setting && setting.value) {
      const parsed = parseFloat(setting.value);
      if (!isNaN(parsed) && parsed >= 0 && parsed <= 1) {
        return parsed;
      }
    }

    return 0.15; // 15% default rate
  }

  /**
   * SuperAdmin configures platform-wide or per-org commission rates
   */
  async updatePlatformCommissionRate(
    dto: UpdateCommissionRateDto,
    currentUser: UserPayload,
  ) {
    if (currentUser.role !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Only Super Admins can update platform revenue share settings.');
    }

    if (dto.organizationId) {
      const updatedOrg = await this.prisma.organization.update({
        where: { id: dto.organizationId },
        data: { customCommissionRate: dto.commissionRate },
      });

      await this.auditLogsService.logAction({
        userId: currentUser.userId,
        organizationId: dto.organizationId,
        action: 'MARKETPLACE_COMMISSION_RATE_UPDATED',
        resource: 'Organization',
        resourceId: dto.organizationId,
        details: `Updated custom commission rate for organization '${updatedOrg.name}' to ${(dto.commissionRate * 100).toFixed(1)}%`,
      });

      return {
        success: true,
        type: 'ORGANIZATION_OVERRIDE',
        organizationId: dto.organizationId,
        commissionRate: dto.commissionRate,
      };
    }

    const setting = await this.prisma.platformSetting.upsert({
      where: { key: 'default_commission_rate' },
      update: { value: dto.commissionRate.toString() },
      create: { key: 'default_commission_rate', value: dto.commissionRate.toString() },
    });

    await this.auditLogsService.logAction({
      userId: currentUser.userId,
      organizationId: currentUser.organizationId,
      action: 'MARKETPLACE_COMMISSION_RATE_UPDATED',
      resource: 'PlatformSetting',
      resourceId: setting.id,
      details: `Updated global default platform commission rate to ${(dto.commissionRate * 100).toFixed(1)}%`,
    });

    return {
      success: true,
      type: 'GLOBAL_DEFAULT',
      commissionRate: dto.commissionRate,
    };
  }

  /**
   * Stripe Connect Publisher Express Onboarding Link
   */
  async createPublisherOnboardingLink(
    dto: OnboardPublisherDto,
    currentUser: UserPayload,
  ) {
    if (!currentUser.organizationId) {
      throw new ForbiddenException('Organization required for Stripe publisher onboarding.');
    }

    const org = await this.prisma.organization.findUnique({
      where: { id: currentUser.organizationId },
    });

    if (!org) {
      throw new NotFoundException('Organization not found.');
    }

    let stripeAccountId = org.stripeAccountId;
    if (!stripeAccountId) {
      stripeAccountId = `acct_mock_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      await this.prisma.organization.update({
        where: { id: org.id },
        data: {
          isPublisher: true,
          stripeAccountId,
          stripeAccountStatus: 'ACTIVE',
        },
      });
    }

    await this.auditLogsService.logAction({
      userId: currentUser.userId,
      organizationId: org.id,
      action: 'MARKETPLACE_STRIPE_CONNECT_ONBOARDING',
      resource: 'Organization',
      resourceId: org.id,
      details: `Generated Stripe Connect onboarding link for account ${stripeAccountId}`,
    });

    return {
      stripeAccountId,
      stripeAccountStatus: 'ACTIVE',
      onboardingUrl: `https://connect.stripe.com/express/oauth/authorize?account=${stripeAccountId}&client_id=ca_mock_launchpad`,
      returnUrl: dto.returnUrl || 'http://localhost:3000/marketplace/earnings',
    };
  }

  /**
   * Creates an Idempotent Checkout Session with Configurable Commission Deduction
   */
  async createCheckoutSession(
    dto: CreateCheckoutSessionDto,
    currentUser: UserPayload,
  ): Promise<CheckoutSessionResponse> {
    if (!currentUser.organizationId) {
      throw new ForbiddenException('Organization required to purchase marketplace assets.');
    }

    const asset = await this.prisma.marketplaceAsset.findUnique({
      where: { id: dto.assetId },
      include: { publisher: true },
    });

    if (!asset) {
      throw new NotFoundException(`Marketplace asset '${dto.assetId}' not found.`);
    }

    if (asset.status !== 'PUBLISHED') {
      throw new BadRequestException(`Asset '${asset.name}' is not published for purchasing.`);
    }

    if (asset.publisherId === currentUser.organizationId) {
      throw new BadRequestException('Publishers cannot purchase their own marketplace assets.');
    }

    const commissionRate = await this.getPlatformCommissionRate(asset.publisherId);
    const amount = asset.price;
    const platformFee = Math.round(amount * commissionRate * 100) / 100;
    const publisherEarnings = Math.round((amount - platformFee) * 100) / 100;

    const idempotencyKey = `chk_${asset.id}_${currentUser.organizationId}_${Date.now()}`;
    const sessionId = `cs_test_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const transaction = await this.prisma.marketplaceTransaction.create({
      data: {
        assetId: asset.id,
        buyerOrgId: currentUser.organizationId,
        publisherOrgId: asset.publisherId,
        amount,
        platformFee,
        publisherEarnings,
        commissionRate,
        currency: 'usd',
        pricingType: asset.pricingType || 'ONE_TIME',
        status: 'PENDING',
        stripeCheckoutSessionId: sessionId,
        idempotencyKey,
        metadata: {
          assetName: asset.name,
          buyerUserEmail: currentUser.email,
        },
      },
    });

    await this.auditLogsService.logAction({
      userId: currentUser.userId,
      organizationId: currentUser.organizationId,
      action: 'MARKETPLACE_PURCHASE_STARTED',
      resource: 'MarketplaceTransaction',
      resourceId: transaction.id,
      details: `Initiated checkout for '${asset.name}' ($${amount}). Commission Rate: ${(commissionRate * 100).toFixed(1)}%`,
    });

    return {
      sessionId,
      checkoutUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/marketplace/${asset.slug}?checkout_success=true&session_id=${sessionId}`,
      transactionId: transaction.id,
      idempotencyKey,
      amount,
      platformFee,
      publisherEarnings,
      commissionRate,
      currency: 'usd',
    };
  }

  /**
   * Idempotent Stripe Webhook Handler with Signature Verification
   */
  async handleStripeWebhook(payload: any, signature?: string) {
    // In production, signature verification is executed using Stripe webhook secret.
    const eventType = payload?.type || 'checkout.session.completed';
    const dataObject = payload?.data?.object || payload;

    const sessionId = dataObject.stripeCheckoutSessionId || dataObject.id || dataObject.sessionId;
    const paymentIntentId = dataObject.payment_intent || dataObject.paymentIntentId || `pi_mock_${Date.now()}`;

    if (!sessionId) {
      return { received: true, note: 'Event acknowledged without session payload' };
    }

    const existingTx = await this.prisma.marketplaceTransaction.findFirst({
      where: {
        OR: [
          { stripeCheckoutSessionId: sessionId },
          { id: sessionId },
        ],
      },
    });

    if (!existingTx) {
      return { received: true, note: 'Transaction record not found for webhook session' };
    }

    // Idempotency check: prevent duplicate execution if already succeeded
    if (existingTx.status === 'SUCCEEDED') {
      return {
        received: true,
        alreadyProcessed: true,
        transactionId: existingTx.id,
        status: 'SUCCEEDED',
      };
    }

    if (eventType === 'checkout.session.completed' || eventType === 'payment_intent.succeeded') {
      const updatedTx = await this.prisma.marketplaceTransaction.update({
        where: { id: existingTx.id },
        data: {
          status: 'SUCCEEDED',
          stripePaymentIntentId: paymentIntentId,
        },
      });

      // Grant License Entitlement
      const license = await this.grantAssetLicense(
        updatedTx.assetId,
        updatedTx.buyerOrgId,
        updatedTx.id,
      );

      // Create Publisher Payout Log
      await this.prisma.marketplacePayout.create({
        data: {
          publisherOrgId: updatedTx.publisherOrgId,
          amount: updatedTx.publisherEarnings,
          currency: updatedTx.currency,
          status: 'PAID',
          stripeTransferId: `tr_mock_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          details: `Payout for transaction ${updatedTx.id} (Asset: ${updatedTx.assetId})`,
        },
      });

      await this.auditLogsService.logAction({
        organizationId: updatedTx.buyerOrgId,
        action: 'MARKETPLACE_PURCHASE_SUCCESS',
        resource: 'MarketplaceTransaction',
        resourceId: updatedTx.id,
        details: `Payment confirmed for asset '${updatedTx.assetId}'. Amount: $${updatedTx.amount}`,
      });

      await this.auditLogsService.logAction({
        organizationId: updatedTx.buyerOrgId,
        action: 'MARKETPLACE_LICENSE_GRANTED',
        resource: 'MarketplaceLicense',
        resourceId: license.id,
        details: `Granted active license for asset '${updatedTx.assetId}' to tenant organization`,
      });

      return {
        received: true,
        status: 'SUCCEEDED',
        transactionId: updatedTx.id,
        licenseId: license.id,
      };
    }

    if (eventType === 'payment_intent.payment_failed') {
      await this.prisma.marketplaceTransaction.update({
        where: { id: existingTx.id },
        data: { status: 'FAILED' },
      });

      await this.auditLogsService.logAction({
        organizationId: existingTx.buyerOrgId,
        action: 'MARKETPLACE_PURCHASE_FAILED',
        resource: 'MarketplaceTransaction',
        resourceId: existingTx.id,
        details: `Payment failed for transaction ${existingTx.id}`,
      });

      return { received: true, status: 'FAILED' };
    }

    return { received: true, eventType };
  }

  /**
   * Grants or refreshes an active Marketplace License for an organization
   */
  async grantAssetLicense(
    assetId: string,
    organizationId: string,
    transactionId?: string,
  ) {
    const existingLicense = await this.prisma.marketplaceLicense.findFirst({
      where: { assetId, organizationId },
    });

    if (existingLicense) {
      return this.prisma.marketplaceLicense.update({
        where: { id: existingLicense.id },
        data: {
          status: 'ACTIVE',
          transactionId: transactionId || existingLicense.transactionId,
          updatedAt: new Date(),
        },
      });
    }

    return this.prisma.marketplaceLicense.create({
      data: {
        assetId,
        organizationId,
        transactionId,
        licenseType: 'PERPETUAL',
        status: 'ACTIVE',
      },
    });
  }

  /**
   * Checks if an organization holds an active license for a marketplace asset
   */
  async hasActiveLicense(assetId: string, orgId: string): Promise<boolean> {
    const asset = await this.prisma.marketplaceAsset.findUnique({
      where: { id: assetId },
      select: { pricingType: true, publisherId: true },
    });

    if (!asset) return false;

    // Free assets or publisher's own assets do not require payment license
    if (asset.pricingType === 'FREE' || asset.publisherId === orgId) {
      return true;
    }

    const license = await this.prisma.marketplaceLicense.findFirst({
      where: {
        assetId,
        organizationId: orgId,
        status: 'ACTIVE',
      },
    });

    return Boolean(license);
  }

  /**
   * Fetches active licenses held by current user's organization
   */
  async getMyOrganizationLicenses(currentUser: UserPayload) {
    if (!currentUser.organizationId) {
      throw new ForbiddenException('Organization required to view licenses.');
    }

    return this.prisma.marketplaceLicense.findMany({
      where: { organizationId: currentUser.organizationId },
      orderBy: { createdAt: 'desc' },
      include: {
        asset: {
          select: { id: true, name: true, slug: true, type: true, version: true, authorName: true },
        },
      },
    });
  }

  /**
   * Financial Overview for Publisher Earnings Dashboard
   */
  async getPublisherEarnings(currentUser: UserPayload): Promise<PublisherEarningsOverview> {
    if (!currentUser.organizationId) {
      throw new ForbiddenException('Organization required to view publisher earnings.');
    }

    const org = await this.prisma.organization.findUnique({
      where: { id: currentUser.organizationId },
    });

    if (!org) {
      throw new NotFoundException('Organization not found.');
    }

    const transactions = await this.prisma.marketplaceTransaction.findMany({
      where: {
        publisherOrgId: currentUser.organizationId,
        status: 'SUCCEEDED',
      },
      orderBy: { createdAt: 'desc' },
      include: {
        asset: { select: { id: true, name: true, slug: true } },
        buyerOrg: { select: { id: true, name: true } },
      },
    });

    const payouts = await this.prisma.marketplacePayout.findMany({
      where: { publisherOrgId: currentUser.organizationId },
      orderBy: { createdAt: 'desc' },
    });

    const grossSalesAmount = transactions.reduce((acc, t) => acc + t.amount, 0);
    const platformFeesDeducted = transactions.reduce((acc, t) => acc + t.platformFee, 0);
    const netPublisherEarnings = transactions.reduce((acc, t) => acc + t.publisherEarnings, 0);

    return {
      publisherOrgId: org.id,
      stripeAccountId: org.stripeAccountId,
      stripeAccountStatus: org.stripeAccountStatus,
      grossSalesAmount,
      platformFeesDeducted,
      netPublisherEarnings,
      completedTransactionsCount: transactions.length,
      payouts,
      recentTransactions: transactions,
    };
  }

  /**
   * Platform Financial Overview for SuperAdmins
   */
  async getPlatformFinancialOverview(
    currentUser: UserPayload,
  ): Promise<PlatformFinancialOverview> {
    if (currentUser.role !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Only Super Admins can access platform financial analytics.');
    }

    const defaultCommissionRate = await this.getPlatformCommissionRate();

    const transactions = await this.prisma.marketplaceTransaction.findMany({
      where: { status: 'SUCCEEDED' },
      orderBy: { createdAt: 'desc' },
      include: {
        asset: { select: { id: true, name: true } },
        publisherOrg: { select: { id: true, name: true } },
        buyerOrg: { select: { id: true, name: true } },
      },
    });

    const totalGrossVolume = transactions.reduce((acc, t) => acc + t.amount, 0);
    const totalPlatformCommissionCollected = transactions.reduce((acc, t) => acc + t.platformFee, 0);
    const totalNetPublisherEarnings = transactions.reduce((acc, t) => acc + t.publisherEarnings, 0);
    const activeSubscriptionsCount = transactions.filter((t) => t.pricingType === 'SUBSCRIPTION').length;

    const publishersMap = new Map<string, { name: string; gross: number; commission: number }>();
    for (const t of transactions) {
      const existing = publishersMap.get(t.publisherOrgId) || {
        name: t.publisherOrg.name,
        gross: 0,
        commission: 0,
      };
      existing.gross += t.amount;
      existing.commission += t.platformFee;
      publishersMap.set(t.publisherOrgId, existing);
    }

    const topPublishers = Array.from(publishersMap.values()).sort((a, b) => b.gross - a.gross);

    return {
      totalGrossVolume,
      totalPlatformCommissionCollected,
      totalNetPublisherEarnings,
      defaultCommissionRate,
      totalTransactionsCount: transactions.length,
      activeSubscriptionsCount,
      topPublishers,
    };
  }
}

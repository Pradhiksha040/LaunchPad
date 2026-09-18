import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MarketplaceService } from './marketplace.service';
import {
  RegisterPublisherDto,
  CreateMarketplaceAssetDto,
  UpdateMarketplaceAssetDto,
  RejectAssetDto,
  InstallAssetDto,
} from './dto/create-asset.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

import { MarketplaceBillingService } from './marketplace-billing.service';
import {
  CreateCheckoutSessionDto,
  UpdateCommissionRateDto,
  OnboardPublisherDto,
} from './dto/billing.dto';

@ApiTags('Marketplace & Partner Ecosystem')
@Controller('marketplace')
export class MarketplaceController {
  constructor(
    private readonly marketplaceService: MarketplaceService,
    private readonly billingService: MarketplaceBillingService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Public search and filter published marketplace assets' })
  async findAllPublic(
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('type') type?: string,
    @Query('pricingType') pricingType?: string,
  ) {
    return this.marketplaceService.findAllPublic({ search, category, type, pricingType });
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Public marketplace asset details by slug' })
  async findBySlug(@Param('slug') slug: string) {
    return this.marketplaceService.findBySlug(slug);
  }

  @Post('publisher')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Register organization as a Marketplace Publisher' })
  async registerPublisher(@Body() dto: RegisterPublisherDto, @Req() req: any) {
    return this.marketplaceService.registerPublisher(dto, req.user);
  }

  @Post('publisher/stripe-onboard')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generate Stripe Connect onboarding link for publisher organization' })
  async onboardPublisher(@Body() dto: OnboardPublisherDto, @Req() req: any) {
    return this.billingService.createPublisherOnboardingLink(dto, req.user);
  }

  @Post('assets')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create draft marketplace asset' })
  async createAsset(@Body() dto: CreateMarketplaceAssetDto, @Req() req: any) {
    return this.marketplaceService.createAsset(dto, req.user);
  }

  @Patch('assets/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update draft marketplace asset' })
  async updateAsset(
    @Param('id') id: string,
    @Body() dto: UpdateMarketplaceAssetDto,
    @Req() req: any,
  ) {
    return this.marketplaceService.updateAsset(id, dto, req.user);
  }

  @Post('assets/:id/submit')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Submit asset for admin review' })
  async submitForReview(@Param('id') id: string, @Req() req: any) {
    return this.marketplaceService.submitForReview(id, req.user);
  }

  @Post('assets/:id/approve')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'SuperAdmin approve submitted asset' })
  async approveAsset(@Param('id') id: string, @Req() req: any) {
    return this.marketplaceService.approveAsset(id, req.user);
  }

  @Post('assets/:id/reject')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'SuperAdmin reject submitted asset with reason' })
  async rejectAsset(
    @Param('id') id: string,
    @Body() dto: RejectAssetDto,
    @Req() req: any,
  ) {
    return this.marketplaceService.rejectAsset(id, dto, req.user);
  }

  @Post('assets/:id/publish')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Publish approved asset live to marketplace' })
  async publishAsset(@Param('id') id: string, @Req() req: any) {
    return this.marketplaceService.publishAsset(id, req.user);
  }

  @Post('assets/:id/unpublish')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Unpublish asset from marketplace' })
  async unpublishAsset(@Param('id') id: string, @Req() req: any) {
    return this.marketplaceService.unpublishAsset(id, req.user);
  }

  @Post('assets/checkout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create Stripe Checkout Session for marketplace asset purchase' })
  async createCheckoutSession(@Body() dto: CreateCheckoutSessionDto, @Req() req: any) {
    return this.billingService.createCheckoutSession(dto, req.user);
  }

  @Post('webhooks/stripe')
  @ApiOperation({ summary: 'Stripe Webhook Handler for payment confirmation & entitlement' })
  async handleStripeWebhook(@Body() body: any, @Req() req: any) {
    const signature = req.headers['stripe-signature'];
    return this.billingService.handleStripeWebhook(body, signature);
  }

  @Get('licenses/my-licenses')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get active marketplace licenses held by current tenant organization' })
  async getMyLicenses(@Req() req: any) {
    return this.billingService.getMyOrganizationLicenses(req.user);
  }

  @Get('licenses/check/:assetId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Check if current organization holds active license for asset' })
  async checkLicense(@Param('assetId') assetId: string, @Req() req: any) {
    const hasLicense = await this.billingService.hasActiveLicense(assetId, req.user.organizationId);
    return { assetId, hasLicense };
  }

  @Get('finance/publisher-earnings')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get publisher financial earnings and transaction settlement history' })
  async getPublisherEarnings(@Req() req: any) {
    return this.billingService.getPublisherEarnings(req.user);
  }

  @Get('finance/platform-overview')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'SuperAdmin platform financial revenue and commission overview' })
  async getPlatformFinancialOverview(@Req() req: any) {
    return this.billingService.getPlatformFinancialOverview(req.user);
  }

  @Patch('finance/commission-rate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'SuperAdmin update global or organization-specific platform commission rate' })
  async updateCommissionRate(@Body() dto: UpdateCommissionRateDto, @Req() req: any) {
    return this.billingService.updatePlatformCommissionRate(dto, req.user);
  }

  @Post('assets/:id/install')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Install marketplace asset into current organization' })
  async installAsset(
    @Param('id') id: string,
    @Body() dto: InstallAssetDto,
    @Req() req: any,
  ) {
    return this.marketplaceService.installAsset(id, dto, req.user);
  }

  @Post('assets/:id/scan')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Trigger static security scan on asset' })
  async runSecurityScan(@Param('id') id: string, @Req() req: any) {
    return this.marketplaceService.runAssetSecurityScan(id, req.user);
  }

  @Get('assets/:id/findings')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get security findings for asset' })
  async getFindings(@Param('id') id: string) {
    return this.marketplaceService.getAssetFindings(id);
  }

  @Post('publisher/:orgId/verify')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'SuperAdmin verify publisher trust status' })
  async verifyPublisher(
    @Param('orgId') orgId: string,
    @Body('publisherStatus') publisherStatus: string,
    @Req() req: any,
  ) {
    return this.marketplaceService.verifyPublisher(orgId, publisherStatus, req.user);
  }

  @Get('review/pending')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'SuperAdmin Marketplace Review Queue' })
  async getPendingReviews(@Req() req: any) {
    return this.marketplaceService.getPendingReviews(req.user);
  }
}

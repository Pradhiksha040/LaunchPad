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

@ApiTags('Marketplace & Partner Ecosystem')
@Controller('marketplace')
export class MarketplaceController {
  constructor(private readonly marketplaceService: MarketplaceService) {}

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

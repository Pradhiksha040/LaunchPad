import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

export interface SecurityScanResult {
  assetId: string;
  scanStatus: 'SCAN_PASSED' | 'WARNINGS_FOUND' | 'SCAN_FAILED';
  scannedAt: Date;
  findingsCount: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  infoCount: number;
  findings: Array<{
    id: string;
    severity: string;
    findingType: string;
    description: string;
    location?: string;
  }>;
}

@Injectable()
export class MarketplaceSecurityService {
  constructor(
    private prisma: PrismaService,
    private auditLogsService: AuditLogsService,
  ) {}

  /**
   * Automated Static Security & Heuristic Pattern Validator Pipeline
   */
  async runSecurityScan(assetId: string): Promise<SecurityScanResult> {
    const asset = await this.prisma.marketplaceAsset.findUnique({
      where: { id: assetId },
    });

    if (!asset) {
      throw new NotFoundException(`Marketplace asset '${assetId}' not found for security scan.`);
    }

    await this.auditLogsService.logAction({
      organizationId: asset.publisherId,
      action: 'MARKETPLACE_SECURITY_SCAN_STARTED',
      resource: 'MarketplaceAsset',
      resourceId: asset.id,
      details: `Started static security scan on asset ${asset.name} (v${asset.version})`,
    });

    // Delete existing findings for fresh scan
    await this.prisma.marketplaceSecurityFinding.deleteMany({
      where: { assetId },
    });

    const findings: Array<{
      severity: 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
      findingType: string;
      description: string;
      location?: string;
    }> = [];

    // Serialize asset content payload for deep string pattern analysis
    const rawContent = JSON.stringify({
      name: asset.name,
      description: asset.description,
      requiredModules: asset.requiredModules,
      configuration: asset.configuration,
      changelog: asset.changelog,
      tags: asset.tags,
    });

    // 1. Hardcoded Secrets & Credential Leak Scanner
    const awsKeyPattern = /AKIA[0-9A-Z]{16}/g;
    const jwtPattern = /eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g;
    const privateKeyPattern = /-----BEGIN (RSA|EC|PGP|PRIVATE) KEY-----/g;
    const hardcodedPasswordPattern = /(password|api_key|secret_key|token)\s*[:=]\s*["'][A-Za-z0-9_@#!$%^&*]{8,}["']/gi;
    const dbConnectionStringPattern = /(postgres|mysql|mongodb):\/\/[^:]+:[^@]+@/gi;

    if (awsKeyPattern.test(rawContent)) {
      findings.push({
        severity: 'CRITICAL',
        findingType: 'HARDCODED_SECRET',
        description: 'Hardcoded AWS Access Key ID detected inside asset payload.',
        location: 'Asset Configuration',
      });
    }

    if (jwtPattern.test(rawContent)) {
      findings.push({
        severity: 'HIGH',
        findingType: 'HARDCODED_SECRET',
        description: 'Hardcoded JWT Bearer Token detected in asset metadata.',
        location: 'Configuration Payload',
      });
    }

    if (privateKeyPattern.test(rawContent)) {
      findings.push({
        severity: 'CRITICAL',
        findingType: 'HARDCODED_SECRET',
        description: 'Embedded RSA/Private Key certificate detected in asset payload.',
        location: 'Configuration Keys',
      });
    }

    if (hardcodedPasswordPattern.test(rawContent)) {
      findings.push({
        severity: 'HIGH',
        findingType: 'UNPROTECTED_CREDENTIAL',
        description: 'Raw plain-text secret or password assignment detected inside configuration.',
        location: 'Configuration Parameters',
      });
    }

    if (dbConnectionStringPattern.test(rawContent)) {
      findings.push({
        severity: 'CRITICAL',
        findingType: 'HARDCODED_SECRET',
        description: 'Raw database connection URI containing embedded credentials detected.',
        location: 'Database Connector Config',
      });
    }

    // 2. Suspicious Code & Shell Execution Pattern Scanner
    const evalPattern = /eval\s*\(/g;
    const childProcessPattern = /(child_process|exec\s*\(|spawn\s*\(|system\s*\()/g;
    const functionConstructorPattern = /new\s+Function\s*\(/g;
    const rawSqlInjectionPattern = /SELECT\s+\*\s+FROM\s+\w+\s+WHERE\s+password\s*=/gi;

    if (evalPattern.test(rawContent)) {
      findings.push({
        severity: 'CRITICAL',
        findingType: 'SUSPICIOUS_EXECUTION',
        description: 'Dangerous dynamic JavaScript execution statement eval() detected.',
        location: 'Custom Logic Handler',
      });
    }

    if (childProcessPattern.test(rawContent)) {
      findings.push({
        severity: 'CRITICAL',
        findingType: 'SUSPICIOUS_EXECUTION',
        description: 'Raw operating system shell process execution command (child_process/exec) detected.',
        location: 'System Process Invocation',
      });
    }

    if (functionConstructorPattern.test(rawContent)) {
      findings.push({
        severity: 'HIGH',
        findingType: 'SUSPICIOUS_EXECUTION',
        description: 'Dynamic Function() constructor creation detected.',
        location: 'Script Logic',
      });
    }

    if (rawSqlInjectionPattern.test(rawContent)) {
      findings.push({
        severity: 'CRITICAL',
        findingType: 'SUSPICIOUS_EXECUTION',
        description: 'Unsanitized raw SQL query pattern susceptible to SQL injection detected.',
        location: 'Database Query Layer',
      });
    }

    // 3. Workflow & Integration Security Scanner
    const unencryptedHttpPattern = /http:\/\/(?!localhost|127\.0\.0\.1)[a-zA-Z0-9.-]+/gi;
    const rawBasicAuthHeaderPattern = /Authorization\s*:\s*Basic\s+[A-Za-z0-9+/=]+/gi;

    if (unencryptedHttpPattern.test(rawContent)) {
      findings.push({
        severity: 'MEDIUM',
        findingType: 'UNTRUSTED_URL',
        description: 'Unencrypted plaintext HTTP webhook target URL detected (HTTPS required for production).',
        location: 'Integration Webhook Config',
      });
    }

    if (rawBasicAuthHeaderPattern.test(rawContent)) {
      findings.push({
        severity: 'HIGH',
        findingType: 'UNPROTECTED_CREDENTIAL',
        description: 'Hardcoded HTTP Basic Authorization header string detected.',
        location: 'Integration Header Config',
      });
    }

    // 4. Default Informational Audit Finding
    if (findings.length === 0) {
      findings.push({
        severity: 'INFO',
        findingType: 'STATIC_VALIDATION_CLEAN',
        description: 'Automated static security analysis passed with zero critical or high risk findings.',
        location: 'Automated SAST Pipeline',
      });
    }

    // Insert findings into database
    for (const f of findings) {
      await this.prisma.marketplaceSecurityFinding.create({
        data: {
          assetId,
          severity: f.severity,
          findingType: f.findingType,
          description: f.description,
          location: f.location || 'General',
        },
      });
    }

    // Determine overall scan status
    const hasCriticalOrHigh = findings.some((f) => f.severity === 'CRITICAL' || f.severity === 'HIGH');
    const hasMediumOrLow = findings.some((f) => f.severity === 'MEDIUM' || f.severity === 'LOW');

    const scanStatus = hasCriticalOrHigh
      ? 'SCAN_FAILED'
      : hasMediumOrLow
      ? 'WARNINGS_FOUND'
      : 'SCAN_PASSED';

    const scannedAt = new Date();

    // Update asset scan status
    await this.prisma.marketplaceAsset.update({
      where: { id: assetId },
      data: {
        scanStatus,
        scannedAt,
      },
    });

    // Log security scan completion event
    const criticalCount = findings.filter((f) => f.severity === 'CRITICAL').length;
    const highCount = findings.filter((f) => f.severity === 'HIGH').length;
    const mediumCount = findings.filter((f) => f.severity === 'MEDIUM').length;
    const lowCount = findings.filter((f) => f.severity === 'LOW').length;
    const infoCount = findings.filter((f) => f.severity === 'INFO').length;

    await this.auditLogsService.logAction({
      organizationId: asset.publisherId,
      action:
        scanStatus === 'SCAN_FAILED'
          ? 'MARKETPLACE_SECURITY_FAILURE'
          : scanStatus === 'WARNINGS_FOUND'
          ? 'MARKETPLACE_SECURITY_WARNING'
          : 'MARKETPLACE_SECURITY_SCAN_COMPLETED',
      resource: 'MarketplaceAsset',
      resourceId: asset.id,
      details: `Security scan finished for ${asset.name}: Status=${scanStatus}, Critical=${criticalCount}, High=${highCount}, Medium=${mediumCount}`,
    });

    const savedFindings = await this.prisma.marketplaceSecurityFinding.findMany({
      where: { assetId },
    });

    return {
      assetId,
      scanStatus,
      scannedAt,
      findingsCount: savedFindings.length,
      criticalCount,
      highCount,
      mediumCount,
      lowCount,
      infoCount,
      findings: savedFindings,
    };
  }

  async getAssetFindings(assetId: string) {
    return this.prisma.marketplaceSecurityFinding.findMany({
      where: { assetId },
      orderBy: [{ createdAt: 'desc' }],
    });
  }
}

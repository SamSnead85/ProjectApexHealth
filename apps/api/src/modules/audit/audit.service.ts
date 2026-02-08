import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { AuditLogEntity } from './entities/audit-log.entity';
import { CreateAuditLogDto, SearchAuditDto } from './dto/audit.dto';

export interface AuditDashboardStats {
  totalEvents: number;
  phiAccessCount: number;
  failedLogins: number;
  topUsers: { userId: string; userEmail: string; count: number }[];
  hourlyDistribution: { hour: number; count: number }[];
}

export interface AuditAnomaly {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  userId?: string;
  userEmail?: string;
  detectedAt: Date;
  details: Record<string, any>;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    @InjectRepository(AuditLogEntity)
    private readonly auditRepository: Repository<AuditLogEntity>,
  ) {}

  /**
   * Create a new audit log entry.
   */
  async log(entry: CreateAuditLogDto): Promise<AuditLogEntity> {
    try {
      const auditLog = this.auditRepository.create({
        ...entry,
        timestamp: new Date(),
      });
      const saved = await this.auditRepository.save(auditLog);
      this.logger.debug(
        `Audit log created: ${entry.action} on ${entry.resourceType} by ${entry.userEmail}`,
      );
      return saved;
    } catch (error) {
      this.logger.error(`Failed to create audit log: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Search audit logs with pagination and filtering.
   */
  async search(params: SearchAuditDto): Promise<{
    data: AuditLogEntity[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const page = params.page ?? 1;
    const limit = params.limit ?? 50;

    const qb = this.auditRepository.createQueryBuilder('audit');

    if (params.userId) {
      qb.andWhere('audit.user_id = :userId', { userId: params.userId });
    }

    if (params.action) {
      qb.andWhere('audit.action = :action', { action: params.action });
    }

    if (params.resourceType) {
      qb.andWhere('audit.resource_type = :resourceType', {
        resourceType: params.resourceType,
      });
    }

    if (params.phiAccessed !== undefined) {
      qb.andWhere('audit.phi_accessed = :phiAccessed', {
        phiAccessed: params.phiAccessed,
      });
    }

    if (params.organizationId) {
      qb.andWhere('audit.organization_id = :organizationId', {
        organizationId: params.organizationId,
      });
    }

    if (params.dateFrom) {
      qb.andWhere('audit.timestamp >= :dateFrom', { dateFrom: params.dateFrom });
    }

    if (params.dateTo) {
      qb.andWhere('audit.timestamp <= :dateTo', { dateTo: params.dateTo });
    }

    qb.orderBy('audit.timestamp', 'DESC');
    qb.skip((page - 1) * limit);
    qb.take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get dashboard statistics for audit logs.
   */
  async getDashboardStats(
    organizationId: string,
    dateFrom: string,
    dateTo: string,
  ): Promise<AuditDashboardStats> {
    const baseWhere = {
      organizationId,
      timestamp: Between(new Date(dateFrom), new Date(dateTo)),
    };

    // Total events
    const totalEvents = await this.auditRepository.count({ where: baseWhere });

    // PHI access count
    const phiAccessCount = await this.auditRepository.count({
      where: { ...baseWhere, phiAccessed: true },
    });

    // Failed logins
    const failedLogins = await this.auditRepository.count({
      where: { ...baseWhere, action: 'FAILED_LOGIN' },
    });

    // Top users by activity
    const topUsers = await this.auditRepository
      .createQueryBuilder('audit')
      .select('audit.user_id', 'userId')
      .addSelect('audit.user_email', 'userEmail')
      .addSelect('COUNT(*)', 'count')
      .where('audit.organization_id = :organizationId', { organizationId })
      .andWhere('audit.timestamp BETWEEN :dateFrom AND :dateTo', {
        dateFrom,
        dateTo,
      })
      .groupBy('audit.user_id')
      .addGroupBy('audit.user_email')
      .orderBy('count', 'DESC')
      .limit(10)
      .getRawMany();

    // Hourly distribution
    const hourlyDistribution = await this.auditRepository
      .createQueryBuilder('audit')
      .select('EXTRACT(HOUR FROM audit.timestamp)::int', 'hour')
      .addSelect('COUNT(*)', 'count')
      .where('audit.organization_id = :organizationId', { organizationId })
      .andWhere('audit.timestamp BETWEEN :dateFrom AND :dateTo', {
        dateFrom,
        dateTo,
      })
      .groupBy('hour')
      .orderBy('hour', 'ASC')
      .getRawMany();

    return {
      totalEvents,
      phiAccessCount,
      failedLogins,
      topUsers: topUsers.map((u) => ({
        userId: u.userId,
        userEmail: u.userEmail,
        count: parseInt(u.count, 10),
      })),
      hourlyDistribution: hourlyDistribution.map((h) => ({
        hour: h.hour,
        count: parseInt(h.count, 10),
      })),
    };
  }

  /**
   * Basic anomaly detection for HIPAA compliance.
   * Detects: excessive PHI access, after-hours access, bulk exports.
   */
  async detectAnomalies(organizationId: string): Promise<AuditAnomaly[]> {
    const anomalies: AuditAnomaly[] = [];
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    // 1. Excessive PHI access (>50 PHI records accessed in 1 hour)
    const excessivePhiAccess = await this.auditRepository
      .createQueryBuilder('audit')
      .select('audit.user_id', 'userId')
      .addSelect('audit.user_email', 'userEmail')
      .addSelect('COUNT(*)', 'count')
      .where('audit.organization_id = :organizationId', { organizationId })
      .andWhere('audit.phi_accessed = true')
      .andWhere('audit.timestamp >= :oneHourAgo', { oneHourAgo })
      .groupBy('audit.user_id')
      .addGroupBy('audit.user_email')
      .having('COUNT(*) > :threshold', { threshold: 50 })
      .getRawMany();

    for (const record of excessivePhiAccess) {
      anomalies.push({
        type: 'EXCESSIVE_PHI_ACCESS',
        severity: 'high',
        description: `User ${record.userEmail} accessed ${record.count} PHI records in the last hour`,
        userId: record.userId,
        userEmail: record.userEmail,
        detectedAt: now,
        details: { accessCount: parseInt(record.count, 10), window: '1 hour' },
      });
    }

    // 2. After-hours access (access between 10 PM and 6 AM local time)
    const afterHoursAccess = await this.auditRepository
      .createQueryBuilder('audit')
      .select('audit.user_id', 'userId')
      .addSelect('audit.user_email', 'userEmail')
      .addSelect('COUNT(*)', 'count')
      .where('audit.organization_id = :organizationId', { organizationId })
      .andWhere('audit.phi_accessed = true')
      .andWhere('audit.timestamp >= :oneDayAgo', { oneDayAgo })
      .andWhere(
        '(EXTRACT(HOUR FROM audit.timestamp) >= 22 OR EXTRACT(HOUR FROM audit.timestamp) < 6)',
      )
      .groupBy('audit.user_id')
      .addGroupBy('audit.user_email')
      .having('COUNT(*) > :threshold', { threshold: 5 })
      .getRawMany();

    for (const record of afterHoursAccess) {
      anomalies.push({
        type: 'AFTER_HOURS_PHI_ACCESS',
        severity: 'medium',
        description: `User ${record.userEmail} accessed ${record.count} PHI records after hours in the last 24h`,
        userId: record.userId,
        userEmail: record.userEmail,
        detectedAt: now,
        details: { accessCount: parseInt(record.count, 10), window: '24 hours', hours: '10PM-6AM' },
      });
    }

    // 3. Bulk exports (>10 export actions in 1 hour)
    const bulkExports = await this.auditRepository
      .createQueryBuilder('audit')
      .select('audit.user_id', 'userId')
      .addSelect('audit.user_email', 'userEmail')
      .addSelect('COUNT(*)', 'count')
      .where('audit.organization_id = :organizationId', { organizationId })
      .andWhere('audit.action = :action', { action: 'EXPORT' })
      .andWhere('audit.timestamp >= :oneHourAgo', { oneHourAgo })
      .groupBy('audit.user_id')
      .addGroupBy('audit.user_email')
      .having('COUNT(*) > :threshold', { threshold: 10 })
      .getRawMany();

    for (const record of bulkExports) {
      anomalies.push({
        type: 'BULK_EXPORT',
        severity: 'critical',
        description: `User ${record.userEmail} performed ${record.count} export operations in the last hour`,
        userId: record.userId,
        userEmail: record.userEmail,
        detectedAt: now,
        details: { exportCount: parseInt(record.count, 10), window: '1 hour' },
      });
    }

    if (anomalies.length > 0) {
      this.logger.warn(
        `Detected ${anomalies.length} anomalies for organization ${organizationId}`,
      );
    }

    return anomalies;
  }

  /**
   * Find a single audit log entry by ID.
   */
  async findById(id: string): Promise<AuditLogEntity | null> {
    return this.auditRepository.findOne({ where: { id } });
  }
}

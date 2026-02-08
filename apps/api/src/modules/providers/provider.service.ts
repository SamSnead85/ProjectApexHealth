import { Injectable, Logger, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProviderEntity } from './entities/provider.entity';
import { CreateProviderDto, UpdateProviderDto, SearchProviderDto, UpdateCredentialingDto } from './dto/provider.dto';

@Injectable()
export class ProviderService {
  private readonly logger = new Logger(ProviderService.name);

  constructor(
    @InjectRepository(ProviderEntity)
    private readonly providerRepository: Repository<ProviderEntity>,
  ) {}

  async create(dto: CreateProviderDto, organizationId: string): Promise<ProviderEntity> {
    // Check for duplicate NPI within organization
    const existing = await this.providerRepository.findOne({
      where: { npi: dto.npi, organizationId },
    });

    if (existing) {
      throw new ConflictException(`Provider with NPI ${dto.npi} already exists in this organization`);
    }

    const provider = this.providerRepository.create({
      ...dto,
      organizationId,
      status: 'pending',
      credentialingStatus: 'application_received',
    });

    const saved = await this.providerRepository.save(provider);
    this.logger.log(`Provider created: ${saved.displayName} (NPI: ${saved.npi}) in org ${organizationId}`);
    return saved;
  }

  async findById(id: string, organizationId: string): Promise<ProviderEntity> {
    const provider = await this.providerRepository.findOne({
      where: { id, organizationId },
    });

    if (!provider) {
      throw new NotFoundException(`Provider ${id} not found`);
    }

    return provider;
  }

  async findByNpi(npi: string, organizationId: string): Promise<ProviderEntity> {
    const provider = await this.providerRepository.findOne({
      where: { npi, organizationId },
    });

    if (!provider) {
      throw new NotFoundException(`Provider with NPI ${npi} not found`);
    }

    return provider;
  }

  async search(params: SearchProviderDto, organizationId: string): Promise<{
    data: ProviderEntity[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const page = params.page ?? 1;
    const limit = params.limit ?? 25;
    const sortBy = params.sortBy ?? 'displayName';
    const sortOrder = (params.sortOrder ?? 'asc').toUpperCase() as 'ASC' | 'DESC';

    const qb = this.providerRepository.createQueryBuilder('p');
    qb.where('p.organization_id = :organizationId', { organizationId });

    // Text search on display name, NPI, or specialty
    if (params.query) {
      qb.andWhere(
        '(p.display_name ILIKE :query OR p.npi ILIKE :query OR p.specialty ILIKE :query OR p.first_name ILIKE :query OR p.last_name ILIKE :query)',
        { query: `%${params.query}%` },
      );
    }

    if (params.specialty) {
      qb.andWhere('p.specialty ILIKE :specialty', { specialty: `%${params.specialty}%` });
    }

    if (params.city) {
      qb.andWhere("p.address->>'city' ILIKE :city", { city: `%${params.city}%` });
    }

    if (params.state) {
      qb.andWhere("p.address->>'state' = :state", { state: params.state });
    }

    if (params.zip) {
      qb.andWhere("p.address->>'zip' = :zip", { zip: params.zip });
    }

    if (params.networkTier) {
      qb.andWhere('p.network_tier = :networkTier', { networkTier: params.networkTier });
    }

    if (params.acceptingNewPatients !== undefined) {
      qb.andWhere('p.accepting_new_patients = :acceptingNewPatients', {
        acceptingNewPatients: params.acceptingNewPatients,
      });
    }

    if (params.status) {
      qb.andWhere('p.status = :status', { status: params.status });
    }

    // Geo-based search: calculate distance using Haversine formula
    if (params.latitude && params.longitude && params.radiusMiles) {
      const radiusKm = params.radiusMiles * 1.60934;
      qb.andWhere(
        `(
          6371 * acos(
            cos(radians(:lat)) * cos(radians((p.address->>'latitude')::float))
            * cos(radians((p.address->>'longitude')::float) - radians(:lng))
            + sin(radians(:lat)) * sin(radians((p.address->>'latitude')::float))
          )
        ) <= :radius`,
        { lat: params.latitude, lng: params.longitude, radius: radiusKm },
      );

      // Add distance as a selectable field
      qb.addSelect(
        `(
          6371 * acos(
            cos(radians(:distLat)) * cos(radians((p.address->>'latitude')::float))
            * cos(radians((p.address->>'longitude')::float) - radians(:distLng))
            + sin(radians(:distLat)) * sin(radians((p.address->>'latitude')::float))
          )
        ) * 0.621371`,
        'distance_miles',
      );
      qb.setParameter('distLat', params.latitude);
      qb.setParameter('distLng', params.longitude);
    }

    // Sorting
    const sortColumnMap: Record<string, string> = {
      displayName: 'p.display_name',
      specialty: 'p.specialty',
      status: 'p.status',
      createdAt: 'p.created_at',
      qualityScore: 'p.quality_score',
    };
    const sortColumn = sortColumnMap[sortBy] || 'p.display_name';
    qb.orderBy(sortColumn, sortOrder);

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

  async update(id: string, dto: UpdateProviderDto, organizationId: string): Promise<ProviderEntity> {
    const provider = await this.findById(id, organizationId);

    // If NPI changed, check for duplicate
    if (dto.npi && dto.npi !== provider.npi) {
      const existing = await this.providerRepository.findOne({
        where: { npi: dto.npi, organizationId },
      });
      if (existing) {
        throw new ConflictException(`Provider with NPI ${dto.npi} already exists`);
      }
    }

    Object.assign(provider, dto);
    const updated = await this.providerRepository.save(provider);
    this.logger.log(`Provider updated: ${updated.id} in org ${organizationId}`);
    return updated;
  }

  async updateCredentialing(
    id: string,
    dto: UpdateCredentialingDto,
    organizationId: string,
  ): Promise<ProviderEntity> {
    const provider = await this.findById(id, organizationId);

    provider.credentialingStatus = dto.credentialingStatus as any;
    if (dto.credentialingDate) provider.credentialingDate = dto.credentialingDate;
    if (dto.recredentialingDate) provider.recredentialingDate = dto.recredentialingDate;

    // Auto-activate on approval
    if (dto.credentialingStatus === 'approved' && provider.status === 'pending') {
      provider.status = 'active';
      this.logger.log(`Provider auto-activated on credential approval: ${id}`);
    }

    const updated = await this.providerRepository.save(provider);
    this.logger.log(`Provider credentialing updated: ${id} -> ${dto.credentialingStatus}`);
    return updated;
  }

  async getNetworkStats(organizationId: string): Promise<{
    totalProviders: number;
    byStatus: Record<string, number>;
    byNetworkTier: Record<string, number>;
    bySpecialty: { specialty: string; count: number }[];
    credentialingPending: number;
    expiringLicenses: number;
    acceptingNewPatients: number;
  }> {
    const totalProviders = await this.providerRepository.count({
      where: { organizationId },
    });

    // By status
    const statusCounts = await this.providerRepository
      .createQueryBuilder('p')
      .select('p.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('p.organization_id = :organizationId', { organizationId })
      .groupBy('p.status')
      .getRawMany();

    const byStatus: Record<string, number> = {};
    for (const row of statusCounts) {
      byStatus[row.status] = parseInt(row.count, 10);
    }

    // By network tier
    const tierCounts = await this.providerRepository
      .createQueryBuilder('p')
      .select('p.network_tier', 'tier')
      .addSelect('COUNT(*)', 'count')
      .where('p.organization_id = :organizationId', { organizationId })
      .groupBy('p.network_tier')
      .getRawMany();

    const byNetworkTier: Record<string, number> = {};
    for (const row of tierCounts) {
      byNetworkTier[row.tier] = parseInt(row.count, 10);
    }

    // By specialty (top 20)
    const specialtyCounts = await this.providerRepository
      .createQueryBuilder('p')
      .select('p.specialty', 'specialty')
      .addSelect('COUNT(*)', 'count')
      .where('p.organization_id = :organizationId', { organizationId })
      .groupBy('p.specialty')
      .orderBy('count', 'DESC')
      .limit(20)
      .getRawMany();

    const bySpecialty = specialtyCounts.map((r) => ({
      specialty: r.specialty,
      count: parseInt(r.count, 10),
    }));

    // Credentialing pending
    const credentialingPending = await this.providerRepository.count({
      where: { organizationId, credentialingStatus: 'in_review' as any },
    });

    // Licenses expiring in 90 days
    const expiringResult = await this.providerRepository
      .createQueryBuilder('p')
      .where('p.organization_id = :organizationId', { organizationId })
      .andWhere('p.license_expiration_date IS NOT NULL')
      .andWhere("p.license_expiration_date <= (CURRENT_DATE + INTERVAL '90 days')")
      .andWhere('p.license_expiration_date >= CURRENT_DATE')
      .getCount();

    // Accepting new patients
    const acceptingNewPatients = await this.providerRepository.count({
      where: { organizationId, acceptingNewPatients: true },
    });

    return {
      totalProviders,
      byStatus,
      byNetworkTier,
      bySpecialty,
      credentialingPending,
      expiringLicenses: expiringResult,
      acceptingNewPatients,
    };
  }
}

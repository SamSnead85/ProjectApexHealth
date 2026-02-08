import {
  Injectable, Logger, NotFoundException, ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { OrganizationEntity } from './entities/organization.entity';
import {
  CreateOrganizationDto, UpdateOrganizationDto, SearchOrganizationDto,
} from './dto/organization.dto';

@Injectable()
export class OrganizationService {
  private readonly logger = new Logger(OrganizationService.name);

  constructor(
    @InjectRepository(OrganizationEntity)
    private readonly orgRepository: Repository<OrganizationEntity>,
  ) {}

  /**
   * Create a new organization.
   */
  async create(dto: CreateOrganizationDto): Promise<OrganizationEntity> {
    // Check slug uniqueness
    const existing = await this.orgRepository.findOne({ where: { slug: dto.slug } });
    if (existing) {
      throw new ConflictException(`Organization with slug "${dto.slug}" already exists`);
    }

    const org = this.orgRepository.create(dto);
    const saved = await this.orgRepository.save(org);
    this.logger.log(`Organization created: ${saved.name} (${saved.slug})`);
    return saved;
  }

  /**
   * Find organization by ID.
   */
  async findById(id: string): Promise<OrganizationEntity> {
    const org = await this.orgRepository.findOne({ where: { id } });
    if (!org) {
      throw new NotFoundException(`Organization ${id} not found`);
    }
    return org;
  }

  /**
   * Find organization by slug.
   */
  async findBySlug(slug: string): Promise<OrganizationEntity> {
    const org = await this.orgRepository.findOne({ where: { slug } });
    if (!org) {
      throw new NotFoundException(`Organization with slug "${slug}" not found`);
    }
    return org;
  }

  /**
   * Update an organization.
   */
  async update(id: string, dto: UpdateOrganizationDto): Promise<OrganizationEntity> {
    const org = await this.findById(id);

    // If slug is changing, check uniqueness
    if (dto.slug && dto.slug !== org.slug) {
      const slugExists = await this.orgRepository.findOne({ where: { slug: dto.slug } });
      if (slugExists) {
        throw new ConflictException(`Organization with slug "${dto.slug}" already exists`);
      }
    }

    Object.assign(org, dto);
    const saved = await this.orgRepository.save(org);
    this.logger.log(`Organization updated: ${saved.name} (${saved.id})`);
    return saved;
  }

  /**
   * List organizations with pagination and filtering.
   */
  async list(params: SearchOrganizationDto): Promise<{
    data: OrganizationEntity[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;

    const qb = this.orgRepository.createQueryBuilder('org');

    if (params.search) {
      qb.andWhere(
        '(org.name ILIKE :search OR org.slug ILIKE :search)',
        { search: `%${params.search}%` },
      );
    }

    if (params.type) {
      qb.andWhere('org.type = :type', { type: params.type });
    }

    if (params.isActive !== undefined) {
      qb.andWhere('org.is_active = :isActive', { isActive: params.isActive });
    }

    qb.orderBy('org.name', 'ASC');
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
   * Update the licensed modules for an organization.
   */
  async updateModules(id: string, modules: string[]): Promise<OrganizationEntity> {
    const org = await this.findById(id);
    org.licensedModules = modules;
    const saved = await this.orgRepository.save(org);
    this.logger.log(`Licensed modules updated for org ${saved.name}: ${modules.join(', ')}`);
    return saved;
  }

  /**
   * Get organization settings.
   */
  async getSettings(id: string): Promise<Record<string, any>> {
    const org = await this.findById(id);
    return org.settings;
  }

  /**
   * Update organization settings (merge with existing).
   */
  async updateSettings(
    id: string,
    settings: Record<string, any>,
  ): Promise<Record<string, any>> {
    const org = await this.findById(id);
    org.settings = { ...org.settings, ...settings };
    const saved = await this.orgRepository.save(org);
    this.logger.log(`Settings updated for org ${saved.name}`);
    return saved.settings;
  }
}

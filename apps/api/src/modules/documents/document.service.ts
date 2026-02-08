import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { DocumentEntity } from './entities/document.entity';
import { UploadDocumentDto, SearchDocumentDto } from './dto/document.dto';

@Injectable()
export class DocumentService {
  private readonly logger = new Logger(DocumentService.name);

  constructor(
    @InjectRepository(DocumentEntity)
    private readonly documentRepository: Repository<DocumentEntity>,
  ) {}

  /**
   * Upload a document. In production this integrates with MinIO/S3.
   */
  async upload(
    dto: UploadDocumentDto,
    file: { originalname: string; mimetype: string; size: number; buffer: Buffer },
    userId: string,
    userName: string,
    organizationId: string,
  ): Promise<DocumentEntity> {
    // Generate storage key
    const ext = file.originalname.split('.').pop();
    const storageKey = `${organizationId}/${new Date().getFullYear()}/${uuidv4()}.${ext}`;

    // In production, upload to MinIO/S3:
    // await this.minioClient.putObject(bucket, storageKey, file.buffer, file.size);

    // Compute checksum
    const crypto = await import('crypto');
    const checksum = crypto.createHash('sha256').update(file.buffer).digest('hex');

    const document = this.documentRepository.create({
      ...dto,
      organizationId,
      status: 'active',
      mimeType: file.mimetype,
      fileSize: file.size,
      fileName: file.originalname,
      storageKey,
      checksum,
      uploadedBy: userId,
      uploadedByName: userName,
      accessCount: 0,
    });

    const saved = await this.documentRepository.save(document);
    this.logger.log(`Document uploaded: ${saved.title} (${saved.fileName}) by ${userName}`);
    return saved;
  }

  /**
   * Download a document with audit logging.
   */
  async download(
    id: string,
    userId: string,
    organizationId: string,
  ): Promise<{ document: DocumentEntity; buffer: Buffer }> {
    const document = await this.documentRepository.findOne({
      where: { id, organizationId },
    });

    if (!document || document.status === 'deleted') {
      throw new NotFoundException(`Document ${id} not found`);
    }

    // Update access tracking
    document.lastAccessedAt = new Date();
    document.lastAccessedBy = userId;
    document.accessCount += 1;
    await this.documentRepository.save(document);

    // In production, download from MinIO/S3:
    // const buffer = await this.minioClient.getObject(bucket, document.storageKey);

    // Placeholder empty buffer
    const buffer = Buffer.alloc(0);

    this.logger.log(`Document downloaded: ${document.id} by user ${userId}`);
    return { document, buffer };
  }

  async findById(id: string, organizationId: string): Promise<DocumentEntity> {
    const document = await this.documentRepository.findOne({
      where: { id, organizationId },
    });

    if (!document) {
      throw new NotFoundException(`Document ${id} not found`);
    }

    return document;
  }

  async search(params: SearchDocumentDto, organizationId: string): Promise<{
    data: DocumentEntity[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const page = params.page ?? 1;
    const limit = params.limit ?? 25;

    const qb = this.documentRepository.createQueryBuilder('doc');
    qb.where('doc.organization_id = :organizationId', { organizationId });
    qb.andWhere('doc.status != :deleted', { deleted: 'deleted' });

    if (params.query) {
      qb.andWhere(
        '(doc.title ILIKE :query OR doc.file_name ILIKE :query OR doc.description ILIKE :query)',
        { query: `%${params.query}%` },
      );
    }

    if (params.category) {
      qb.andWhere('doc.category = :category', { category: params.category });
    }

    if (params.status) {
      qb.andWhere('doc.status = :status', { status: params.status });
    }

    if (params.memberId) {
      qb.andWhere('doc.member_id = :memberId', { memberId: params.memberId });
    }

    if (params.claimId) {
      qb.andWhere('doc.claim_id = :claimId', { claimId: params.claimId });
    }

    if (params.providerId) {
      qb.andWhere('doc.provider_id = :providerId', { providerId: params.providerId });
    }

    if (params.containsPhi !== undefined) {
      qb.andWhere('doc.contains_phi = :containsPhi', { containsPhi: params.containsPhi });
    }

    qb.orderBy('doc.created_at', 'DESC');
    qb.skip((page - 1) * limit);
    qb.take(limit);

    const [data, total] = await qb.getManyAndCount();

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async softDelete(id: string, organizationId: string): Promise<void> {
    const document = await this.findById(id, organizationId);
    document.status = 'deleted';
    await this.documentRepository.save(document);

    // In production, also delete from MinIO/S3 (or move to archive bucket)
    this.logger.log(`Document soft-deleted: ${id}`);
  }
}

import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EdiTransactionEntity, EdiValidationError, SnipLevel } from './entities/edi-transaction.entity';
import { SearchEdiDto } from './dto/edi.dto';

@Injectable()
export class EdiService {
  private readonly logger = new Logger(EdiService.name);

  constructor(
    @InjectRepository(EdiTransactionEntity)
    private readonly ediRepository: Repository<EdiTransactionEntity>,
  ) {}

  /**
   * Parse raw X12 content into structured JSON.
   * This is a stub implementation — in production, use a full X12 parser library.
   */
  parseX12(content: string): {
    transactionType: string;
    interchangeControlNumber: string;
    senderId: string;
    receiverId: string;
    segmentCount: number;
    data: Record<string, any>;
  } {
    const lines = content.split('~').map((s) => s.trim()).filter(Boolean);

    if (lines.length === 0) {
      throw new BadRequestException('Empty X12 content');
    }

    // Parse ISA segment
    const isaSegment = lines.find((l) => l.startsWith('ISA'));
    if (!isaSegment) {
      throw new BadRequestException('Missing ISA segment');
    }

    const isaElements = isaSegment.split('*');
    const senderId = isaElements[6]?.trim();
    const receiverId = isaElements[8]?.trim();
    const interchangeControlNumber = isaElements[13]?.trim();

    // Detect transaction type from ST segment
    const stSegment = lines.find((l) => l.startsWith('ST'));
    const stElements = stSegment?.split('*') || [];
    const transactionType = stElements[1] || 'unknown';

    // Basic parsed structure
    const segments = lines.map((line) => {
      const elements = line.split('*');
      return {
        id: elements[0],
        elements: elements.slice(1),
      };
    });

    this.logger.log(`Parsed X12 ${transactionType}: ${lines.length} segments, ICN: ${interchangeControlNumber}`);

    return {
      transactionType,
      interchangeControlNumber,
      senderId,
      receiverId,
      segmentCount: lines.length,
      data: { segments },
    };
  }

  /**
   * Generate X12 content from structured data.
   * Stub implementation for each transaction type.
   */
  generateX12(type: string, data: Record<string, any>): string {
    const now = new Date();
    const date = now.toISOString().slice(2, 10).replace(/-/g, '');
    const time = now.toISOString().slice(11, 15).replace(/:/g, '');
    const icn = String(Math.floor(Math.random() * 999999999)).padStart(9, '0');

    const segments: string[] = [];

    // ISA Header
    segments.push(
      `ISA*00*          *00*          *ZZ*${(data.senderId || 'SENDER').padEnd(15)}*ZZ*${(data.receiverId || 'RECEIVER').padEnd(15)}*${date}*${time}*^*00501*${icn}*0*${data.environment || 'T'}*:`,
    );
    segments.push(`GS*HP*${data.senderId || 'SENDER'}*${data.receiverId || 'RECEIVER'}*${date}*${time}*1*X*005010X279A1`);

    switch (type) {
      case '270':
        segments.push(`ST*270*0001*005010X279A1`);
        segments.push(`BHT*0022*13*${icn}*${date}*${time}`);
        segments.push(`HL*1**20*1`);
        segments.push(`NM1*PR*2*${data.payerName || 'PAYER'}*****PI*${data.payerId || '00000'}`);
        segments.push(`HL*2*1*21*1`);
        segments.push(`NM1*1P*1*${data.providerLastName || 'PROVIDER'}*${data.providerFirstName || ''}****XX*${data.npi || '0000000000'}`);
        segments.push(`HL*3*2*22*0`);
        segments.push(`NM1*IL*1*${data.memberLastName || 'MEMBER'}*${data.memberFirstName || ''}****MI*${data.memberId || '000000'}`);
        segments.push(`DTP*291*D8*${data.serviceDate || date}`);
        segments.push(`EQ*30`);
        segments.push(`SE*${segments.length - 1}*0001`);
        break;

      case '837P':
        segments.push(`ST*837*0001*005010X222A1`);
        segments.push(`BHT*0019*00*${icn}*${date}*${time}*CH`);
        // Simplified 837P - in production this would be fully populated
        segments.push(`SE*4*0001`);
        break;

      case '835':
        segments.push(`ST*835*0001*005010X221A1`);
        segments.push(`BPR*I*${data.totalAmount || '0'}*C*ACH*CCP*01*${data.routingNumber || '000000000'}*DA*${data.accountNumber || '0000000000'}*${data.payerId || '00000'}**01*${data.payeeRouting || '000000000'}*DA*${data.payeeAccount || '0000000000'}*${date}`);
        segments.push(`TRN*1*${icn}*${data.payerId || '00000'}`);
        segments.push(`SE*4*0001`);
        break;

      case '834':
        segments.push(`ST*834*0001*005010X220A1`);
        segments.push(`BGN*00*${icn}*${date}*${time}****2`);
        segments.push(`SE*3*0001`);
        break;

      default:
        throw new BadRequestException(`Unsupported X12 generation type: ${type}`);
    }

    segments.push(`GE*1*1`);
    segments.push(`IEA*1*${icn}`);

    return segments.join('~\n') + '~';
  }

  /**
   * Validate X12 content with SNIP levels.
   */
  validate(content: string, snipLevel: SnipLevel = 2): {
    isValid: boolean;
    errors: EdiValidationError[];
    snipLevelValidated: SnipLevel;
  } {
    const errors: EdiValidationError[] = [];
    const lines = content.split('~').map((s) => s.trim()).filter(Boolean);

    // SNIP Level 1: Integrity checks (EDI syntax)
    if (snipLevel >= 1) {
      if (!lines.some((l) => l.startsWith('ISA'))) {
        errors.push({
          segment: 'ISA',
          element: '*',
          code: 'SNIP1-001',
          message: 'Missing ISA (Interchange Control Header) segment',
          snipLevel: 1,
        });
      }
      if (!lines.some((l) => l.startsWith('IEA'))) {
        errors.push({
          segment: 'IEA',
          element: '*',
          code: 'SNIP1-002',
          message: 'Missing IEA (Interchange Control Trailer) segment',
          snipLevel: 1,
        });
      }
      if (!lines.some((l) => l.startsWith('GS'))) {
        errors.push({
          segment: 'GS',
          element: '*',
          code: 'SNIP1-003',
          message: 'Missing GS (Functional Group Header) segment',
          snipLevel: 1,
        });
      }
      if (!lines.some((l) => l.startsWith('ST'))) {
        errors.push({
          segment: 'ST',
          element: '*',
          code: 'SNIP1-004',
          message: 'Missing ST (Transaction Set Header) segment',
          snipLevel: 1,
        });
      }
    }

    // SNIP Level 2: Requirement checks (required fields)
    if (snipLevel >= 2) {
      const isaSegment = lines.find((l) => l.startsWith('ISA'));
      if (isaSegment) {
        const isaElements = isaSegment.split('*');
        if (isaElements.length < 17) {
          errors.push({
            segment: 'ISA',
            element: '*',
            code: 'SNIP2-001',
            message: `ISA segment has ${isaElements.length} elements, expected 17`,
            snipLevel: 2,
          });
        }
      }

      // Check SE segment count matches
      const seSegment = lines.find((l) => l.startsWith('SE'));
      if (seSegment) {
        const seElements = seSegment.split('*');
        const declaredCount = parseInt(seElements[1], 10);
        const stIndex = lines.findIndex((l) => l.startsWith('ST'));
        const seIndex = lines.findIndex((l) => l.startsWith('SE'));
        const actualCount = seIndex - stIndex + 1;

        if (declaredCount !== actualCount) {
          errors.push({
            segment: 'SE',
            element: 'SE01',
            code: 'SNIP2-002',
            message: `SE01 segment count (${declaredCount}) does not match actual count (${actualCount})`,
            snipLevel: 2,
          });
        }
      }
    }

    // SNIP Levels 3-7 would add progressively stricter validation
    // (balancing, inter-segment, external code set, trading partner-specific)

    return {
      isValid: errors.length === 0,
      errors,
      snipLevelValidated: snipLevel,
    };
  }

  /**
   * Upload and process an EDI file.
   */
  async uploadAndProcess(
    content: string,
    transactionType: string,
    organizationId: string,
    fileName?: string,
    notes?: string,
  ): Promise<EdiTransactionEntity> {
    // Create transaction record
    const transaction = this.ediRepository.create({
      organizationId,
      transactionType: transactionType as any,
      direction: 'inbound',
      status: 'received',
      rawContent: content,
      fileName,
      fileSize: Buffer.byteLength(content),
      notes,
    });

    let saved = await this.ediRepository.save(transaction);

    try {
      // Parse
      saved.status = 'parsing';
      await this.ediRepository.save(saved);

      const parsed = this.parseX12(content);
      saved.parsedData = parsed.data;
      saved.segmentCount = parsed.segmentCount;
      saved.interchangeControlNumber = parsed.interchangeControlNumber;
      saved.senderId = parsed.senderId;
      saved.receiverId = parsed.receiverId;
      saved.status = 'parsed';
      await this.ediRepository.save(saved);

      // Validate
      const validation = this.validate(content, 2);
      saved.isValid = validation.isValid;
      saved.validationErrors = validation.errors;
      saved.snipLevelValidated = validation.snipLevelValidated;
      saved.status = validation.isValid ? 'validated' : 'error';
      saved = await this.ediRepository.save(saved);

      this.logger.log(
        `EDI ${transactionType} processed: ${saved.id}, valid=${validation.isValid}, segments=${parsed.segmentCount}`,
      );
    } catch (error) {
      saved.status = 'error';
      saved.validationErrors = [{
        segment: '*',
        element: '*',
        code: 'PARSE-ERR',
        message: error.message,
        snipLevel: 1,
      }];
      saved = await this.ediRepository.save(saved);
      this.logger.error(`EDI processing failed: ${error.message}`, error.stack);
    }

    return saved;
  }

  async findById(id: string, organizationId: string): Promise<EdiTransactionEntity> {
    const transaction = await this.ediRepository.findOne({
      where: { id, organizationId },
    });

    if (!transaction) {
      throw new NotFoundException(`EDI transaction ${id} not found`);
    }

    return transaction;
  }

  async search(params: SearchEdiDto, organizationId: string): Promise<{
    data: EdiTransactionEntity[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const page = params.page ?? 1;
    const limit = params.limit ?? 25;

    const qb = this.ediRepository.createQueryBuilder('edi');
    qb.where('edi.organization_id = :organizationId', { organizationId });

    // Don't return raw content in search results for performance
    qb.select([
      'edi.id', 'edi.organizationId', 'edi.transactionType', 'edi.direction',
      'edi.status', 'edi.interchangeControlNumber', 'edi.senderId', 'edi.receiverId',
      'edi.segmentCount', 'edi.fileSize', 'edi.fileName', 'edi.isValid',
      'edi.snipLevelValidated', 'edi.claimCount', 'edi.memberCount',
      'edi.processedCount', 'edi.errorCount', 'edi.notes',
      'edi.createdAt', 'edi.updatedAt',
    ]);

    if (params.transactionType) {
      qb.andWhere('edi.transaction_type = :transactionType', { transactionType: params.transactionType });
    }

    if (params.direction) {
      qb.andWhere('edi.direction = :direction', { direction: params.direction });
    }

    if (params.status) {
      qb.andWhere('edi.status = :status', { status: params.status });
    }

    if (params.dateFrom) {
      qb.andWhere('edi.created_at >= :dateFrom', { dateFrom: params.dateFrom });
    }

    if (params.dateTo) {
      qb.andWhere('edi.created_at <= :dateTo', { dateTo: params.dateTo });
    }

    qb.orderBy('edi.created_at', 'DESC');
    qb.skip((page - 1) * limit);
    qb.take(limit);

    const [data, total] = await qb.getManyAndCount();

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }
}

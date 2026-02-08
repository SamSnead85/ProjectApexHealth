import {
  Controller, Get, Post, Body, Param, Query,
  UseGuards, HttpCode, HttpStatus, UploadedFile, UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { EdiService } from './edi.service';
import { UploadEdiDto, GenerateEdiDto, ValidateEdiDto, SearchEdiDto } from './dto/edi.dto';

@ApiTags('edi')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('edi')
export class EdiController {
  constructor(private readonly ediService: EdiService) {}

  @Post('upload')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload and process an EDI X12 file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        transactionType: { type: 'string', enum: ['270', '271', '834', '835', '837P', '837I'] },
        notes: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'EDI file uploaded and processed' })
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadEdiDto,
    @CurrentUser() user: any,
  ) {
    const content = file.buffer.toString('utf-8');
    const transaction = await this.ediService.uploadAndProcess(
      content,
      dto.transactionType,
      user.organizationId,
      file.originalname,
      dto.notes,
    );

    return {
      success: true,
      data: transaction,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('generate')
  @ApiOperation({ summary: 'Generate X12 content from structured data' })
  @ApiResponse({ status: 200, description: 'X12 content generated' })
  async generate(@Body() dto: GenerateEdiDto, @CurrentUser() user: any) {
    const content = this.ediService.generateX12(dto.transactionType, dto.data);
    return {
      success: true,
      data: {
        transactionType: dto.transactionType,
        content,
        segmentCount: content.split('~').filter(Boolean).length,
      },
      timestamp: new Date().toISOString(),
    };
  }

  @Post('validate')
  @ApiOperation({ summary: 'Validate X12 content against SNIP levels' })
  @ApiResponse({ status: 200, description: 'Validation results returned' })
  async validate(@Body() dto: ValidateEdiDto) {
    const result = this.ediService.validate(dto.content, (dto.snipLevel ?? 2) as any);
    return {
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('search')
  @ApiOperation({ summary: 'Search EDI transactions' })
  @ApiResponse({ status: 200, description: 'EDI transaction search results' })
  async search(@Query() params: SearchEdiDto, @CurrentUser() user: any) {
    const results = await this.ediService.search(params, user.organizationId);
    return {
      success: true,
      ...results,
      timestamp: new Date().toISOString(),
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get EDI transaction by ID' })
  @ApiParam({ name: 'id', description: 'EDI transaction UUID' })
  @ApiResponse({ status: 200, description: 'EDI transaction found' })
  @ApiResponse({ status: 404, description: 'EDI transaction not found' })
  async findById(@Param('id') id: string, @CurrentUser() user: any) {
    const transaction = await this.ediService.findById(id, user.organizationId);
    return {
      success: true,
      data: transaction,
      timestamp: new Date().toISOString(),
    };
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Download raw X12 content for an EDI transaction' })
  @ApiParam({ name: 'id', description: 'EDI transaction UUID' })
  @ApiResponse({ status: 200, description: 'Raw X12 content returned' })
  async download(@Param('id') id: string, @CurrentUser() user: any) {
    const transaction = await this.ediService.findById(id, user.organizationId);
    return {
      success: true,
      data: {
        id: transaction.id,
        transactionType: transaction.transactionType,
        fileName: transaction.fileName,
        content: transaction.rawContent,
      },
      timestamp: new Date().toISOString(),
    };
  }
}

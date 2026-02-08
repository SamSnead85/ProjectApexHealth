import {
  Controller, Get, Post, Delete, Body, Param, Query,
  UseGuards, HttpCode, HttpStatus, UploadedFile, UseInterceptors,
  Res, StreamableFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { DocumentService } from './document.service';
import { UploadDocumentDto, SearchDocumentDto } from './dto/document.dto';

@ApiTags('documents')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('documents')
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Post('upload')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file', {
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max
  }))
  @ApiOperation({ summary: 'Upload a document' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        title: { type: 'string' },
        category: { type: 'string' },
        description: { type: 'string' },
        containsPhi: { type: 'boolean' },
        memberId: { type: 'string' },
        claimId: { type: 'string' },
        providerId: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Document uploaded successfully' })
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadDocumentDto,
    @CurrentUser() user: any,
  ) {
    const document = await this.documentService.upload(
      dto,
      {
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        buffer: file.buffer,
      },
      user.sub || user.id,
      `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
      user.organizationId,
    );

    return {
      success: true,
      data: document,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('search')
  @ApiOperation({ summary: 'Search documents with filtering and pagination' })
  @ApiResponse({ status: 200, description: 'Document search results' })
  async search(@Query() params: SearchDocumentDto, @CurrentUser() user: any) {
    const results = await this.documentService.search(params, user.organizationId);
    return {
      success: true,
      ...results,
      timestamp: new Date().toISOString(),
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get document metadata by ID' })
  @ApiParam({ name: 'id', description: 'Document UUID' })
  @ApiResponse({ status: 200, description: 'Document found' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  async findById(@Param('id') id: string, @CurrentUser() user: any) {
    const document = await this.documentService.findById(id, user.organizationId);
    return {
      success: true,
      data: document,
      timestamp: new Date().toISOString(),
    };
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Download a document file' })
  @ApiParam({ name: 'id', description: 'Document UUID' })
  @ApiResponse({ status: 200, description: 'File stream returned' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  async download(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { document, buffer } = await this.documentService.download(
      id,
      user.sub || user.id,
      user.organizationId,
    );

    res.set({
      'Content-Type': document.mimeType,
      'Content-Disposition': `attachment; filename="${document.fileName}"`,
      'Content-Length': document.fileSize.toString(),
    });

    return new StreamableFile(buffer);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a document (soft delete)' })
  @ApiParam({ name: 'id', description: 'Document UUID' })
  @ApiResponse({ status: 204, description: 'Document deleted' })
  async delete(@Param('id') id: string, @CurrentUser() user: any) {
    await this.documentService.softDelete(id, user.organizationId);
  }
}

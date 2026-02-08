import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { DocumentEntity } from './entities/document.entity';
import { DocumentService } from './document.service';
import { DocumentController } from './document.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([DocumentEntity]),
    MulterModule.register({
      limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
    }),
  ],
  controllers: [DocumentController],
  providers: [DocumentService],
  exports: [DocumentService],
})
export class DocumentModule {}

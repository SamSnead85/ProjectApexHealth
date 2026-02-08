import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrganizationController } from './organization.controller';
import { OrganizationService } from './organization.service';
import { OrganizationEntity } from './entities/organization.entity';

@Module({
  imports: [TypeOrmModule.forFeature([OrganizationEntity])],
  controllers: [OrganizationController],
  providers: [OrganizationService],
  exports: [OrganizationService],
})
export class OrganizationModule {}

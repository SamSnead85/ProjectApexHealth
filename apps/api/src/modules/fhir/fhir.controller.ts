import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { FhirService } from './fhir.service';

@ApiTags('fhir')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('fhir')
export class FhirController {
  constructor(private readonly fhirService: FhirService) {}

  // ─── Patient ─────────────────────────────────────────

  @Get('Patient')
  @ApiOperation({ summary: 'FHIR R4 Patient search' })
  @ApiQuery({ name: 'name', required: false, description: 'Patient name search' })
  @ApiQuery({ name: 'identifier', required: false, description: 'Patient member ID' })
  @ApiQuery({ name: 'birthdate', required: false, description: 'Patient birth date (YYYY-MM-DD)' })
  @ApiResponse({ status: 200, description: 'FHIR Bundle of Patient resources' })
  async searchPatients(@Query() params: Record<string, string>, @CurrentUser() user: any) {
    return this.fhirService.searchPatients(user.organizationId, params);
  }

  @Get('Patient/:id')
  @ApiOperation({ summary: 'FHIR R4 Patient read' })
  @ApiParam({ name: 'id', description: 'Patient (member) UUID' })
  @ApiResponse({ status: 200, description: 'FHIR Patient resource' })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  async getPatient(@Param('id') id: string, @CurrentUser() user: any) {
    return this.fhirService.getPatient(id, user.organizationId);
  }

  // ─── Coverage ────────────────────────────────────────

  @Get('Coverage')
  @ApiOperation({ summary: 'FHIR R4 Coverage search' })
  @ApiQuery({ name: 'patient', required: false, description: 'Member ID reference' })
  @ApiQuery({ name: 'status', required: false, description: 'Coverage status' })
  @ApiResponse({ status: 200, description: 'FHIR Bundle of Coverage resources' })
  async searchCoverages(@Query() params: Record<string, string>, @CurrentUser() user: any) {
    return this.fhirService.searchCoverages(user.organizationId, params);
  }

  @Get('Coverage/:id')
  @ApiOperation({ summary: 'FHIR R4 Coverage read' })
  @ApiParam({ name: 'id', description: 'Coverage (eligibility) UUID' })
  @ApiResponse({ status: 200, description: 'FHIR Coverage resource' })
  @ApiResponse({ status: 404, description: 'Coverage not found' })
  async getCoverage(@Param('id') id: string, @CurrentUser() user: any) {
    return this.fhirService.getCoverage(id, user.organizationId);
  }

  // ─── ExplanationOfBenefit ────────────────────────────

  @Get('ExplanationOfBenefit')
  @ApiOperation({ summary: 'FHIR R4 ExplanationOfBenefit search' })
  @ApiQuery({ name: 'patient', required: false, description: 'Patient (member) reference' })
  @ApiQuery({ name: 'status', required: false, description: 'EOB status (active, cancelled, complete)' })
  @ApiResponse({ status: 200, description: 'FHIR Bundle of ExplanationOfBenefit resources' })
  async searchEobs(@Query() params: Record<string, string>, @CurrentUser() user: any) {
    return this.fhirService.searchExplanationsOfBenefit(user.organizationId, params);
  }

  @Get('ExplanationOfBenefit/:id')
  @ApiOperation({ summary: 'FHIR R4 ExplanationOfBenefit read' })
  @ApiParam({ name: 'id', description: 'Claim UUID' })
  @ApiResponse({ status: 200, description: 'FHIR ExplanationOfBenefit resource' })
  @ApiResponse({ status: 404, description: 'ExplanationOfBenefit not found' })
  async getEob(@Param('id') id: string, @CurrentUser() user: any) {
    return this.fhirService.getExplanationOfBenefit(id, user.organizationId);
  }

  // ─── Practitioner ────────────────────────────────────

  @Get('Practitioner/:id')
  @ApiOperation({ summary: 'FHIR R4 Practitioner read' })
  @ApiParam({ name: 'id', description: 'Provider UUID' })
  @ApiResponse({ status: 200, description: 'FHIR Practitioner resource' })
  @ApiResponse({ status: 404, description: 'Practitioner not found' })
  async getPractitioner(@Param('id') id: string, @CurrentUser() user: any) {
    return this.fhirService.getPractitioner(id, user.organizationId);
  }
}

import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

/**
 * FHIR R4 Resource transformation service.
 * Converts internal Apex entities to FHIR R4 compliant JSON resources.
 */
@Injectable()
export class FhirService {
  private readonly logger = new Logger(FhirService.name);

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  // ─── Patient (from member.members) ──────────────────

  async getPatient(id: string, organizationId: string): Promise<any> {
    const member = await this.dataSource.query(
      `SELECT * FROM member.members WHERE id = $1 AND organization_id = $2`,
      [id, organizationId],
    ).then((rows) => rows[0]);

    if (!member) {
      throw new NotFoundException(`Patient ${id} not found`);
    }

    return this.toFhirPatient(member);
  }

  async searchPatients(organizationId: string, params: Record<string, string>): Promise<any> {
    let query = `SELECT * FROM member.members WHERE organization_id = $1`;
    const queryParams: any[] = [organizationId];
    let paramIdx = 2;

    if (params.name) {
      query += ` AND (first_name ILIKE $${paramIdx} OR last_name ILIKE $${paramIdx})`;
      queryParams.push(`%${params.name}%`);
      paramIdx++;
    }

    if (params.identifier) {
      query += ` AND member_id = $${paramIdx}`;
      queryParams.push(params.identifier);
      paramIdx++;
    }

    if (params.birthdate) {
      query += ` AND date_of_birth = $${paramIdx}`;
      queryParams.push(params.birthdate);
      paramIdx++;
    }

    query += ` LIMIT 50`;

    const members = await this.dataSource.query(query, queryParams).catch(() => []);

    return {
      resourceType: 'Bundle',
      type: 'searchset',
      total: members.length,
      entry: members.map((m: any) => ({
        resource: this.toFhirPatient(m),
        search: { mode: 'match' },
      })),
    };
  }

  // ─── Coverage (from member.eligibility) ─────────────

  async getCoverage(id: string, organizationId: string): Promise<any> {
    const eligibility = await this.dataSource.query(
      `SELECT * FROM member.eligibility WHERE id = $1 AND organization_id = $2`,
      [id, organizationId],
    ).then((rows) => rows[0]);

    if (!eligibility) {
      throw new NotFoundException(`Coverage ${id} not found`);
    }

    return this.toFhirCoverage(eligibility);
  }

  async searchCoverages(organizationId: string, params: Record<string, string>): Promise<any> {
    let query = `SELECT * FROM member.eligibility WHERE organization_id = $1`;
    const queryParams: any[] = [organizationId];
    let paramIdx = 2;

    if (params.patient) {
      query += ` AND member_id = $${paramIdx}`;
      queryParams.push(params.patient);
      paramIdx++;
    }

    if (params.status) {
      query += ` AND status = $${paramIdx}`;
      queryParams.push(params.status);
      paramIdx++;
    }

    query += ` LIMIT 50`;

    const coverages = await this.dataSource.query(query, queryParams).catch(() => []);

    return {
      resourceType: 'Bundle',
      type: 'searchset',
      total: coverages.length,
      entry: coverages.map((c: any) => ({
        resource: this.toFhirCoverage(c),
        search: { mode: 'match' },
      })),
    };
  }

  // ─── ExplanationOfBenefit (from claims.claims) ──────

  async getExplanationOfBenefit(id: string, organizationId: string): Promise<any> {
    const claim = await this.dataSource.query(
      `SELECT * FROM claims.claims WHERE id = $1 AND organization_id = $2`,
      [id, organizationId],
    ).then((rows) => rows[0]);

    if (!claim) {
      throw new NotFoundException(`ExplanationOfBenefit ${id} not found`);
    }

    return this.toFhirEob(claim);
  }

  async searchExplanationsOfBenefit(organizationId: string, params: Record<string, string>): Promise<any> {
    let query = `SELECT * FROM claims.claims WHERE organization_id = $1`;
    const queryParams: any[] = [organizationId];
    let paramIdx = 2;

    if (params.patient) {
      query += ` AND member_id = $${paramIdx}`;
      queryParams.push(params.patient);
      paramIdx++;
    }

    if (params.status) {
      const fhirToInternalStatus: Record<string, string[]> = {
        active: ['received', 'validated', 'in_review', 'priced'],
        cancelled: ['voided'],
        complete: ['paid', 'approved'],
        'entered-in-error': ['denied'],
      };
      const statuses = fhirToInternalStatus[params.status] || [params.status];
      query += ` AND status = ANY($${paramIdx})`;
      queryParams.push(statuses);
      paramIdx++;
    }

    query += ` ORDER BY received_date DESC LIMIT 50`;

    const claims = await this.dataSource.query(query, queryParams).catch(() => []);

    return {
      resourceType: 'Bundle',
      type: 'searchset',
      total: claims.length,
      entry: claims.map((c: any) => ({
        resource: this.toFhirEob(c),
        search: { mode: 'match' },
      })),
    };
  }

  // ─── Practitioner (from provider.providers) ─────────

  async getPractitioner(id: string, organizationId: string): Promise<any> {
    const provider = await this.dataSource.query(
      `SELECT * FROM provider.providers WHERE id = $1 AND organization_id = $2`,
      [id, organizationId],
    ).then((rows) => rows[0]);

    if (!provider) {
      throw new NotFoundException(`Practitioner ${id} not found`);
    }

    return this.toFhirPractitioner(provider);
  }

  // ─── FHIR R4 Transformers ──────────────────────────

  private toFhirPatient(member: any): any {
    const address = typeof member.address === 'string' ? JSON.parse(member.address) : (member.address || {});

    return {
      resourceType: 'Patient',
      id: member.id,
      meta: {
        versionId: '1',
        lastUpdated: member.updated_at || member.updatedAt,
        profile: ['http://hl7.org/fhir/us/core/StructureDefinition/us-core-patient'],
      },
      identifier: [
        {
          type: { coding: [{ system: 'http://terminology.hl7.org/CodeSystem/v2-0203', code: 'MB' }] },
          system: 'urn:apex-health:member-id',
          value: member.member_id || member.memberId,
        },
      ],
      active: member.status === 'active',
      name: [{
        use: 'official',
        family: member.last_name || member.lastName,
        given: [member.first_name || member.firstName, member.middle_name || member.middleName].filter(Boolean),
      }],
      gender: this.mapGender(member.gender),
      birthDate: member.date_of_birth || member.dateOfBirth,
      telecom: [
        member.phone ? { system: 'phone', value: member.phone, use: 'home' } : null,
        member.email ? { system: 'email', value: member.email } : null,
      ].filter(Boolean),
      address: address.line1
        ? [{
            use: 'home',
            line: [address.line1, address.line2].filter(Boolean),
            city: address.city,
            state: address.state,
            postalCode: address.zip,
          }]
        : [],
    };
  }

  private toFhirCoverage(eligibility: any): any {
    return {
      resourceType: 'Coverage',
      id: eligibility.id,
      meta: {
        versionId: '1',
        lastUpdated: eligibility.updated_at || eligibility.updatedAt,
      },
      status: eligibility.status === 'active' ? 'active' : 'cancelled',
      subscriberId: eligibility.subscriber_id || eligibility.subscriberId,
      beneficiary: {
        reference: `Patient/${eligibility.member_id || eligibility.memberId}`,
      },
      period: {
        start: eligibility.effective_date || eligibility.effectiveDate,
        end: eligibility.termination_date || eligibility.terminationDate,
      },
      class: [
        {
          type: { coding: [{ system: 'http://terminology.hl7.org/CodeSystem/coverage-class', code: 'plan' }] },
          value: eligibility.plan_id || eligibility.planId,
        },
        eligibility.group_id || eligibility.groupId
          ? {
              type: { coding: [{ system: 'http://terminology.hl7.org/CodeSystem/coverage-class', code: 'group' }] },
              value: eligibility.group_id || eligibility.groupId,
            }
          : null,
      ].filter(Boolean),
      relationship: {
        coding: [{
          system: 'http://terminology.hl7.org/CodeSystem/subscriber-relationship',
          code: eligibility.relationship || 'self',
        }],
      },
    };
  }

  private toFhirEob(claim: any): any {
    const statusMap: Record<string, string> = {
      received: 'active',
      validated: 'active',
      in_review: 'active',
      priced: 'active',
      adjudicated: 'active',
      approved: 'complete',
      denied: 'entered-in-error',
      paid: 'complete',
      voided: 'cancelled',
    };

    return {
      resourceType: 'ExplanationOfBenefit',
      id: claim.id,
      meta: {
        versionId: '1',
        lastUpdated: claim.updated_at || claim.updatedAt,
        profile: ['http://hl7.org/fhir/us/carin-bb/StructureDefinition/C4BB-ExplanationOfBenefit-Professional-NonClinician'],
      },
      status: statusMap[claim.status] || 'active',
      type: {
        coding: [{
          system: 'http://terminology.hl7.org/CodeSystem/claim-type',
          code: claim.type === 'professional' ? 'professional' : 'institutional',
        }],
      },
      use: 'claim',
      patient: {
        reference: `Patient/${claim.member_id || claim.memberId}`,
      },
      billablePeriod: {
        start: claim.service_from_date || claim.serviceFromDate,
        end: claim.service_to_date || claim.serviceToDate,
      },
      created: claim.received_date || claim.receivedDate,
      provider: {
        reference: `Practitioner/${claim.rendering_provider_id || claim.renderingProviderId}`,
        display: claim.rendering_provider_name || claim.renderingProviderName,
      },
      diagnosis: [
        {
          sequence: 1,
          diagnosisCodeableConcept: {
            coding: [{
              system: 'http://hl7.org/fhir/sid/icd-10-cm',
              code: claim.primary_diagnosis_code || claim.primaryDiagnosisCode,
              display: claim.primary_diagnosis_description || claim.primaryDiagnosisDescription,
            }],
          },
          type: [{
            coding: [{
              system: 'http://terminology.hl7.org/CodeSystem/ex-diagnosistype',
              code: 'principal',
            }],
          }],
        },
      ],
      total: [
        {
          category: { coding: [{ code: 'submitted' }] },
          amount: {
            value: parseFloat(claim.total_charged_amount || claim.totalChargedAmount || 0),
            currency: 'USD',
          },
        },
        {
          category: { coding: [{ code: 'benefit' }] },
          amount: {
            value: parseFloat(claim.total_paid_amount || claim.totalPaidAmount || 0),
            currency: 'USD',
          },
        },
      ],
      identifier: [{
        system: 'urn:apex-health:claim-number',
        value: claim.claim_number || claim.claimNumber,
      }],
    };
  }

  private toFhirPractitioner(provider: any): any {
    const address = typeof provider.address === 'string' ? JSON.parse(provider.address) : (provider.address || {});

    return {
      resourceType: 'Practitioner',
      id: provider.id,
      meta: {
        versionId: '1',
        lastUpdated: provider.updated_at || provider.updatedAt,
        profile: ['http://hl7.org/fhir/us/core/StructureDefinition/us-core-practitioner'],
      },
      identifier: [{
        system: 'http://hl7.org/fhir/sid/us-npi',
        value: provider.npi,
      }],
      active: provider.status === 'active',
      name: [{
        use: 'official',
        family: provider.last_name || provider.lastName,
        given: [provider.first_name || provider.firstName].filter(Boolean),
        suffix: provider.credentials ? [provider.credentials] : [],
      }],
      telecom: [
        provider.phone ? { system: 'phone', value: provider.phone, use: 'work' } : null,
        provider.fax ? { system: 'fax', value: provider.fax, use: 'work' } : null,
        provider.email ? { system: 'email', value: provider.email, use: 'work' } : null,
      ].filter(Boolean),
      address: address.line1
        ? [{
            use: 'work',
            line: [address.line1, address.line2].filter(Boolean),
            city: address.city,
            state: address.state,
            postalCode: address.zip,
          }]
        : [],
      qualification: (provider.board_certifications || provider.boardCertifications || []).map((cert: any) => ({
        code: {
          coding: [{
            system: 'http://terminology.hl7.org/CodeSystem/v2-0360',
            code: cert.board,
            display: cert.specialty,
          }],
        },
        period: {
          start: cert.certificationDate,
          end: cert.expirationDate,
        },
      })),
    };
  }

  private mapGender(gender: string): string {
    const map: Record<string, string> = {
      male: 'male',
      female: 'female',
      other: 'other',
      unknown: 'unknown',
    };
    return map[gender?.toLowerCase()] || 'unknown';
  }
}

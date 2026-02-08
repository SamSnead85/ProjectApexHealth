// ═══════════════════════════════════════════════════════
// Apex Health Platform - Eligibility API Service
// Eligibility verification, member lookup, enrollment
// EDI 270/271 compliant
// ═══════════════════════════════════════════════════════

import { apiClient } from './api-client';
import type {
  EligibilityInquiry,
  EligibilityResponse,
  EnrollmentEvent,
} from '../../packages/shared/src/types/eligibility';
import type {
  Member,
  MemberSearchParams,
  Member360View,
} from '../../packages/shared/src/types/member';
import type { PaginatedResponse } from '../../packages/shared/src/types/api';

const ELIGIBILITY_BASE = '/api/v1/eligibility';
const MEMBERS_BASE = '/api/v1/members';
const ENROLLMENT_BASE = '/api/v1/enrollment';

// ─── Eligibility API ────────────────────────────────────

export const eligibilityApi = {
  /**
   * Verify eligibility for a member / service (EDI 270 → 271).
   */
  async verifyEligibility(inquiry: Partial<EligibilityInquiry>): Promise<EligibilityResponse> {
    return apiClient.post<EligibilityResponse>(`${ELIGIBILITY_BASE}/verify`, inquiry);
  },

  /**
   * Get a cached eligibility response by inquiry ID.
   */
  async getEligibilityResponse(inquiryId: string): Promise<EligibilityResponse> {
    return apiClient.get<EligibilityResponse>(`${ELIGIBILITY_BASE}/${inquiryId}`);
  },

  // ── Members ───────────────────────────────────────

  /**
   * Search members with filtering, sorting, and pagination.
   */
  async searchMembers(params: MemberSearchParams): Promise<PaginatedResponse<Member>> {
    return apiClient.get<PaginatedResponse<Member>>(MEMBERS_BASE, params as Record<string, unknown>);
  },

  /**
   * Get a single member by ID.
   */
  async getMember(id: string): Promise<Member> {
    return apiClient.get<Member>(`${MEMBERS_BASE}/${id}`);
  },

  /**
   * Get the 360-degree view for a member (claims, auths, care team, alerts, etc.).
   */
  async getMember360(id: string): Promise<Member360View> {
    return apiClient.get<Member360View>(`${MEMBERS_BASE}/${id}/360`);
  },

  /**
   * Update member information.
   */
  async updateMember(id: string, data: Partial<Member>): Promise<Member> {
    return apiClient.patch<Member>(`${MEMBERS_BASE}/${id}`, data);
  },

  // ── Enrollment ────────────────────────────────────

  /**
   * Submit a new enrollment event.
   */
  async enrollMember(data: Partial<EnrollmentEvent>): Promise<EnrollmentEvent> {
    return apiClient.post<EnrollmentEvent>(ENROLLMENT_BASE, data);
  },

  /**
   * Get an enrollment event by ID.
   */
  async getEnrollmentEvent(id: string): Promise<EnrollmentEvent> {
    return apiClient.get<EnrollmentEvent>(`${ENROLLMENT_BASE}/${id}`);
  },

  /**
   * List recent enrollment events.
   */
  async listEnrollmentEvents(
    params?: Record<string, unknown>,
  ): Promise<PaginatedResponse<EnrollmentEvent>> {
    return apiClient.get<PaginatedResponse<EnrollmentEvent>>(ENROLLMENT_BASE, params);
  },
};

export default eligibilityApi;

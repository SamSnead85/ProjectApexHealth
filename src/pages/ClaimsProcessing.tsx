import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    FileText,
    Clock,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    DollarSign,
    User,
    Building2,
    Calendar,
    ChevronRight,
    Filter,
    Search,
    Eye,
    ArrowUpRight,
    ArrowDownRight,
    Zap,
    Shield,
    History,
    FileCheck,
    Scale,
    ChevronDown,
    ChevronUp,
    ExternalLink,
    Download
} from 'lucide-react'
import { GlassCard, Badge, Button, MetricCard } from '../components/common'
import './ClaimsProcessing.css'

// ============================================
// AUDIT-COMPLIANT TYPE DEFINITIONS
// CMS 42 CFR §422.504 / 45 CFR §164.530
// ============================================

// Claims status types based on EDI 835 claim status codes
type ClaimStatus = 'pending' | 'in_review' | 'approved' | 'denied' | 'partial' | 'suspended'

// Audit action types for complete traceability
type AuditAction =
    | 'RECEIVED'           // Claim received via EDI 837
    | 'VALIDATED'          // Data validation passed
    | 'ELIGIBILITY_CHECK'  // Member eligibility verified
    | 'BENEFIT_CHECK'      // Benefit coverage verified
    | 'ADJUDICATED_AUTO'   // Auto-adjudication complete
    | 'ADJUDICATED_MANUAL' // Manual review complete
    | 'PENDED'             // Claim pended for review
    | 'APPROVED'           // Claim approved for payment
    | 'DENIED'             // Claim denied
    | 'PARTIAL_APPROVED'   // Partial payment approved
    | 'EOB_GENERATED'      // Explanation of Benefits created
    | 'PAYMENT_ISSUED'     // Payment processed
    | 'APPEALED'           // Appeal filed
    | 'APPEAL_RESOLVED'    // Appeal decision made

// Policy reference for regulatory traceability
interface PolicyReference {
    policyId: string           // e.g., 'POL-MED-2024-001'
    policyName: string         // e.g., 'Medical Necessity Review'
    version: string            // e.g., '2.1'
    effectiveDate: string
    citation: string           // Specific section reference
    category: 'BENEFIT' | 'CLINICAL' | 'ADMINISTRATIVE' | 'REGULATORY'
}

// CARC/RARC code definitions for EDI 835 compliance
interface AdjustmentCode {
    code: string               // e.g., 'CO-45'
    type: 'CARC' | 'RARC'
    groupCode: 'CO' | 'PR' | 'PI' | 'OA' | 'CR'  // Contractual, Patient, Payer, Other, Corrected
    description: string
    amount: number
    policyReference?: PolicyReference
}

// Complete audit trail entry - per 42 CFR §422.504(a)(14)
interface AuditEntry {
    id: string
    timestamp: string          // ISO 8601 format
    userId: string
    userName: string
    userRole: 'SYSTEM' | 'ADJUDICATOR' | 'SUPERVISOR' | 'MEDICAL_DIRECTOR' | 'APPEALS_ANALYST'
    action: AuditAction
    previousStatus: ClaimStatus | null
    newStatus: ClaimStatus
    decisionRationale: string
    policyReferences: PolicyReference[]
    regulatoryBasis: string    // CMS regulation citation
    systemRules?: string[]     // Auto-adjudication rules that fired
    carcCode?: string          // Claim Adjustment Reason Code
    rarcCode?: string          // Remittance Advice Remark Code
    notes?: string
    attachmentIds?: string[]   // Supporting documentation
}

// Enhanced claim line item with adjustment details
interface ClaimLineItem {
    lineNumber: number
    procedureCode: string      // CPT/HCPCS code
    modifiers?: string[]       // Procedure modifiers
    description: string
    serviceDate: string
    placeOfService: string     // POS code
    units: number
    billedAmount: number
    allowedAmount: number
    paidAmount: number
    patientResponsibility: number
    adjustments: AdjustmentCode[]
    adjudicationNotes?: string
}

// Comprehensive auditable claim structure
interface Claim {
    id: string
    transactionId: string      // EDI 837 reference
    controlNumber: string      // ICN - Internal Control Number

    // Member information
    memberId: string
    memberName: string
    memberDOB: string
    groupNumber: string

    // Provider information
    providerId: string         // NPI
    providerName: string
    providerTaxId: string
    facilityName?: string

    // Claim details
    serviceDate: string
    serviceDateEnd?: string
    receivedDate: string
    processedDate?: string
    claimType: 'professional' | 'institutional' // EDI 837P vs 837I
    formType: 'CMS-1500' | 'UB-04'
    status: ClaimStatus

    // Diagnosis codes (ICD-10)
    diagnosisCodes: { code: string; description: string; isPrimary: boolean }[]

    // Financial summary
    billedAmount: number
    allowedAmount: number
    paidAmount: number
    patientResponsibility: number
    coinsurance: number
    copay: number
    deductible: number

    // Line items
    lineItems: ClaimLineItem[]

    // Benefit plan reference
    benefitPlanId: string
    benefitPlanName: string
    networkStatus: 'IN_NETWORK' | 'OUT_OF_NETWORK' | 'PARTIAL'

    // Adjudication details
    adjudicationMethod: 'AUTO' | 'MANUAL' | 'HYBRID'
    adjudicationRules?: string[]
    autoAdjudicated: boolean

    // Prior authorization
    priorAuth?: {
        required: boolean
        authNumber?: string
        status: 'APPROVED' | 'DENIED' | 'NOT_REQUIRED' | 'PENDING'
        approvedUnits?: number
        expirationDate?: string
    }

    // Medical necessity (for clinical denials)
    medicalNecessityReview?: {
        required: boolean
        outcome?: 'APPROVED' | 'DENIED' | 'PENDING'
        reviewerId?: string
        reviewerName?: string
        reviewDate?: string
        clinicalRationale?: string
        clinicalGuideline?: string
    }

    // Flags and alerts
    flaggedReasons?: string[]

    // Complete audit trail - 45 CFR §164.530(j) requires 6-year retention
    auditTrail: AuditEntry[]

    // Timely filing compliance
    timelyFilingDeadline: string
    daysToProcess: number

    // Appeal tracking
    appealHistory?: {
        appealNumber: string
        filedDate: string
        level: 'FIRST_LEVEL' | 'SECOND_LEVEL' | 'EXTERNAL' | 'ALJ'
        status: 'PENDING' | 'UPHELD' | 'OVERTURNED' | 'PARTIAL'
        resolution?: string
        resolvedDate?: string
    }[]

    // EOB reference
    eobNumber?: string
    eobGeneratedDate?: string
}

// Common CARC codes used in healthcare claims
const CARC_CODES: Record<string, { description: string; groupCode: 'CO' | 'PR' | 'PI' | 'OA' }> = {
    '1': { description: 'Deductible amount', groupCode: 'PR' },
    '2': { description: 'Coinsurance amount', groupCode: 'PR' },
    '3': { description: 'Co-payment amount', groupCode: 'PR' },
    '4': { description: 'The procedure code is inconsistent with the modifier used', groupCode: 'CO' },
    '16': { description: 'Claim/service lacks information needed for adjudication', groupCode: 'CO' },
    '18': { description: 'Duplicate claim/service', groupCode: 'CO' },
    '22': { description: 'This care may be covered by another payer', groupCode: 'OA' },
    '27': { description: 'Expenses incurred after coverage terminated', groupCode: 'CO' },
    '29': { description: 'The time limit for filing has expired', groupCode: 'CO' },
    '45': { description: 'Charge exceeds fee schedule/maximum allowable', groupCode: 'CO' },
    '50': { description: 'Non-covered service', groupCode: 'CO' },
    '96': { description: 'Non-covered charge(s)', groupCode: 'CO' },
    '97': { description: 'The benefit for this service is included in the payment/allowance for another service', groupCode: 'CO' },
    '151': { description: 'Payment adjusted - payer deems service excessive', groupCode: 'CO' },
    '197': { description: 'Precertification/authorization/notification absent', groupCode: 'CO' },
    '204': { description: 'Service not covered under patient benefit plan', groupCode: 'CO' },
    '242': { description: 'Services not provided by network/primary care providers', groupCode: 'CO' },
}

// Mock claims data with full audit compliance
const mockClaims: Claim[] = [
    {
        id: 'CLM-2024-00145',
        transactionId: 'TRN-837P-2024012601',
        controlNumber: 'ICN-2024-0145-001',
        memberId: 'APX-2024-78432',
        memberName: 'Sarah Johnson',
        memberDOB: '1985-03-15',
        groupNumber: 'GRP-ENT-5000',
        providerId: 'NPI-1234567890',
        providerName: 'Premier Medical Associates',
        providerTaxId: '12-3456789',
        serviceDate: '2024-01-15',
        receivedDate: '2024-01-20',
        processedDate: '2024-01-20',
        claimType: 'professional',
        formType: 'CMS-1500',
        status: 'approved',
        diagnosisCodes: [
            { code: 'Z00.00', description: 'Encounter for general adult medical examination without abnormal findings', isPrimary: true },
            { code: 'E11.9', description: 'Type 2 diabetes mellitus without complications', isPrimary: false }
        ],
        billedAmount: 450.00,
        allowedAmount: 320.00,
        paidAmount: 256.00,
        patientResponsibility: 64.00,
        coinsurance: 64.00,
        copay: 0,
        deductible: 0,
        benefitPlanId: 'BEN-PPO-GOLD-2024',
        benefitPlanName: 'PPO Gold Plan',
        networkStatus: 'IN_NETWORK',
        adjudicationMethod: 'AUTO',
        adjudicationRules: [
            'RULE-CPT-99213-COVERED: Office visit covered under preventive benefits',
            'RULE-CPT-36415-COVERED: Lab services covered at 100%',
            'RULE-CPT-80053-COVERED: Metabolic panel covered under lab benefits',
            'RULE-PROVIDER-INNETWORK: Provider in-network, standard fee schedule applies',
            'RULE-NO-PA-REQUIRED: No prior auth required for office visit/lab'
        ],
        autoAdjudicated: true,
        timelyFilingDeadline: '2025-01-15',
        daysToProcess: 0,
        eobNumber: 'EOB-2024-00145-A',
        eobGeneratedDate: '2024-01-20',
        lineItems: [
            {
                lineNumber: 1,
                procedureCode: '99213',
                modifiers: ['25'],
                description: 'Office visit, established patient, low-moderate complexity',
                serviceDate: '2024-01-15',
                placeOfService: '11',
                units: 1,
                billedAmount: 150.00,
                allowedAmount: 120.00,
                paidAmount: 96.00,
                patientResponsibility: 24.00,
                adjustments: [
                    { code: '45', type: 'CARC', groupCode: 'CO', description: 'Charge exceeds fee schedule/maximum allowable', amount: 30.00 },
                    { code: '2', type: 'CARC', groupCode: 'PR', description: 'Coinsurance amount', amount: 24.00 }
                ],
                adjudicationNotes: 'Processed per PPO Gold fee schedule. 20% coinsurance applied.'
            },
            {
                lineNumber: 2,
                procedureCode: '36415',
                description: 'Venipuncture for blood draw',
                serviceDate: '2024-01-15',
                placeOfService: '11',
                units: 1,
                billedAmount: 25.00,
                allowedAmount: 18.00,
                paidAmount: 18.00,
                patientResponsibility: 0.00,
                adjustments: [
                    { code: '45', type: 'CARC', groupCode: 'CO', description: 'Charge exceeds fee schedule/maximum allowable', amount: 7.00 }
                ],
                adjudicationNotes: 'Lab draw covered at 100% per preventive benefits.'
            },
            {
                lineNumber: 3,
                procedureCode: '80053',
                description: 'Comprehensive metabolic panel',
                serviceDate: '2024-01-15',
                placeOfService: '11',
                units: 1,
                billedAmount: 275.00,
                allowedAmount: 182.00,
                paidAmount: 142.00,
                patientResponsibility: 40.00,
                adjustments: [
                    { code: '45', type: 'CARC', groupCode: 'CO', description: 'Charge exceeds fee schedule/maximum allowable', amount: 93.00 },
                    { code: '2', type: 'CARC', groupCode: 'PR', description: 'Coinsurance amount', amount: 40.00 }
                ],
                adjudicationNotes: 'Lab panel covered. 20% coinsurance applied per plan terms.'
            }
        ],
        auditTrail: [
            {
                id: 'AUD-145-001',
                timestamp: '2024-01-20T09:15:32Z',
                userId: 'SYS-EDI-GW',
                userName: 'EDI Gateway System',
                userRole: 'SYSTEM',
                action: 'RECEIVED',
                previousStatus: null,
                newStatus: 'pending',
                decisionRationale: 'Claim received via EDI 837P transmission from Premier Medical Associates. Transaction validated against X12 5010 standards.',
                policyReferences: [
                    { policyId: 'POL-EDI-001', policyName: 'EDI Transaction Standards', version: '5010', effectiveDate: '2024-01-01', citation: 'Section 3.1 - 837P Professional Claim Format', category: 'REGULATORY' }
                ],
                regulatoryBasis: '45 CFR §162.1102 - Standards for health care claims transactions',
                systemRules: ['EDI-VALIDATE-X12-5010', 'EDI-PARSE-837P-LOOPS']
            },
            {
                id: 'AUD-145-002',
                timestamp: '2024-01-20T09:15:45Z',
                userId: 'SYS-ADJUD',
                userName: 'Auto-Adjudication Engine',
                userRole: 'SYSTEM',
                action: 'VALIDATED',
                previousStatus: 'pending',
                newStatus: 'pending',
                decisionRationale: 'Claim passed all validation checks: NPI-1234567890 verified active in NPPES, member APX-2024-78432 eligible on date of service, provider contracted with network.',
                policyReferences: [
                    { policyId: 'POL-VAL-001', policyName: 'Claim Validation Requirements', version: '3.0', effectiveDate: '2024-01-01', citation: 'Section 2.1 - Required Data Elements', category: 'ADMINISTRATIVE' }
                ],
                regulatoryBasis: '42 CFR §422.504(a)(14) - Maintenance of records',
                systemRules: ['VAL-NPI-ACTIVE', 'VAL-MEMBER-ELIG-DOS', 'VAL-PROVIDER-CONTRACT', 'VAL-TIMELY-FILING']
            },
            {
                id: 'AUD-145-003',
                timestamp: '2024-01-20T09:15:48Z',
                userId: 'SYS-ADJUD',
                userName: 'Auto-Adjudication Engine',
                userRole: 'SYSTEM',
                action: 'ELIGIBILITY_CHECK',
                previousStatus: 'pending',
                newStatus: 'pending',
                decisionRationale: 'Member eligibility confirmed: Sarah Johnson (APX-2024-78432) active under PPO Gold Plan (GRP-ENT-5000) from 01/01/2024. Deductible met, coinsurance 20% applies.',
                policyReferences: [
                    { policyId: 'BEN-PPO-GOLD-2024', policyName: 'PPO Gold Benefit Schedule', version: '2024.1', effectiveDate: '2024-01-01', citation: 'Section 1.2 - Eligibility and Enrollment', category: 'BENEFIT' }
                ],
                regulatoryBasis: '42 CFR §422.111 - Disclosure requirements',
                systemRules: ['ELIG-ACTIVE-DOS', 'ELIG-PLAN-VERIFY', 'ELIG-COST-SHARE-CALC']
            },
            {
                id: 'AUD-145-004',
                timestamp: '2024-01-20T09:15:52Z',
                userId: 'SYS-ADJUD',
                userName: 'Auto-Adjudication Engine',
                userRole: 'SYSTEM',
                action: 'BENEFIT_CHECK',
                previousStatus: 'pending',
                newStatus: 'pending',
                decisionRationale: 'Benefit coverage verified: CPT 99213 (Office visit) covered under Physician Services, CPT 36415 & 80053 covered under Laboratory Services at in-network rates. No prior authorization required.',
                policyReferences: [
                    { policyId: 'BEN-PPO-GOLD-2024', policyName: 'PPO Gold Benefit Schedule', version: '2024.1', effectiveDate: '2024-01-01', citation: 'Section 4.3 - Physician Services; Section 4.8 - Laboratory Services', category: 'BENEFIT' },
                    { policyId: 'POL-PA-001', policyName: 'Prior Authorization Requirements', version: '2024.1', effectiveDate: '2024-01-01', citation: 'Appendix A - Services Requiring PA', category: 'CLINICAL' }
                ],
                regulatoryBasis: '42 CFR §422.562 - General provisions on benefits',
                systemRules: ['BEN-CPT-99213-PHYS-SVC', 'BEN-CPT-36415-LAB', 'BEN-CPT-80053-LAB', 'PA-NOT-REQUIRED']
            },
            {
                id: 'AUD-145-005',
                timestamp: '2024-01-20T09:16:02Z',
                userId: 'SYS-ADJUD',
                userName: 'Auto-Adjudication Engine',
                userRole: 'SYSTEM',
                action: 'ADJUDICATED_AUTO',
                previousStatus: 'pending',
                newStatus: 'approved',
                decisionRationale: 'Claim auto-adjudicated for payment: Total billed $450.00, Allowed $320.00, Plan pays $256.00 (80%), Member responsibility $64.00 (20% coinsurance). All services covered under PPO Gold Plan, provider in-network, no clinical edits triggered.',
                policyReferences: [
                    { policyId: 'BEN-PPO-GOLD-2024', policyName: 'PPO Gold Benefit Schedule', version: '2024.1', effectiveDate: '2024-01-01', citation: 'Section 2.1 - Cost Sharing Summary', category: 'BENEFIT' },
                    { policyId: 'POL-FEE-SCHED-2024', policyName: 'Provider Fee Schedule', version: '2024.Q1', effectiveDate: '2024-01-01', citation: 'In-Network Professional Services', category: 'ADMINISTRATIVE' }
                ],
                regulatoryBasis: '42 CFR §422.568 - Standards for making determination',
                systemRules: ['ADJUD-CALC-ALLOWED', 'ADJUD-APPLY-COINSURANCE', 'ADJUD-NO-CLINICAL-EDIT', 'ADJUD-APPROVE-PAYMENT'],
                carcCode: '45',
                notes: 'Clean claim processed within 24 hours per prompt pay requirements'
            },
            {
                id: 'AUD-145-006',
                timestamp: '2024-01-20T09:16:05Z',
                userId: 'SYS-EOB',
                userName: 'EOB Generation System',
                userRole: 'SYSTEM',
                action: 'EOB_GENERATED',
                previousStatus: 'approved',
                newStatus: 'approved',
                decisionRationale: 'Explanation of Benefits (EOB-2024-00145-A) generated and queued for member delivery via mail and member portal. EOB includes: services rendered, amounts billed/allowed/paid, member responsibility, appeal rights, and contact information.',
                policyReferences: [
                    { policyId: 'POL-EOB-001', policyName: 'EOB Generation Standards', version: '2.0', effectiveDate: '2024-01-01', citation: 'Section 3 - Required EOB Elements', category: 'REGULATORY' }
                ],
                regulatoryBasis: '42 CFR §422.568(d) - Written notification to enrollee',
                systemRules: ['EOB-GENERATE', 'EOB-QUEUE-MAIL', 'EOB-PUBLISH-PORTAL']
            }
        ]
    },
    {
        id: 'CLM-2024-00146',
        transactionId: 'TRN-837I-2024012602',
        controlNumber: 'ICN-2024-0146-001',
        memberId: 'APX-2024-45123',
        memberName: 'Michael Chen',
        memberDOB: '1972-08-22',
        groupNumber: 'GRP-ENT-5000',
        providerId: 'NPI-9876543210',
        providerName: 'City General Hospital',
        providerTaxId: '98-7654321',
        facilityName: 'City General Hospital - Main Campus',
        serviceDate: '2024-01-18',
        serviceDateEnd: '2024-01-20',
        receivedDate: '2024-01-22',
        claimType: 'institutional',
        formType: 'UB-04',
        status: 'in_review',
        diagnosisCodes: [
            { code: 'I21.3', description: 'ST elevation myocardial infarction of unspecified site', isPrimary: true },
            { code: 'I10', description: 'Essential hypertension', isPrimary: false },
            { code: 'E78.5', description: 'Hyperlipidemia, unspecified', isPrimary: false }
        ],
        billedAmount: 12500.00,
        allowedAmount: 0,
        paidAmount: 0,
        patientResponsibility: 0,
        coinsurance: 0,
        copay: 0,
        deductible: 0,
        benefitPlanId: 'BEN-PPO-GOLD-2024',
        benefitPlanName: 'PPO Gold Plan',
        networkStatus: 'IN_NETWORK',
        adjudicationMethod: 'MANUAL',
        autoAdjudicated: false,
        flaggedReasons: [
            'THRESHOLD: Amount exceeds auto-adjudication threshold ($5,000)',
            'FACILITY: Institutional claim requires clinical review',
            'DX-REVIEW: Primary diagnosis I21.3 (STEMI) flagged for medical necessity review'
        ],
        timelyFilingDeadline: '2025-01-18',
        daysToProcess: 8,
        medicalNecessityReview: {
            required: true,
            outcome: 'PENDING',
            clinicalGuideline: 'ACC/AHA Guidelines for Management of STEMI'
        },
        lineItems: [
            {
                lineNumber: 1,
                procedureCode: '99223',
                description: 'Initial hospital care, high complexity',
                serviceDate: '2024-01-18',
                placeOfService: '21',
                units: 1,
                billedAmount: 850.00,
                allowedAmount: 0,
                paidAmount: 0,
                patientResponsibility: 0,
                adjustments: []
            },
            {
                lineNumber: 2,
                procedureCode: '36556',
                description: 'Insertion of central venous catheter',
                serviceDate: '2024-01-18',
                placeOfService: '21',
                units: 1,
                billedAmount: 2400.00,
                allowedAmount: 0,
                paidAmount: 0,
                patientResponsibility: 0,
                adjustments: []
            }
        ],
        auditTrail: [
            {
                id: 'AUD-146-001',
                timestamp: '2024-01-22T14:32:18Z',
                userId: 'SYS-EDI-GW',
                userName: 'EDI Gateway System',
                userRole: 'SYSTEM',
                action: 'RECEIVED',
                previousStatus: null,
                newStatus: 'pending',
                decisionRationale: 'Claim received via EDI 837I transmission from City General Hospital. Institutional claim format validated.',
                policyReferences: [
                    { policyId: 'POL-EDI-001', policyName: 'EDI Transaction Standards', version: '5010', effectiveDate: '2024-01-01', citation: 'Section 3.2 - 837I Institutional Claim Format', category: 'REGULATORY' }
                ],
                regulatoryBasis: '45 CFR §162.1102 - Standards for health care claims transactions',
                systemRules: ['EDI-VALIDATE-X12-5010', 'EDI-PARSE-837I-LOOPS']
            },
            {
                id: 'AUD-146-002',
                timestamp: '2024-01-22T14:32:45Z',
                userId: 'SYS-ADJUD',
                userName: 'Auto-Adjudication Engine',
                userRole: 'SYSTEM',
                action: 'PENDED',
                previousStatus: 'pending',
                newStatus: 'in_review',
                decisionRationale: 'Claim pended for manual review: (1) Billed amount $12,500 exceeds auto-adjudication threshold of $5,000, (2) Institutional claim type requires clinical review per policy, (3) Primary diagnosis STEMI (I21.3) triggers medical necessity review.',
                policyReferences: [
                    { policyId: 'POL-ADJUD-001', policyName: 'Auto-Adjudication Thresholds', version: '2024.1', effectiveDate: '2024-01-01', citation: 'Section 2.3 - Dollar Thresholds', category: 'ADMINISTRATIVE' },
                    { policyId: 'POL-CLIN-001', policyName: 'Clinical Review Criteria', version: '2024.1', effectiveDate: '2024-01-01', citation: 'Section 4.1 - Inpatient Admissions', category: 'CLINICAL' }
                ],
                regulatoryBasis: '42 CFR §422.566 - Organization determinations',
                systemRules: ['PEND-THRESHOLD-EXCEEDED', 'PEND-INSTITUTIONAL-REVIEW', 'PEND-DX-CLINICAL-REVIEW']
            }
        ]
    },
    {
        id: 'CLM-2024-00147',
        transactionId: 'TRN-837P-2024012603',
        controlNumber: 'ICN-2024-0147-001',
        memberId: 'APX-2024-33456',
        memberName: 'Emily Rodriguez',
        memberDOB: '2019-06-10',
        groupNumber: 'GRP-SMB-2000',
        providerId: 'NPI-5555555555',
        providerName: 'Sunshine Pediatrics',
        providerTaxId: '55-5555555',
        serviceDate: '2024-01-19',
        receivedDate: '2024-01-21',
        processedDate: '2024-01-21',
        claimType: 'professional',
        formType: 'CMS-1500',
        status: 'denied',
        diagnosisCodes: [
            { code: 'Z23', description: 'Encounter for immunization', isPrimary: true }
        ],
        billedAmount: 275.00,
        allowedAmount: 0,
        paidAmount: 0,
        patientResponsibility: 275.00,
        coinsurance: 0,
        copay: 0,
        deductible: 0,
        benefitPlanId: 'BEN-HSA-BASIC-2024',
        benefitPlanName: 'HSA Basic Plan',
        networkStatus: 'IN_NETWORK',
        adjudicationMethod: 'AUTO',
        adjudicationRules: [
            'RULE-CPT-90460-NOT-COVERED: Vaccine administration not covered under HSA Basic Plan',
            'RULE-DENIAL-CO-96: Apply CARC 96 - Non-covered charge'
        ],
        autoAdjudicated: true,
        flaggedReasons: [
            'DENIAL: Service not covered under member benefit plan',
            'CARC-96: Non-covered charge per plan exclusions'
        ],
        timelyFilingDeadline: '2025-01-19',
        daysToProcess: 0,
        eobNumber: 'EOB-2024-00147-D',
        eobGeneratedDate: '2024-01-21',
        lineItems: [
            {
                lineNumber: 1,
                procedureCode: '90460',
                description: 'Immunization administration first component',
                serviceDate: '2024-01-19',
                placeOfService: '11',
                units: 1,
                billedAmount: 75.00,
                allowedAmount: 0,
                paidAmount: 0,
                patientResponsibility: 75.00,
                adjustments: [
                    {
                        code: '96',
                        type: 'CARC',
                        groupCode: 'CO',
                        description: 'Non-covered charge(s)',
                        amount: 75.00,
                        policyReference: {
                            policyId: 'BEN-HSA-BASIC-2024',
                            policyName: 'HSA Basic Plan',
                            version: '2024.1',
                            effectiveDate: '2024-01-01',
                            citation: 'Section 5.2 - Plan Exclusions: Immunizations',
                            category: 'BENEFIT'
                        }
                    }
                ],
                adjudicationNotes: 'Service denied: Immunization administration not covered under HSA Basic Plan. Member may appeal per 42 CFR §422.566.'
            }
        ],
        auditTrail: [
            {
                id: 'AUD-147-001',
                timestamp: '2024-01-21T10:22:15Z',
                userId: 'SYS-EDI-GW',
                userName: 'EDI Gateway System',
                userRole: 'SYSTEM',
                action: 'RECEIVED',
                previousStatus: null,
                newStatus: 'pending',
                decisionRationale: 'Claim received via EDI 837P transmission from Sunshine Pediatrics.',
                policyReferences: [],
                regulatoryBasis: '45 CFR §162.1102 - Standards for health care claims transactions',
                systemRules: ['EDI-VALIDATE-X12-5010', 'EDI-PARSE-837P-LOOPS']
            },
            {
                id: 'AUD-147-002',
                timestamp: '2024-01-21T10:22:28Z',
                userId: 'SYS-ADJUD',
                userName: 'Auto-Adjudication Engine',
                userRole: 'SYSTEM',
                action: 'BENEFIT_CHECK',
                previousStatus: 'pending',
                newStatus: 'pending',
                decisionRationale: 'Benefit coverage check: CPT 90460 (Immunization administration) reviewed against HSA Basic Plan. Service found in Plan Exclusions list per Section 5.2.',
                policyReferences: [
                    { policyId: 'BEN-HSA-BASIC-2024', policyName: 'HSA Basic Plan', version: '2024.1', effectiveDate: '2024-01-01', citation: 'Section 5.2 - Plan Exclusions', category: 'BENEFIT' }
                ],
                regulatoryBasis: '42 CFR §422.562 - General provisions on benefits',
                systemRules: ['BEN-CPT-90460-EXCLUSION-CHECK', 'BEN-EXCLUSION-FOUND']
            },
            {
                id: 'AUD-147-003',
                timestamp: '2024-01-21T10:22:35Z',
                userId: 'SYS-ADJUD',
                userName: 'Auto-Adjudication Engine',
                userRole: 'SYSTEM',
                action: 'DENIED',
                previousStatus: 'pending',
                newStatus: 'denied',
                decisionRationale: 'Claim denied: Service CPT 90460 is explicitly excluded from coverage under the HSA Basic Plan (Section 5.2 - Plan Exclusions: Immunizations). Full amount $75.00 is member responsibility. Member has right to appeal this decision within 60 days.',
                policyReferences: [
                    { policyId: 'BEN-HSA-BASIC-2024', policyName: 'HSA Basic Plan', version: '2024.1', effectiveDate: '2024-01-01', citation: 'Section 5.2 - Plan Exclusions: Immunizations', category: 'BENEFIT' },
                    { policyId: 'POL-APPEAL-001', policyName: 'Member Appeal Rights', version: '2024.1', effectiveDate: '2024-01-01', citation: 'Section 2 - Timeframes for Filing Appeals', category: 'REGULATORY' }
                ],
                regulatoryBasis: '42 CFR §422.568 - Standard for making determinations; 42 CFR §422.566 - Organization determinations',
                systemRules: ['ADJUD-DENY-EXCLUSION', 'ADJUD-APPLY-CO-96'],
                carcCode: '96',
                notes: 'Standard denial for excluded service. EOB includes appeal rights per regulatory requirements.'
            },
            {
                id: 'AUD-147-004',
                timestamp: '2024-01-21T10:22:38Z',
                userId: 'SYS-EOB',
                userName: 'EOB Generation System',
                userRole: 'SYSTEM',
                action: 'EOB_GENERATED',
                previousStatus: 'denied',
                newStatus: 'denied',
                decisionRationale: 'Denial EOB (EOB-2024-00147-D) generated with required elements: denial reason (CARC 96), policy citation (HSA Basic Plan Section 5.2), appeal rights (60 days to file first-level appeal), and contact information for appeals.',
                policyReferences: [],
                regulatoryBasis: '42 CFR §422.568(d) - Content of written notification for denials',
                systemRules: ['EOB-GENERATE-DENIAL', 'EOB-INCLUDE-APPEAL-RIGHTS']
            }
        ]
    },
    {
        id: 'CLM-2024-00148',
        transactionId: 'TRN-837P-2024012604',
        controlNumber: 'ICN-2024-0148-001',
        memberId: 'APX-2024-78432',
        memberName: 'Sarah Johnson',
        memberDOB: '1985-03-15',
        groupNumber: 'GRP-ENT-5000',
        providerId: 'NPI-7777777777',
        providerName: 'Valley Imaging Center',
        providerTaxId: '77-7777777',
        serviceDate: '2024-01-22',
        receivedDate: '2024-01-24',
        claimType: 'professional',
        formType: 'CMS-1500',
        status: 'pending',
        diagnosisCodes: [
            { code: 'M54.5', description: 'Low back pain', isPrimary: true },
            { code: 'M51.16', description: 'Intervertebral disc degeneration, lumbar region', isPrimary: false }
        ],
        billedAmount: 1850.00,
        allowedAmount: 0,
        paidAmount: 0,
        patientResponsibility: 0,
        coinsurance: 0,
        copay: 0,
        deductible: 0,
        benefitPlanId: 'BEN-PPO-GOLD-2024',
        benefitPlanName: 'PPO Gold Plan',
        networkStatus: 'IN_NETWORK',
        adjudicationMethod: 'MANUAL',
        autoAdjudicated: false,
        flaggedReasons: [
            'PA-REQUIRED: Prior authorization required for MRI (CPT 72148)',
            'PA-PENDING: Authorization verification in progress'
        ],
        priorAuth: {
            required: true,
            status: 'PENDING',
            approvedUnits: 1
        },
        timelyFilingDeadline: '2025-01-22',
        daysToProcess: 6,
        lineItems: [
            {
                lineNumber: 1,
                procedureCode: '72148',
                description: 'MRI lumbar spine without contrast',
                serviceDate: '2024-01-22',
                placeOfService: '22',
                units: 1,
                billedAmount: 1850.00,
                allowedAmount: 0,
                paidAmount: 0,
                patientResponsibility: 0,
                adjustments: [],
                adjudicationNotes: 'Pending prior authorization verification. Service requires PA per PPO Gold Plan guidelines.'
            }
        ],
        auditTrail: [
            {
                id: 'AUD-148-001',
                timestamp: '2024-01-24T11:45:22Z',
                userId: 'SYS-EDI-GW',
                userName: 'EDI Gateway System',
                userRole: 'SYSTEM',
                action: 'RECEIVED',
                previousStatus: null,
                newStatus: 'pending',
                decisionRationale: 'Claim received via EDI 837P transmission from Valley Imaging Center.',
                policyReferences: [],
                regulatoryBasis: '45 CFR §162.1102 - Standards for health care claims transactions',
                systemRules: ['EDI-VALIDATE-X12-5010', 'EDI-PARSE-837P-LOOPS']
            },
            {
                id: 'AUD-148-002',
                timestamp: '2024-01-24T11:45:38Z',
                userId: 'SYS-ADJUD',
                userName: 'Auto-Adjudication Engine',
                userRole: 'SYSTEM',
                action: 'PENDED',
                previousStatus: 'pending',
                newStatus: 'pending',
                decisionRationale: 'Claim pended for prior authorization verification: CPT 72148 (MRI lumbar spine) requires prior authorization per PPO Gold Plan clinical guidelines. Auth verification workflow initiated.',
                policyReferences: [
                    { policyId: 'POL-PA-001', policyName: 'Prior Authorization Requirements', version: '2024.1', effectiveDate: '2024-01-01', citation: 'Appendix A - Services Requiring PA: Diagnostic Imaging', category: 'CLINICAL' },
                    { policyId: 'BEN-PPO-GOLD-2024', policyName: 'PPO Gold Benefit Schedule', version: '2024.1', effectiveDate: '2024-01-01', citation: 'Section 4.7 - Radiology and Imaging', category: 'BENEFIT' }
                ],
                regulatoryBasis: '42 CFR §422.566 - Organization determinations',
                systemRules: ['PA-CHECK-REQUIRED', 'PA-VERIFY-AUTH', 'PEND-PA-VERIFICATION']
            }
        ]
    }
]

// Claims metrics
const claimsMetrics = {
    totalReceived: 2847,
    autoAdjudicated: { count: 2156, rate: 75.7 },
    pendingReview: 428,
    avgProcessingDays: 2.3,
    denialRate: 5.4
}

export function ClaimsProcessing() {
    const [claims] = useState<Claim[]>(mockClaims)
    const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null)
    const [statusFilter, setStatusFilter] = useState<ClaimStatus | 'all'>('all')
    const [searchQuery, setSearchQuery] = useState('')

    const filteredClaims = claims.filter(claim => {
        const matchesStatus = statusFilter === 'all' || claim.status === statusFilter
        const matchesSearch = !searchQuery ||
            claim.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            claim.memberName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            claim.providerName.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesStatus && matchesSearch
    })

    const getStatusBadge = (status: ClaimStatus) => {
        const configs: Record<ClaimStatus, { variant: 'success' | 'warning' | 'critical' | 'info' | 'teal'; label: string }> = {
            pending: { variant: 'warning', label: 'Pending' },
            in_review: { variant: 'info', label: 'In Review' },
            approved: { variant: 'success', label: 'Approved' },
            denied: { variant: 'critical', label: 'Denied' },
            partial: { variant: 'teal', label: 'Partial' },
            suspended: { variant: 'warning', label: 'Suspended' }
        }
        const config = configs[status]
        return <Badge variant={config.variant}>{config.label}</Badge>
    }

    const formatCurrency = (amount: number) => `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`

    return (
        <div className="claims-processing">
            {/* Header */}
            <div className="claims-processing__header">
                <div>
                    <h1 className="claims-processing__title">Claims Processing</h1>
                    <p className="claims-processing__subtitle">
                        EDI 837/835 claims lifecycle management with auto-adjudication
                    </p>
                </div>
                <div className="claims-processing__header-badges">
                    <Badge variant="info" size="sm" icon={<FileText size={12} />}>
                        EDI 837P/I
                    </Badge>
                    <Badge variant="teal" size="sm" icon={<Zap size={12} />}>
                        Auto-Adjudication Active
                    </Badge>
                </div>
            </div>

            {/* Metrics */}
            <div className="claims-processing__metrics">
                <MetricCard
                    title="Total Claims"
                    value={claimsMetrics.totalReceived.toLocaleString()}
                    icon={<FileText size={20} />}
                    trend={{ value: 12.5, direction: 'up' }}
                    subtitle="This month"
                />
                <MetricCard
                    title="Auto-Adjudicated"
                    value={`${claimsMetrics.autoAdjudicated.rate}%`}
                    icon={<Zap size={20} />}
                    trend={{ value: 8.2, direction: 'up' }}
                    subtitle={`${claimsMetrics.autoAdjudicated.count} claims`}
                    variant="success"
                />
                <MetricCard
                    title="Pending Review"
                    value={claimsMetrics.pendingReview.toString()}
                    icon={<Clock size={20} />}
                    trend={{ value: 3.1, direction: 'down' }}
                    subtitle="In queue"
                    variant="warning"
                />
                <MetricCard
                    title="Avg Processing"
                    value={`${claimsMetrics.avgProcessingDays} days`}
                    icon={<ArrowUpRight size={20} />}
                    trend={{ value: 0.4, direction: 'down' }}
                    subtitle="Time to decision"
                    variant="teal"
                />
            </div>

            {/* Main Grid */}
            <div className="claims-processing__grid">
                {/* Claims List */}
                <section className="claims-processing__list-section">
                    {/* Filters */}
                    <div className="claims-processing__filters">
                        <div className="claims-processing__search-wrapper">
                            <Search size={16} />
                            <input
                                type="text"
                                placeholder="Search by claim ID, member, or provider..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="claims-processing__status-filters">
                            {(['all', 'pending', 'in_review', 'approved', 'denied'] as const).map((status) => (
                                <button
                                    key={status}
                                    className={`claims-processing__filter-btn ${statusFilter === status ? 'active' : ''}`}
                                    onClick={() => setStatusFilter(status)}
                                >
                                    {status === 'all' ? 'All' : status.replace('_', ' ')}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Claims Table */}
                    <GlassCard className="claims-processing__table-card">
                        <table className="claims-processing__table">
                            <thead>
                                <tr>
                                    <th>Claim ID</th>
                                    <th>Member</th>
                                    <th>Provider</th>
                                    <th>Service Date</th>
                                    <th>Billed</th>
                                    <th>Status</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredClaims.map((claim, index) => (
                                    <motion.tr
                                        key={claim.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className={selectedClaim?.id === claim.id ? 'selected' : ''}
                                        onClick={() => setSelectedClaim(claim)}
                                    >
                                        <td>
                                            <div className="claims-processing__claim-id">
                                                <span>{claim.id}</span>
                                                <span className="claims-processing__claim-type">
                                                    {claim.claimType === 'professional' ? '837P' : '837I'}
                                                </span>
                                            </div>
                                        </td>
                                        <td>{claim.memberName}</td>
                                        <td>{claim.providerName}</td>
                                        <td>{new Date(claim.serviceDate).toLocaleDateString()}</td>
                                        <td className="claims-processing__amount">{formatCurrency(claim.billedAmount)}</td>
                                        <td>
                                            <div className="claims-processing__status-cell">
                                                {getStatusBadge(claim.status)}
                                                {claim.autoAdjudicated && (
                                                    <Zap size={12} className="claims-processing__auto-icon" />
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            <ChevronRight size={16} className="claims-processing__chevron" />
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </GlassCard>
                </section>

                {/* Claim Detail */}
                <AnimatePresence mode="wait">
                    {selectedClaim ? (
                        <motion.section
                            key={selectedClaim.id}
                            className="claims-processing__detail"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <GlassCard className="claims-processing__detail-card">
                                <div className="claims-processing__detail-header">
                                    <div>
                                        <h2>{selectedClaim.id}</h2>
                                        <span className="claims-processing__transaction-id">
                                            Transaction: {selectedClaim.transactionId}
                                        </span>
                                    </div>
                                    {getStatusBadge(selectedClaim.status)}
                                </div>

                                {/* Flagged Reasons */}
                                {selectedClaim.flaggedReasons && selectedClaim.flaggedReasons.length > 0 && (
                                    <div className="claims-processing__flags">
                                        <AlertTriangle size={16} />
                                        <ul>
                                            {selectedClaim.flaggedReasons.map((reason, i) => (
                                                <li key={i}>{reason}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Summary */}
                                <div className="claims-processing__detail-grid">
                                    <div className="claims-processing__detail-item">
                                        <User size={16} />
                                        <div>
                                            <span className="claims-processing__detail-label">Member</span>
                                            <span className="claims-processing__detail-value">{selectedClaim.memberName}</span>
                                            <span className="claims-processing__detail-sub">{selectedClaim.memberId}</span>
                                        </div>
                                    </div>
                                    <div className="claims-processing__detail-item">
                                        <Building2 size={16} />
                                        <div>
                                            <span className="claims-processing__detail-label">Provider</span>
                                            <span className="claims-processing__detail-value">{selectedClaim.providerName}</span>
                                            <span className="claims-processing__detail-sub">{selectedClaim.providerId}</span>
                                        </div>
                                    </div>
                                    <div className="claims-processing__detail-item">
                                        <Calendar size={16} />
                                        <div>
                                            <span className="claims-processing__detail-label">Service Date</span>
                                            <span className="claims-processing__detail-value">
                                                {new Date(selectedClaim.serviceDate).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="claims-processing__detail-item">
                                        <Clock size={16} />
                                        <div>
                                            <span className="claims-processing__detail-label">Received</span>
                                            <span className="claims-processing__detail-value">
                                                {new Date(selectedClaim.receivedDate).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Amounts */}
                                <div className="claims-processing__amounts">
                                    <div className="claims-processing__amount-item">
                                        <span className="claims-processing__amount-label">Billed</span>
                                        <span className="claims-processing__amount-value">{formatCurrency(selectedClaim.billedAmount)}</span>
                                    </div>
                                    <div className="claims-processing__amount-item">
                                        <span className="claims-processing__amount-label">Allowed</span>
                                        <span className="claims-processing__amount-value claims-processing__amount-value--allowed">
                                            {formatCurrency(selectedClaim.allowedAmount)}
                                        </span>
                                    </div>
                                    <div className="claims-processing__amount-item">
                                        <span className="claims-processing__amount-label">Paid</span>
                                        <span className="claims-processing__amount-value claims-processing__amount-value--paid">
                                            {formatCurrency(selectedClaim.paidAmount)}
                                        </span>
                                    </div>
                                    <div className="claims-processing__amount-item">
                                        <span className="claims-processing__amount-label">Patient Resp.</span>
                                        <span className="claims-processing__amount-value claims-processing__amount-value--patient">
                                            {formatCurrency(selectedClaim.patientResponsibility)}
                                        </span>
                                    </div>
                                </div>

                                {/* Line Items */}
                                <div className="claims-processing__line-items">
                                    <h3>Line Items (EDI 835)</h3>
                                    <table className="claims-processing__line-table">
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>Code</th>
                                                <th>Description</th>
                                                <th>Billed</th>
                                                <th>Allowed</th>
                                                <th>Paid</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedClaim.lineItems.map((line) => (
                                                <tr key={line.lineNumber}>
                                                    <td>{line.lineNumber}</td>
                                                    <td className="claims-processing__code">{line.procedureCode}</td>
                                                    <td>{line.description}</td>
                                                    <td>{formatCurrency(line.billedAmount)}</td>
                                                    <td>{formatCurrency(line.allowedAmount)}</td>
                                                    <td>{formatCurrency(line.paidAmount)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Audit Trail - CMS Compliance Section */}
                                <div className="claims-processing__audit-trail">
                                    <div className="claims-processing__audit-header">
                                        <div className="claims-processing__audit-title">
                                            <Shield size={18} />
                                            <h3>Audit Trail</h3>
                                            <Badge variant="info" size="sm">
                                                {selectedClaim.auditTrail.length} entries
                                            </Badge>
                                        </div>
                                        <div className="claims-processing__audit-actions">
                                            <Button variant="ghost" size="sm" icon={<Download size={14} />}>
                                                Export PDF
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="claims-processing__audit-compliance-info">
                                        <Scale size={14} />
                                        <span>Compliant with 42 CFR §422.504(a)(14) - Records retention & 45 CFR §164.530(j) - HIPAA audit requirements</span>
                                    </div>

                                    <div className="claims-processing__audit-timeline">
                                        {selectedClaim.auditTrail.map((entry, index) => (
                                            <motion.div
                                                key={entry.id}
                                                className={`claims-processing__audit-entry claims-processing__audit-entry--${entry.action.toLowerCase()}`}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                            >
                                                <div className="claims-processing__audit-entry-marker">
                                                    <div className="claims-processing__audit-entry-dot" />
                                                    {index < selectedClaim.auditTrail.length - 1 && (
                                                        <div className="claims-processing__audit-entry-line" />
                                                    )}
                                                </div>

                                                <div className="claims-processing__audit-entry-content">
                                                    <div className="claims-processing__audit-entry-header">
                                                        <div className="claims-processing__audit-entry-action">
                                                            {entry.action === 'RECEIVED' && <FileCheck size={14} />}
                                                            {entry.action === 'VALIDATED' && <CheckCircle2 size={14} />}
                                                            {entry.action === 'ELIGIBILITY_CHECK' && <User size={14} />}
                                                            {entry.action === 'BENEFIT_CHECK' && <FileText size={14} />}
                                                            {entry.action === 'ADJUDICATED_AUTO' && <Zap size={14} />}
                                                            {entry.action === 'PENDED' && <Clock size={14} />}
                                                            {entry.action === 'APPROVED' && <CheckCircle2 size={14} />}
                                                            {entry.action === 'DENIED' && <XCircle size={14} />}
                                                            {entry.action === 'EOB_GENERATED' && <FileText size={14} />}
                                                            <span>{entry.action.replace(/_/g, ' ')}</span>
                                                        </div>
                                                        <div className="claims-processing__audit-entry-meta">
                                                            <span className="claims-processing__audit-entry-time">
                                                                {new Date(entry.timestamp).toLocaleString()}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="claims-processing__audit-entry-user">
                                                        <span className="claims-processing__audit-entry-user-name">
                                                            {entry.userName}
                                                        </span>
                                                        <Badge variant="info" size="sm">{entry.userRole}</Badge>
                                                        <span className="claims-processing__audit-entry-user-id">
                                                            ID: {entry.userId}
                                                        </span>
                                                    </div>

                                                    <div className="claims-processing__audit-entry-rationale">
                                                        {entry.decisionRationale}
                                                    </div>

                                                    {entry.policyReferences.length > 0 && (
                                                        <div className="claims-processing__audit-entry-policies">
                                                            <span className="claims-processing__audit-entry-policies-label">
                                                                Policy References:
                                                            </span>
                                                            {entry.policyReferences.map((policy, i) => (
                                                                <div key={i} className="claims-processing__audit-policy-ref">
                                                                    <ExternalLink size={12} />
                                                                    <span className="claims-processing__audit-policy-id">
                                                                        {policy.policyId}
                                                                    </span>
                                                                    <span className="claims-processing__audit-policy-name">
                                                                        {policy.policyName} v{policy.version}
                                                                    </span>
                                                                    <span className="claims-processing__audit-policy-citation">
                                                                        {policy.citation}
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}

                                                    <div className="claims-processing__audit-entry-regulatory">
                                                        <Scale size={12} />
                                                        <span>{entry.regulatoryBasis}</span>
                                                    </div>

                                                    {entry.systemRules && entry.systemRules.length > 0 && (
                                                        <div className="claims-processing__audit-entry-rules">
                                                            <span className="claims-processing__audit-entry-rules-label">
                                                                System Rules:
                                                            </span>
                                                            <div className="claims-processing__audit-entry-rules-list">
                                                                {entry.systemRules.map((rule, i) => (
                                                                    <code key={i}>{rule}</code>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {entry.carcCode && (
                                                        <div className="claims-processing__audit-entry-carc">
                                                            <span>CARC Code:</span>
                                                            <code>{entry.carcCode}</code>
                                                            <span className="claims-processing__audit-entry-carc-desc">
                                                                {CARC_CODES[entry.carcCode]?.description || 'Unknown'}
                                                            </span>
                                                        </div>
                                                    )}

                                                    {entry.notes && (
                                                        <div className="claims-processing__audit-entry-notes">
                                                            <em>{entry.notes}</em>
                                                        </div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>

                                {/* Actions */}
                                {(selectedClaim.status === 'pending' || selectedClaim.status === 'in_review') && (
                                    <div className="claims-processing__actions">
                                        <Button variant="primary" icon={<CheckCircle2 size={16} />}>
                                            Approve Claim
                                        </Button>
                                        <Button variant="secondary" icon={<XCircle size={16} />}>
                                            Deny Claim
                                        </Button>
                                        <Button variant="ghost" icon={<Eye size={16} />}>
                                            Request Info
                                        </Button>
                                    </div>
                                )}
                            </GlassCard>
                        </motion.section>
                    ) : (
                        <motion.div
                            className="claims-processing__no-selection"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            <FileText size={48} />
                            <p>Select a claim to view details</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}

export default ClaimsProcessing

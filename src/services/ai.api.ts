// ═══════════════════════════════════════════════════════
// Apex Health Platform - AI API Service
// Chat, document analysis, fraud detection, cost prediction
// ═══════════════════════════════════════════════════════

import { apiClient } from './api-client';

const BASE = '/api/v1/ai';

// ─── Types ───────────────────────────────────────────────

export type AgentType =
  | 'claims_assistant'
  | 'clinical_reviewer'
  | 'coding_assistant'
  | 'member_support'
  | 'fraud_analyst'
  | 'general';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface ChatResponse {
  conversationId: string;
  message: ChatMessage;
  suggestions?: string[];
  references?: Array<{
    type: 'claim' | 'member' | 'policy' | 'document' | 'code';
    id: string;
    title: string;
    relevance: number;
  }>;
  agentType: AgentType;
  tokensUsed: number;
  latencyMs: number;
}

export interface DocumentAnalysisResult {
  documentId: string;
  documentType: string;
  extractedFields: Record<string, unknown>;
  classification: {
    category: string;
    confidence: number;
  };
  containsPhi: boolean;
  phiFields?: string[];
  ocrText?: string;
  summary: string;
  recommendations?: string[];
  processingTimeMs: number;
}

export interface FraudAnalysisResult {
  claimId?: string;
  overallRiskScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  flags: Array<{
    type: string;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    confidence: number;
  }>;
  patterns: Array<{
    patternType: string;
    description: string;
    frequency: number;
    relatedClaims?: string[];
  }>;
  recommendation: 'approve' | 'review' | 'deny' | 'investigate';
  reasoning: string;
  processingTimeMs: number;
}

export interface CostPredictionResult {
  predictedCost: number;
  confidenceInterval: {
    low: number;
    high: number;
    confidence: number;
  };
  costDrivers: Array<{
    factor: string;
    impact: number;
    direction: 'increasing' | 'decreasing';
  }>;
  comparisons: {
    averageCost: number;
    medianCost: number;
    percentile: number;
  };
  recommendations?: string[];
  modelVersion: string;
  processingTimeMs: number;
}

export interface CodingSuggestion {
  originalCode: string;
  suggestedCode: string;
  description: string;
  confidence: number;
  reason: string;
  impact: 'none' | 'minor' | 'significant';
}

// ─── AI API ──────────────────────────────────────────────

export const aiApi = {
  /**
   * Send a chat message to an AI agent.
   * Optionally specify agent type and conversation context.
   */
  async chat(
    message: string,
    agentType: AgentType = 'general',
    conversationId?: string,
    context?: Record<string, unknown>,
  ): Promise<ChatResponse> {
    return apiClient.post<ChatResponse>(`${BASE}/chat`, {
      message,
      agentType,
      conversationId,
      context,
    });
  },

  /**
   * Analyze an uploaded document using AI (OCR, classification, data extraction).
   */
  async analyzeDocument(file: File, options?: {
    extractPhi?: boolean;
    classifyDocument?: boolean;
    generateSummary?: boolean;
  }): Promise<DocumentAnalysisResult> {
    const formData = new FormData();
    formData.append('file', file);
    if (options) {
      formData.append('options', JSON.stringify(options));
    }
    return apiClient.upload<DocumentAnalysisResult>(`${BASE}/documents/analyze`, formData);
  },

  /**
   * Analyze an already-uploaded document by its ID.
   */
  async analyzeDocumentById(documentId: string): Promise<DocumentAnalysisResult> {
    return apiClient.post<DocumentAnalysisResult>(`${BASE}/documents/${documentId}/analyze`);
  },

  /**
   * Run fraud detection analysis on claim data.
   */
  async detectFraud(claimData: Record<string, unknown>): Promise<FraudAnalysisResult> {
    return apiClient.post<FraudAnalysisResult>(`${BASE}/fraud/detect`, claimData);
  },

  /**
   * Run fraud analysis on an existing claim by ID.
   */
  async detectFraudByClaimId(claimId: string): Promise<FraudAnalysisResult> {
    return apiClient.post<FraudAnalysisResult>(`${BASE}/fraud/detect/${claimId}`);
  },

  /**
   * Predict cost for a given set of clinical/claim parameters.
   */
  async predictCost(data: {
    procedureCodes: string[];
    diagnosisCodes: string[];
    providerNpi?: string;
    facilityId?: string;
    memberAge?: number;
    planType?: string;
    networkTier?: string;
  }): Promise<CostPredictionResult> {
    return apiClient.post<CostPredictionResult>(`${BASE}/cost/predict`, data);
  },

  /**
   * Get AI-assisted coding suggestions for a claim.
   */
  async suggestCoding(data: {
    clinicalNotes: string;
    existingCodes?: string[];
    claimType?: string;
  }): Promise<CodingSuggestion[]> {
    return apiClient.post<CodingSuggestion[]>(`${BASE}/coding/suggest`, data);
  },

  /**
   * Get AI-generated clinical rationale for a prior auth decision.
   */
  async getClinicalRationale(priorAuthId: string): Promise<{
    recommendation: 'approve' | 'deny' | 'review';
    confidence: number;
    rationale: string;
    guidelines: string[];
    similarCases: Array<{ id: string; outcome: string; similarity: number }>;
  }> {
    return apiClient.get(`${BASE}/clinical-rationale/${priorAuthId}`);
  },

  /**
   * Get the list of available AI conversation histories.
   */
  async listConversations(agentType?: AgentType): Promise<Array<{
    conversationId: string;
    agentType: AgentType;
    messageCount: number;
    lastMessageAt: string;
    summary: string;
  }>> {
    return apiClient.get(`${BASE}/conversations`, agentType ? { agentType } : undefined);
  },

  /**
   * Get messages for an existing conversation.
   */
  async getConversation(conversationId: string): Promise<{
    conversationId: string;
    agentType: AgentType;
    messages: ChatMessage[];
    createdAt: string;
  }> {
    return apiClient.get(`${BASE}/conversations/${conversationId}`);
  },

  /**
   * Delete a conversation.
   */
  async deleteConversation(conversationId: string): Promise<void> {
    await apiClient.delete(`${BASE}/conversations/${conversationId}`);
  },
};

export default aiApi;

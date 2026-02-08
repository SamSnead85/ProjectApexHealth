/**
 * Inter-Module Event Bus
 * Enables loose coupling between modules via publish/subscribe events.
 * In production, replace with Redis Pub/Sub or NATS for horizontal scaling.
 */

import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from 'eventemitter2';

export interface DomainEvent {
  type: string;
  source: string;           // Module that emitted the event
  organizationId: string;
  payload: Record<string, any>;
  timestamp: string;
  correlationId?: string;
}

// Event type constants
export const EVENTS = {
  // Claims Events
  CLAIM_CREATED: 'claims.created',
  CLAIM_ADJUDICATED: 'claims.adjudicated',
  CLAIM_APPROVED: 'claims.approved',
  CLAIM_DENIED: 'claims.denied',
  CLAIM_PAID: 'claims.paid',
  CLAIM_VOIDED: 'claims.voided',

  // Eligibility Events
  MEMBER_ENROLLED: 'eligibility.enrolled',
  MEMBER_TERMINATED: 'eligibility.terminated',
  ELIGIBILITY_VERIFIED: 'eligibility.verified',
  ACCUMULATOR_UPDATED: 'eligibility.accumulator_updated',

  // Prior Auth Events
  PRIOR_AUTH_SUBMITTED: 'prior-auth.submitted',
  PRIOR_AUTH_APPROVED: 'prior-auth.approved',
  PRIOR_AUTH_DENIED: 'prior-auth.denied',
  PRIOR_AUTH_SLA_AT_RISK: 'prior-auth.sla_at_risk',
  PRIOR_AUTH_SLA_OVERDUE: 'prior-auth.sla_overdue',

  // Provider Events
  PROVIDER_CREDENTIALED: 'provider.credentialed',
  PROVIDER_TERMINATED: 'provider.terminated',
  CREDENTIAL_EXPIRING: 'provider.credential_expiring',

  // Billing Events
  INVOICE_CREATED: 'billing.invoice_created',
  PAYMENT_RECEIVED: 'billing.payment_received',
  PAYMENT_FAILED: 'billing.payment_failed',

  // Workflow Events
  WORKFLOW_STARTED: 'workflow.started',
  WORKFLOW_COMPLETED: 'workflow.completed',
  WORKFLOW_FAILED: 'workflow.failed',
  HITL_REQUIRED: 'workflow.hitl_required',

  // AI Events
  FRAUD_DETECTED: 'ai.fraud_detected',
  ANOMALY_DETECTED: 'ai.anomaly_detected',

  // Document Events
  DOCUMENT_UPLOADED: 'documents.uploaded',
  DOCUMENT_PROCESSED: 'documents.processed',

  // EDI Events
  EDI_RECEIVED: 'edi.received',
  EDI_PROCESSED: 'edi.processed',
  EDI_ERROR: 'edi.error',

  // Audit Events
  SECURITY_ALERT: 'audit.security_alert',
  BREAK_GLASS_ACCESS: 'audit.break_glass',
} as const;

@Injectable()
export class EventBus {
  private readonly logger = new Logger(EventBus.name);
  private readonly emitter = new EventEmitter2({
    wildcard: true,
    delimiter: '.',
    maxListeners: 100,
  });

  /**
   * Publish a domain event to all subscribers.
   */
  publish(event: DomainEvent): void {
    this.logger.debug(`Event published: ${event.type}`, {
      source: event.source,
      organizationId: event.organizationId,
    });
    this.emitter.emit(event.type, event);
  }

  /**
   * Subscribe to a specific event type.
   */
  subscribe(eventType: string, handler: (event: DomainEvent) => void | Promise<void>): void {
    this.emitter.on(eventType, handler);
    this.logger.debug(`Subscribed to: ${eventType}`);
  }

  /**
   * Subscribe to events matching a wildcard pattern.
   * e.g., 'claims.*' matches all claims events
   */
  subscribePattern(pattern: string, handler: (event: DomainEvent) => void | Promise<void>): void {
    this.emitter.on(pattern, handler);
    this.logger.debug(`Subscribed to pattern: ${pattern}`);
  }

  /**
   * Unsubscribe from an event type.
   */
  unsubscribe(eventType: string, handler: (event: DomainEvent) => void | Promise<void>): void {
    this.emitter.off(eventType, handler);
  }

  /**
   * Helper to create a properly formatted domain event.
   */
  static createEvent(
    type: string,
    source: string,
    organizationId: string,
    payload: Record<string, any>,
    correlationId?: string,
  ): DomainEvent {
    return {
      type,
      source,
      organizationId,
      payload,
      timestamp: new Date().toISOString(),
      correlationId,
    };
  }
}

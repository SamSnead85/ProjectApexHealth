// ═══════════════════════════════════════════════════════
// Apex Health Platform - WebSocket Service
// Real-time event streaming with auto-reconnect
// Claims updates, notifications, workflow status
// ═══════════════════════════════════════════════════════

import type {
  WSEvent,
  WSClaimEvent,
  WSNotificationEvent,
  WSWorkflowEvent,
} from '../../packages/shared/src/types/api';
import { apiClient } from './api-client';

// ─── Types ───────────────────────────────────────────────

export type WSEventType =
  | 'claims:created'
  | 'claims:updated'
  | 'claims:adjudicated'
  | 'claims:paid'
  | 'claims:denied'
  | 'notification'
  | 'workflow:started'
  | 'workflow:node_completed'
  | 'workflow:completed'
  | 'workflow:failed'
  | 'workflow:hitl_required'
  | 'member:updated'
  | 'prior-auth:updated'
  | 'system:health'
  | string;

type EventHandler<T = unknown> = (event: WSEvent<T>) => void;

interface WSConfig {
  url: string;
  reconnect: boolean;
  maxReconnectAttempts: number;
  initialReconnectDelayMs: number;
  maxReconnectDelayMs: number;
  heartbeatIntervalMs: number;
}

type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'reconnecting';

// ─── WebSocket Service ───────────────────────────────────

class WebSocketService {
  private ws: WebSocket | null = null;
  private config: WSConfig;
  private state: ConnectionState = 'disconnected';
  private reconnectAttempts = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private listeners = new Map<string, Set<EventHandler<any>>>();
  private stateListeners = new Set<(state: ConnectionState) => void>();
  private pendingSubscriptions: string[] = [];

  constructor(config?: Partial<WSConfig>) {
    const baseWsUrl = this.deriveWsUrl();
    this.config = {
      url: baseWsUrl,
      reconnect: true,
      maxReconnectAttempts: 15,
      initialReconnectDelayMs: 1_000,
      maxReconnectDelayMs: 30_000,
      heartbeatIntervalMs: 30_000,
      ...config,
    };
  }

  // ─── Connection Lifecycle ──────────────────────────

  /**
   * Open the WebSocket connection.
   * Attaches the current access token as a query parameter for auth.
   */
  connect(): void {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return; // Already connected or connecting
    }

    this.setState('connecting');

    const token = apiClient.getAccessToken();
    const url = token ? `${this.config.url}?token=${encodeURIComponent(token)}` : this.config.url;

    try {
      this.ws = new WebSocket(url);
    } catch {
      this.handleReconnect();
      return;
    }

    this.ws.onopen = () => {
      this.setState('connected');
      this.reconnectAttempts = 0;
      this.startHeartbeat();

      // Re-subscribe to any channels that were active before reconnect
      if (this.pendingSubscriptions.length > 0) {
        this.pendingSubscriptions.forEach((channel) => this.sendSubscribe(channel));
      }
    };

    this.ws.onmessage = (event: MessageEvent) => {
      this.handleMessage(event);
    };

    this.ws.onerror = () => {
      // Error event is always followed by close; reconnect handled there
    };

    this.ws.onclose = (event: CloseEvent) => {
      this.stopHeartbeat();

      // 1000 = normal closure, 1001 = going away (intentional)
      if (event.code === 1000 || event.code === 1001) {
        this.setState('disconnected');
        return;
      }

      this.handleReconnect();
    };
  }

  /**
   * Gracefully close the WebSocket connection.
   */
  disconnect(): void {
    this.config.reconnect = false; // Prevent auto-reconnect
    this.clearReconnectTimer();
    this.stopHeartbeat();

    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }

    this.setState('disconnected');
  }

  // ─── Event Subscription ────────────────────────────

  /**
   * Subscribe to a specific event type.
   * Returns an unsubscribe function for cleanup.
   *
   * @example
   * const unsub = wsService.on('claims:updated', (event) => {
   *   console.log('Claim updated:', event.data);
   * });
   * // Later:
   * unsub();
   */
  on<T = unknown>(eventType: WSEventType, handler: EventHandler<T>): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(handler as EventHandler<any>);

    return () => {
      this.off(eventType, handler);
    };
  }

  /**
   * Convenience: subscribe to claim events.
   */
  onClaimEvent(handler: (event: WSClaimEvent) => void): () => void {
    const wrappedHandlers: Array<() => void> = [];
    const claimEvents: WSEventType[] = [
      'claims:created',
      'claims:updated',
      'claims:adjudicated',
      'claims:paid',
      'claims:denied',
    ];
    for (const eventType of claimEvents) {
      wrappedHandlers.push(this.on(eventType, handler as EventHandler<any>));
    }
    return () => wrappedHandlers.forEach((unsub) => unsub());
  }

  /**
   * Convenience: subscribe to notification events.
   */
  onNotification(handler: (event: WSNotificationEvent) => void): () => void {
    return this.on('notification', handler as EventHandler<any>);
  }

  /**
   * Convenience: subscribe to workflow events.
   */
  onWorkflowEvent(handler: (event: WSWorkflowEvent) => void): () => void {
    const wrappedHandlers: Array<() => void> = [];
    const workflowEvents: WSEventType[] = [
      'workflow:started',
      'workflow:node_completed',
      'workflow:completed',
      'workflow:failed',
      'workflow:hitl_required',
    ];
    for (const eventType of workflowEvents) {
      wrappedHandlers.push(this.on(eventType, handler as EventHandler<any>));
    }
    return () => wrappedHandlers.forEach((unsub) => unsub());
  }

  /**
   * Remove a specific handler for an event type.
   */
  off<T = unknown>(eventType: WSEventType, handler: EventHandler<T>): void {
    const handlers = this.listeners.get(eventType);
    if (handlers) {
      handlers.delete(handler as EventHandler<any>);
      if (handlers.size === 0) {
        this.listeners.delete(eventType);
      }
    }
  }

  /**
   * Remove all handlers for a given event type, or all handlers if no type specified.
   */
  removeAllListeners(eventType?: WSEventType): void {
    if (eventType) {
      this.listeners.delete(eventType);
    } else {
      this.listeners.clear();
    }
  }

  /**
   * Subscribe to connection state changes.
   */
  onStateChange(handler: (state: ConnectionState) => void): () => void {
    this.stateListeners.add(handler);
    return () => this.stateListeners.delete(handler);
  }

  // ─── Channel Subscription ─────────────────────────

  /**
   * Subscribe to a server-side channel (e.g., a specific claim ID or workflow).
   */
  subscribe(channel: string): void {
    if (!this.pendingSubscriptions.includes(channel)) {
      this.pendingSubscriptions.push(channel);
    }
    if (this.isConnected()) {
      this.sendSubscribe(channel);
    }
  }

  /**
   * Unsubscribe from a server-side channel.
   */
  unsubscribe(channel: string): void {
    this.pendingSubscriptions = this.pendingSubscriptions.filter((c) => c !== channel);
    if (this.isConnected()) {
      this.send({ type: 'unsubscribe', channel });
    }
  }

  // ─── State Queries ─────────────────────────────────

  getState(): ConnectionState {
    return this.state;
  }

  isConnected(): boolean {
    return this.state === 'connected' && this.ws?.readyState === WebSocket.OPEN;
  }

  // ─── Send Messages ─────────────────────────────────

  /**
   * Send a raw JSON message through the WebSocket.
   */
  send(data: Record<string, unknown>): void {
    if (!this.isConnected()) {
      console.warn('[WS] Cannot send — not connected.');
      return;
    }
    this.ws!.send(JSON.stringify(data));
  }

  // ─── Internal ──────────────────────────────────────

  private handleMessage(event: MessageEvent): void {
    let parsed: WSEvent;
    try {
      parsed = JSON.parse(event.data as string) as WSEvent;
    } catch {
      console.warn('[WS] Received non-JSON message:', event.data);
      return;
    }

    // Ignore heartbeat ack
    if (parsed.event === 'pong') return;

    // Emit to specific event listeners
    const handlers = this.listeners.get(parsed.event);
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(parsed);
        } catch (err) {
          console.error(`[WS] Error in handler for "${parsed.event}":`, err);
        }
      });
    }

    // Also emit to wildcard listeners
    const wildcardHandlers = this.listeners.get('*');
    if (wildcardHandlers) {
      wildcardHandlers.forEach((handler) => {
        try {
          handler(parsed);
        } catch (err) {
          console.error('[WS] Error in wildcard handler:', err);
        }
      });
    }
  }

  private handleReconnect(): void {
    if (!this.config.reconnect) {
      this.setState('disconnected');
      return;
    }

    if (this.reconnectAttempts >= this.config.maxReconnectAttempts) {
      console.error('[WS] Max reconnect attempts reached. Giving up.');
      this.setState('disconnected');
      return;
    }

    this.setState('reconnecting');

    // Exponential backoff with jitter
    const delay = Math.min(
      this.config.initialReconnectDelayMs * Math.pow(2, this.reconnectAttempts) +
        Math.random() * 1_000,
      this.config.maxReconnectDelayMs,
    );

    this.reconnectAttempts++;
    console.info(`[WS] Reconnecting in ${Math.round(delay)}ms (attempt ${this.reconnectAttempts}/${this.config.maxReconnectAttempts})...`);

    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, delay);
  }

  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      if (this.isConnected()) {
        this.send({ type: 'ping' });
      }
    }, this.config.heartbeatIntervalMs);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private setState(state: ConnectionState): void {
    if (this.state === state) return;
    this.state = state;
    this.stateListeners.forEach((handler) => {
      try {
        handler(state);
      } catch (err) {
        console.error('[WS] Error in state change handler:', err);
      }
    });
  }

  private sendSubscribe(channel: string): void {
    this.send({ type: 'subscribe', channel });
  }

  private deriveWsUrl(): string {
    const httpBase =
      (typeof import.meta !== 'undefined' && import.meta.env?.VITE_WS_URL) ||
      (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) ||
      'http://localhost:3000';

    // Convert http(s) → ws(s)
    return httpBase.replace(/^http/, 'ws') + '/ws';
  }
}

// ─── Singleton Instance ─────────────────────────────────

export const wsService = new WebSocketService();

export default wsService;

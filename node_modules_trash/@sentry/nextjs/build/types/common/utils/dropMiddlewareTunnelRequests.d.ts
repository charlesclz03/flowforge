import { type Span, type SpanAttributes } from '@sentry/core';
/**
 * Drops spans for tunnel requests from middleware or fetch instrumentation.
 * This catches both:
 * 1. Requests to the local tunnel route (before rewrite)
 * 2. Requests to Sentry ingest (after rewrite)
 */
export declare function dropMiddlewareTunnelRequests(span: Span, attrs: SpanAttributes | undefined): void;
//# sourceMappingURL=dropMiddlewareTunnelRequests.d.ts.map
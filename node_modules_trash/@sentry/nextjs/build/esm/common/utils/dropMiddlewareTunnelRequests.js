import { SEMATTRS_HTTP_TARGET } from '@opentelemetry/semantic-conventions';
import { SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN, GLOBAL_OBJ } from '@sentry/core';
import { isSentryRequestSpan } from '@sentry/opentelemetry';
import { ATTR_NEXT_SPAN_TYPE } from '../nextSpanAttributes.js';
import { TRANSACTION_ATTR_SHOULD_DROP_TRANSACTION } from '../span-attributes-with-logic-attached.js';

const globalWithInjectedValues = GLOBAL_OBJ

;

/**
 * Drops spans for tunnel requests from middleware or fetch instrumentation.
 * This catches both:
 * 1. Requests to the local tunnel route (before rewrite)
 * 2. Requests to Sentry ingest (after rewrite)
 */
function dropMiddlewareTunnelRequests(span, attrs) {
  // Only filter middleware spans or HTTP fetch spans
  const isMiddleware = attrs?.[ATTR_NEXT_SPAN_TYPE] === 'Middleware.execute';
  // The fetch span could be originating from rewrites re-writing a tunnel request
  // So we want to filter it out
  const isFetchSpan = attrs?.[SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN] === 'auto.http.otel.node_fetch';

  // If the span is not a middleware span or a fetch span, return
  if (!isMiddleware && !isFetchSpan) {
    return;
  }

  // Check if this is either a tunnel route request or a Sentry ingest request
  const isTunnel = isTunnelRouteSpan(attrs || {});
  const isSentry = isSentryRequestSpan(span);

  if (isTunnel || isSentry) {
    // Mark the span to be dropped
    span.setAttribute(TRANSACTION_ATTR_SHOULD_DROP_TRANSACTION, true);
  }
}

/**
 * Checks if a span's HTTP target matches the tunnel route.
 */
function isTunnelRouteSpan(spanAttributes) {
  const tunnelPath = globalWithInjectedValues._sentryRewritesTunnelPath || process.env._sentryRewritesTunnelPath;
  if (!tunnelPath) {
    return false;
  }

  // eslint-disable-next-line deprecation/deprecation
  const httpTarget = spanAttributes[SEMATTRS_HTTP_TARGET];

  if (typeof httpTarget === 'string') {
    // Extract pathname from the target (e.g., "/tunnel?o=123&p=456" -> "/tunnel")
    const pathname = httpTarget.split('?')[0] || '';

    return pathname.startsWith(tunnelPath);
  }

  return false;
}

export { dropMiddlewareTunnelRequests };
//# sourceMappingURL=dropMiddlewareTunnelRequests.js.map

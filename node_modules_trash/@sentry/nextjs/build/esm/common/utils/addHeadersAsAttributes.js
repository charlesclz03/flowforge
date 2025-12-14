import { winterCGHeadersToDict, httpHeadersToSpanAttributes } from '@sentry/core';

/**
 * Extracts HTTP request headers as span attributes and optionally applies them to a span.
 */
function addHeadersAsAttributes(
  headers,
  span,
) {
  if (!headers) {
    return {};
  }

  const headersDict =
    headers instanceof Headers || (typeof headers === 'object' && 'get' in headers)
      ? winterCGHeadersToDict(headers )
      : headers;

  const headerAttributes = httpHeadersToSpanAttributes(headersDict);

  if (span) {
    span.setAttributes(headerAttributes);
  }

  return headerAttributes;
}

export { addHeadersAsAttributes };
//# sourceMappingURL=addHeadersAsAttributes.js.map

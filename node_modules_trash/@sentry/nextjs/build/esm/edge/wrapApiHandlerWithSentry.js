import { withIsolationScope, getCurrentScope, winterCGRequestToRequestData, getActiveSpan, getRootSpan, SEMANTIC_ATTRIBUTE_SENTRY_SOURCE, SEMANTIC_ATTRIBUTE_SENTRY_OP, setCapturedScopesOnSpan, startSpan, SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN, handleCallbackErrors, captureException } from '@sentry/core';
import { addHeadersAsAttributes } from '../common/utils/addHeadersAsAttributes.js';
import { waitUntil, flushSafelyWithTimeout } from '../common/utils/responseEnd.js';

/**
 * Wraps a Next.js edge route handler with Sentry error and performance instrumentation.
 */
function wrapApiHandlerWithSentry(
  handler,
  parameterizedRoute,
) {
  return new Proxy(handler, {
    apply: async (wrappingTarget, thisArg, args) => {
      // TODO: We still should add central isolation scope creation for when our build-time instrumentation does not work anymore with turbopack.

      return withIsolationScope(isolationScope => {
        const req = args[0];
        const currentScope = getCurrentScope();

        let headerAttributes = {};

        if (req instanceof Request) {
          isolationScope.setSDKProcessingMetadata({
            normalizedRequest: winterCGRequestToRequestData(req),
          });
          currentScope.setTransactionName(`${req.method} ${parameterizedRoute}`);
          headerAttributes = addHeadersAsAttributes(req.headers);
        } else {
          currentScope.setTransactionName(`handler (${parameterizedRoute})`);
        }

        let spanName;
        let op = 'http.server';

        // If there is an active span, it likely means that the automatic Next.js OTEL instrumentation worked and we can
        // rely on that for parameterization.
        const activeSpan = getActiveSpan();
        if (activeSpan) {
          spanName = `handler (${parameterizedRoute})`;
          op = undefined;

          const rootSpan = getRootSpan(activeSpan);
          if (rootSpan) {
            rootSpan.updateName(
              req instanceof Request ? `${req.method} ${parameterizedRoute}` : `handler ${parameterizedRoute}`,
            );
            rootSpan.setAttributes({
              [SEMANTIC_ATTRIBUTE_SENTRY_OP]: 'http.server',
              [SEMANTIC_ATTRIBUTE_SENTRY_SOURCE]: 'route',
              ...headerAttributes,
            });
            setCapturedScopesOnSpan(rootSpan, currentScope, isolationScope);
          }
        } else if (req instanceof Request) {
          spanName = `${req.method} ${parameterizedRoute}`;
        } else {
          spanName = `handler ${parameterizedRoute}`;
        }

        return startSpan(
          {
            name: spanName,
            op: op,
            attributes: {
              [SEMANTIC_ATTRIBUTE_SENTRY_SOURCE]: 'route',
              [SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: 'auto.function.nextjs.wrap_api_handler',
              ...headerAttributes,
            },
          },
          () => {
            return handleCallbackErrors(
              () => wrappingTarget.apply(thisArg, args),
              error => {
                captureException(error, {
                  mechanism: {
                    type: 'auto.function.nextjs.wrap_api_handler',
                    handled: false,
                  },
                });
              },
              () => {
                waitUntil(flushSafelyWithTimeout());
              },
            );
          },
        );
      });
    },
  });
}

export { wrapApiHandlerWithSentry };
//# sourceMappingURL=wrapApiHandlerWithSentry.js.map

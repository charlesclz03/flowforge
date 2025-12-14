import { withIsolationScope, getClient, debug, getActiveSpan, continueTrace, startSpan, SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN, SEMANTIC_ATTRIBUTE_SENTRY_SOURCE, handleCallbackErrors, SPAN_STATUS_ERROR, captureException, getIsolationScope } from '@sentry/core';
import { waitUntil, flushSafelyWithTimeout } from './utils/responseEnd.js';
import { DEBUG_BUILD } from './debug-build.js';
import { isNotFoundNavigationError, isRedirectNavigationError } from './nextNavigationErrorUtils.js';

/**
 * Wraps a Next.js Server Action implementation with Sentry Error and Performance instrumentation.
 */
function withServerActionInstrumentation(
  ...args
) {
  if (typeof args[1] === 'function') {
    const [serverActionName, callback] = args;
    return withServerActionInstrumentationImplementation(serverActionName, {}, callback);
  } else {
    const [serverActionName, options, callback] = args;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return withServerActionInstrumentationImplementation(serverActionName, options, callback);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function withServerActionInstrumentationImplementation(
  serverActionName,
  options,
  callback,
) {
  return withIsolationScope(async isolationScope => {
    const sendDefaultPii = getClient()?.getOptions().sendDefaultPii;

    let sentryTraceHeader;
    let baggageHeader;
    const fullHeadersObject = {};
    try {
      const awaitedHeaders = await options.headers;
      sentryTraceHeader = awaitedHeaders?.get('sentry-trace') ?? undefined;
      baggageHeader = awaitedHeaders?.get('baggage');
      awaitedHeaders?.forEach((value, key) => {
        fullHeadersObject[key] = value;
      });
    } catch {
      DEBUG_BUILD &&
        debug.warn(
          "Sentry wasn't able to extract the tracing headers for a server action. Will not trace this request.",
        );
    }

    isolationScope.setTransactionName(`serverAction/${serverActionName}`);
    isolationScope.setSDKProcessingMetadata({
      normalizedRequest: {
        headers: fullHeadersObject,
      } ,
    });

    // Normally, there is an active span here (from Next.js OTEL) and we just use that as parent
    // Else, we manually continueTrace from the incoming headers
    const continueTraceIfNoActiveSpan = getActiveSpan()
      ? (_opts, callback) => callback()
      : continueTrace;

    return continueTraceIfNoActiveSpan(
      {
        sentryTrace: sentryTraceHeader,
        baggage: baggageHeader,
      },
      async () => {
        try {
          return await startSpan(
            {
              op: 'function.server_action',
              name: `serverAction/${serverActionName}`,
              forceTransaction: true,
              attributes: {
                [SEMANTIC_ATTRIBUTE_SENTRY_SOURCE]: 'route',
                [SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: 'auto.function.nextjs.server_action',
              },
            },
            async span => {
              const result = await handleCallbackErrors(callback, error => {
                if (isNotFoundNavigationError(error)) {
                  // We don't want to report "not-found"s
                  span.setStatus({ code: SPAN_STATUS_ERROR, message: 'not_found' });
                } else if (isRedirectNavigationError(error)) {
                  // Don't do anything for redirects
                } else {
                  span.setStatus({ code: SPAN_STATUS_ERROR, message: 'internal_error' });
                  captureException(error, {
                    mechanism: {
                      handled: false,
                      type: 'auto.function.nextjs.server_action',
                    },
                  });
                }
              });

              if (options.recordResponse !== undefined ? options.recordResponse : sendDefaultPii) {
                getIsolationScope().setExtra('server_action_result', result);
              }

              if (options.formData) {
                options.formData.forEach((value, key) => {
                  getIsolationScope().setExtra(
                    `server_action_form_data.${key}`,
                    typeof value === 'string' ? value : '[non-string value]',
                  );
                });
              }

              return result;
            },
          );
        } finally {
          waitUntil(flushSafelyWithTimeout());
        }
      },
    );
  });
}

export { withServerActionInstrumentation };
//# sourceMappingURL=withServerActionInstrumentation.js.map

Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const core = require('@sentry/core');
const nextNavigationErrorUtils = require('./nextNavigationErrorUtils.js');
const spanAttributesWithLogicAttached = require('./span-attributes-with-logic-attached.js');
const tracingUtils = require('./utils/tracingUtils.js');

/**
 * Wraps a generation function (e.g. generateMetadata) with Sentry error and performance instrumentation.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function wrapGenerationFunctionWithSentry(
  generationFunction,
  context,
) {
  const { requestAsyncStorage, componentRoute, componentType, generationFunctionIdentifier } = context;
  return new Proxy(generationFunction, {
    apply: (originalFunction, thisArg, args) => {
      const requestTraceId = core.getActiveSpan()?.spanContext().traceId;
      let headers = undefined;
      // We try-catch here just in case anything goes wrong with the async storage here goes wrong since it is Next.js internal API
      try {
        headers = requestAsyncStorage?.getStore()?.headers;
      } catch {
        /** empty */
      }

      const isolationScope = tracingUtils.commonObjectToIsolationScope(headers);

      const activeSpan = core.getActiveSpan();
      if (activeSpan) {
        const rootSpan = core.getRootSpan(activeSpan);
        const { scope } = core.getCapturedScopesOnSpan(rootSpan);
        core.setCapturedScopesOnSpan(rootSpan, scope ?? new core.Scope(), isolationScope);
      }

      const headersDict = headers ? core.winterCGHeadersToDict(headers) : undefined;

      return core.withIsolationScope(isolationScope, () => {
        return core.withScope(scope => {
          scope.setTransactionName(`${componentType}.${generationFunctionIdentifier} (${componentRoute})`);

          isolationScope.setSDKProcessingMetadata({
            normalizedRequest: {
              headers: headersDict,
            } ,
          });

          const activeSpan = core.getActiveSpan();
          if (activeSpan) {
            const rootSpan = core.getRootSpan(activeSpan);
            const sentryTrace = headersDict?.['sentry-trace'];
            if (sentryTrace) {
              rootSpan.setAttribute(spanAttributesWithLogicAttached.TRANSACTION_ATTR_SENTRY_TRACE_BACKFILL, sentryTrace);
            }
          }

          const propagationContext = tracingUtils.commonObjectToPropagationContext(
            headers,
            core.propagationContextFromHeaders(headersDict?.['sentry-trace'], headersDict?.['baggage']),
          );

          if (requestTraceId) {
            propagationContext.traceId = requestTraceId;
          }

          scope.setPropagationContext(propagationContext);

          return core.startSpanManual(
            {
              op: 'function.nextjs',
              name: `${componentType}.${generationFunctionIdentifier} (${componentRoute})`,
              attributes: {
                [core.SEMANTIC_ATTRIBUTE_SENTRY_SOURCE]: 'route',
                [core.SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: 'auto.function.nextjs',
                'sentry.nextjs.ssr.function.type': generationFunctionIdentifier,
                'sentry.nextjs.ssr.function.route': componentRoute,
              },
            },
            span => {
              return core.handleCallbackErrors(
                () => originalFunction.apply(thisArg, args),
                err => {
                  // When you read this code you might think: "Wait a minute, shouldn't we set the status on the root span too?"
                  // The answer is: "No." - The status of the root span is determined by whatever status code Next.js decides to put on the response.
                  if (nextNavigationErrorUtils.isNotFoundNavigationError(err)) {
                    // We don't want to report "not-found"s
                    span.setStatus({ code: core.SPAN_STATUS_ERROR, message: 'not_found' });
                    core.getRootSpan(span).setStatus({ code: core.SPAN_STATUS_ERROR, message: 'not_found' });
                  } else if (nextNavigationErrorUtils.isRedirectNavigationError(err)) {
                    // We don't want to report redirects
                    span.setStatus({ code: core.SPAN_STATUS_OK });
                  } else {
                    span.setStatus({ code: core.SPAN_STATUS_ERROR, message: 'internal_error' });
                    core.getRootSpan(span).setStatus({ code: core.SPAN_STATUS_ERROR, message: 'internal_error' });
                    core.captureException(err, {
                      mechanism: {
                        handled: false,
                        type: 'auto.function.nextjs.generation_function',
                        data: {
                          function: generationFunctionIdentifier,
                        },
                      },
                    });
                  }
                },
                () => {
                  span.end();
                },
              );
            },
          );
        });
      });
    },
  });
}

exports.wrapGenerationFunctionWithSentry = wrapGenerationFunctionWithSentry;
//# sourceMappingURL=wrapGenerationFunctionWithSentry.js.map

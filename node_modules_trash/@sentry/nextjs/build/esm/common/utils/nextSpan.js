import { startSpan as startSpan$1, startSpanManual as startSpanManual$1, startInactiveSpan as startInactiveSpan$1, debug, SentryNonRecordingSpan } from '@sentry/core';
import { DEBUG_BUILD } from '../debug-build.js';
import { isBuild } from './isBuild.js';
import { isUseCacheFunction } from './isUseCacheFunction.js';

function shouldNoopSpan(callback) {
  const isBuildContext = isBuild();
  const isUseCacheFunctionContext = callback ? isUseCacheFunction(callback) : false;

  if (isUseCacheFunctionContext) {
    DEBUG_BUILD && debug.log('Skipping span creation in Cache Components context');
  }

  return isBuildContext || isUseCacheFunctionContext;
}

function createNonRecordingSpan() {
  return new SentryNonRecordingSpan({
    traceId: '00000000000000000000000000000000',
    spanId: '0000000000000000',
  });
}

/**
 * Next.js-specific implementation of `startSpan` that skips span creation
 * in Cache Components contexts (which render at build time).
 *
 * When in a Cache Components context, we execute the callback with a non-recording span
 * and return early without creating an actual span, since spans don't make sense at build/cache time.
 *
 * @param options - Options for starting the span
 * @param callback - Callback function that receives the span
 * @returns The return value of the callback
 */
function startSpan(options, callback) {
  if (shouldNoopSpan(callback)) {
    return callback(createNonRecordingSpan());
  }

  return startSpan$1(options, callback);
}

/**
 *
 * When in a Cache Components context, we execute the callback with a non-recording span
 * and return early without creating an actual span, since spans don't make sense at build/cache time.
 *
 * @param options - Options for starting the span
 * @param callback - Callback function that receives the span and finish function
 * @returns The return value of the callback
 */
function startSpanManual(options, callback) {
  if (shouldNoopSpan(callback)) {
    const nonRecordingSpan = createNonRecordingSpan();
    return callback(nonRecordingSpan, () => nonRecordingSpan.end());
  }

  return startSpanManual$1(options, callback);
}

/**
 *
 * When in a Cache Components context, we return a non-recording span and return early
 * without creating an actual span, since spans don't make sense at build/cache time.
 *
 * @param options - Options for starting the span
 * @returns A non-recording span (in Cache Components context) or the created span
 */
function startInactiveSpan(options) {
  if (shouldNoopSpan()) {
    return createNonRecordingSpan();
  }

  return startInactiveSpan$1(options);
}

export { startInactiveSpan, startSpan, startSpanManual };
//# sourceMappingURL=nextSpan.js.map

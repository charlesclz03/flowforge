import { vercelWaitUntil, debug, flush, GLOBAL_OBJ } from '@sentry/core';
import { DEBUG_BUILD } from '../debug-build.js';

/**
 * Flushes pending Sentry events with a 2 second timeout and in a way that cannot create unhandled promise rejections.
 */
async function flushSafelyWithTimeout() {
  try {
    DEBUG_BUILD && debug.log('Flushing events...');
    await flush(2000);
    DEBUG_BUILD && debug.log('Done flushing events');
  } catch (e) {
    DEBUG_BUILD && debug.log('Error while flushing events:\n', e);
  }
}

/**
 * Uses platform-specific waitUntil function to wait for the provided task to complete without blocking.
 */
function waitUntil(task) {
  // If deployed on Cloudflare, use the Cloudflare waitUntil function to flush the events
  if (isCloudflareWaitUntilAvailable()) {
    cloudflareWaitUntil(task);
    return;
  }

  // otherwise, use vercel's
  vercelWaitUntil(task);
}

/**
 * Gets the Cloudflare context from the global object.
 * Relevant to opennext
 * https://github.com/opennextjs/opennextjs-cloudflare/blob/b53a046bd5c30e94a42e36b67747cefbf7785f9a/packages/cloudflare/src/cli/templates/init.ts#L17
 */
function _getOpenNextCloudflareContext() {
  const openNextCloudflareContextSymbol = Symbol.for('__cloudflare-context__');

  return (
    GLOBAL_OBJ

  )[openNextCloudflareContextSymbol]?.ctx;
}

/**
 * Function that delays closing of a Cloudflare lambda until the provided promise is resolved.
 */
function cloudflareWaitUntil(task) {
  _getOpenNextCloudflareContext()?.waitUntil(task);
}

/**
 * Checks if the Cloudflare waitUntil function is available globally.
 */
function isCloudflareWaitUntilAvailable() {
  return typeof _getOpenNextCloudflareContext()?.waitUntil === 'function';
}

export { cloudflareWaitUntil, flushSafelyWithTimeout, isCloudflareWaitUntilAvailable, waitUntil };
//# sourceMappingURL=responseEnd.js.map

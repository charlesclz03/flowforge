import { WINDOW } from '@sentry/react';
import { appRouterInstrumentNavigation, appRouterInstrumentPageLoad } from './appRouterRoutingInstrumentation.js';
import { pagesRouterInstrumentNavigation, pagesRouterInstrumentPageLoad } from './pagesRouterRoutingInstrumentation.js';

/**
 * Instruments the Next.js Client Router for page loads.
 */
function nextRouterInstrumentPageLoad(client) {
  const isAppRouter = !WINDOW.document.getElementById('__NEXT_DATA__');
  if (isAppRouter) {
    appRouterInstrumentPageLoad(client);
  } else {
    pagesRouterInstrumentPageLoad(client);
  }
}

/**
 * Instruments the Next.js Client Router for navigation.
 */
function nextRouterInstrumentNavigation(client) {
  const isAppRouter = !WINDOW.document.getElementById('__NEXT_DATA__');
  if (isAppRouter) {
    appRouterInstrumentNavigation(client);
  } else {
    pagesRouterInstrumentNavigation(client);
  }
}

export { nextRouterInstrumentNavigation, nextRouterInstrumentPageLoad };
//# sourceMappingURL=nextRoutingInstrumentation.js.map


"use client";
Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const index = require('./client/index.js');
const _error = require('./common/pages-router-instrumentation/_error.js');
const nextSpan = require('./common/utils/nextSpan.js');
const browserTracingIntegration = require('./client/browserTracingIntegration.js');
const appRouterRoutingInstrumentation = require('./client/routing/appRouterRoutingInstrumentation.js');
const wrapGetStaticPropsWithSentry = require('./common/pages-router-instrumentation/wrapGetStaticPropsWithSentry.js');
const wrapGetInitialPropsWithSentry = require('./common/pages-router-instrumentation/wrapGetInitialPropsWithSentry.js');
const wrapAppGetInitialPropsWithSentry = require('./common/pages-router-instrumentation/wrapAppGetInitialPropsWithSentry.js');
const wrapDocumentGetInitialPropsWithSentry = require('./common/pages-router-instrumentation/wrapDocumentGetInitialPropsWithSentry.js');
const wrapErrorGetInitialPropsWithSentry = require('./common/pages-router-instrumentation/wrapErrorGetInitialPropsWithSentry.js');
const wrapGetServerSidePropsWithSentry = require('./common/pages-router-instrumentation/wrapGetServerSidePropsWithSentry.js');
const wrapServerComponentWithSentry = require('./common/wrapServerComponentWithSentry.js');
const wrapRouteHandlerWithSentry = require('./common/wrapRouteHandlerWithSentry.js');
const wrapApiHandlerWithSentryVercelCrons = require('./common/pages-router-instrumentation/wrapApiHandlerWithSentryVercelCrons.js');
const wrapMiddlewareWithSentry = require('./common/wrapMiddlewareWithSentry.js');
const wrapPageComponentWithSentry = require('./common/pages-router-instrumentation/wrapPageComponentWithSentry.js');
const wrapGenerationFunctionWithSentry = require('./common/wrapGenerationFunctionWithSentry.js');
const withServerActionInstrumentation = require('./common/withServerActionInstrumentation.js');
const captureRequestError = require('./common/captureRequestError.js');
const react = require('@sentry/react');



exports.init = index.init;
exports.withSentryConfig = index.withSentryConfig;
exports.captureUnderscoreErrorException = _error.captureUnderscoreErrorException;
exports.startInactiveSpan = nextSpan.startInactiveSpan;
exports.startSpan = nextSpan.startSpan;
exports.startSpanManual = nextSpan.startSpanManual;
exports.browserTracingIntegration = browserTracingIntegration.browserTracingIntegration;
exports.captureRouterTransitionStart = appRouterRoutingInstrumentation.captureRouterTransitionStart;
exports.wrapGetStaticPropsWithSentry = wrapGetStaticPropsWithSentry.wrapGetStaticPropsWithSentry;
exports.wrapGetInitialPropsWithSentry = wrapGetInitialPropsWithSentry.wrapGetInitialPropsWithSentry;
exports.wrapAppGetInitialPropsWithSentry = wrapAppGetInitialPropsWithSentry.wrapAppGetInitialPropsWithSentry;
exports.wrapDocumentGetInitialPropsWithSentry = wrapDocumentGetInitialPropsWithSentry.wrapDocumentGetInitialPropsWithSentry;
exports.wrapErrorGetInitialPropsWithSentry = wrapErrorGetInitialPropsWithSentry.wrapErrorGetInitialPropsWithSentry;
exports.wrapGetServerSidePropsWithSentry = wrapGetServerSidePropsWithSentry.wrapGetServerSidePropsWithSentry;
exports.wrapServerComponentWithSentry = wrapServerComponentWithSentry.wrapServerComponentWithSentry;
exports.wrapRouteHandlerWithSentry = wrapRouteHandlerWithSentry.wrapRouteHandlerWithSentry;
exports.wrapApiHandlerWithSentryVercelCrons = wrapApiHandlerWithSentryVercelCrons.wrapApiHandlerWithSentryVercelCrons;
exports.wrapMiddlewareWithSentry = wrapMiddlewareWithSentry.wrapMiddlewareWithSentry;
exports.wrapPageComponentWithSentry = wrapPageComponentWithSentry.wrapPageComponentWithSentry;
exports.wrapGenerationFunctionWithSentry = wrapGenerationFunctionWithSentry.wrapGenerationFunctionWithSentry;
exports.withServerActionInstrumentation = withServerActionInstrumentation.withServerActionInstrumentation;
exports.captureRequestError = captureRequestError.captureRequestError;
Object.prototype.hasOwnProperty.call(react, '__proto__') &&
	!Object.prototype.hasOwnProperty.call(exports, '__proto__') &&
	Object.defineProperty(exports, '__proto__', {
		enumerable: true,
		value: react['__proto__']
	});

Object.keys(react).forEach(k => {
	if (k !== 'default' && !Object.prototype.hasOwnProperty.call(exports, k)) exports[k] = react[k];
});
//# sourceMappingURL=index.client.js.map

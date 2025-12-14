import { loadModule } from '@sentry/core';
import { getBuildPluginOptions } from './getBuildPluginOptions.js';

/**
 * This function is called by Next.js after the production build is complete.
 * It is used to upload sourcemaps to Sentry.
 */
async function handleRunAfterProductionCompile(
  {
    releaseName,
    distDir,
    buildTool,
    usesNativeDebugIds,
  },
  sentryBuildOptions,
) {
  if (sentryBuildOptions.debug) {
    // eslint-disable-next-line no-console
    console.debug('[@sentry/nextjs] Running runAfterProductionCompile logic.');
  }

  const { createSentryBuildPluginManager } =
    loadModule(
      '@sentry/bundler-plugin-core',
      module,
    ) ?? {};

  if (!createSentryBuildPluginManager) {
    // eslint-disable-next-line no-console
    console.warn(
      '[@sentry/nextjs] Could not load build manager package. Will not run runAfterProductionCompile logic.',
    );
    return;
  }

  const options = getBuildPluginOptions({
    sentryBuildOptions,
    releaseName,
    distDirAbsPath: distDir,
    buildTool: `after-production-compile-${buildTool}`,
  });

  const sentryBuildPluginManager = createSentryBuildPluginManager(options, {
    buildTool,
    loggerPrefix: '[@sentry/nextjs - After Production Compile]',
  });

  await sentryBuildPluginManager.telemetry.emitBundlerPluginExecutionSignal();
  await sentryBuildPluginManager.createRelease();

  if (!usesNativeDebugIds) {
    await sentryBuildPluginManager.injectDebugIds([distDir]);
  }

  await sentryBuildPluginManager.uploadSourcemaps([distDir], {
    // We don't want to prepare the artifacts because we injected debug ids manually before
    prepareArtifacts: false,
  });
  await sentryBuildPluginManager.deleteArtifacts();
}

export { handleRunAfterProductionCompile };
//# sourceMappingURL=handleRunAfterProductionCompile.js.map

import type { SentryBuildOptions } from './types';
/**
 * This function is called by Next.js after the production build is complete.
 * It is used to upload sourcemaps to Sentry.
 */
export declare function handleRunAfterProductionCompile({ releaseName, distDir, buildTool, usesNativeDebugIds, }: {
    releaseName?: string;
    distDir: string;
    buildTool: 'webpack' | 'turbopack';
    usesNativeDebugIds?: boolean;
}, sentryBuildOptions: SentryBuildOptions): Promise<void>;
//# sourceMappingURL=handleRunAfterProductionCompile.d.ts.map
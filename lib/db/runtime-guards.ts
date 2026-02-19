const EXPECTED_DB_SETUP_ERROR_CODES = new Set(['P1000', 'P1001', 'P6001'])

function getErrorCode(error: unknown): string | null {
  const code = (error as { code?: unknown })?.code
  return typeof code === 'string' ? code : null
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  return ''
}

export function isExpectedDatabaseSetupError(error: unknown): boolean {
  const code = getErrorCode(error)
  if (code && EXPECTED_DB_SETUP_ERROR_CODES.has(code)) {
    return true
  }

  const message = getErrorMessage(error)
  return (
    message.includes('the URL must start with the protocol `prisma://`') ||
    message.includes("Can't reach database server") ||
    message.includes('Environment variable not found: DATABASE_URL') ||
    message.includes('PrismaClientInitializationError')
  )
}

export function isProductionBuildPhase(): boolean {
  return (
    process.env.NEXT_PHASE === 'phase-production-build' ||
    process.env.npm_lifecycle_event === 'build'
  )
}

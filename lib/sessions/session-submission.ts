import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { z } from 'zod'

const wordsUsedSchema = z.preprocess((value) => {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string')
  }

  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (!trimmed) {
      return []
    }

    try {
      const parsed = JSON.parse(trimmed) as unknown
      return Array.isArray(parsed)
        ? parsed.filter((item): item is string => typeof item === 'string')
        : []
    } catch {
      return []
    }
  }

  return []
}, z.array(z.string()).default([]))

const fxConfigSchema = z.preprocess((value) => {
  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (!trimmed) {
      return null
    }

    try {
      return JSON.parse(trimmed) as unknown
    } catch {
      return null
    }
  }

  if (value && typeof value === 'object') {
    return value
  }

  return null
}, z.unknown().nullable().default(null))

const nonEmptyStringWithDefault = (defaultValue: string) =>
  z.preprocess(
    (value) =>
      typeof value === 'string' && value.trim().length === 0
        ? undefined
        : value,
    z.string().trim().optional().default(defaultValue)
  )

const sessionModeSchema = z.enum(['solo', 'cypher']).optional().default('solo')

export const recordingSubmissionSchema = z.object({
  beatId: z.string().trim().min(1, 'Beat ID is required'),
  title: nonEmptyStringWithDefault('Freestyle Session'),
  mode: sessionModeSchema,
  durationSeconds: z.coerce.number().int().positive('Duration must be > 0'),
  frequency: z.coerce.number().int().min(1).optional().default(8),
  difficulty: z.coerce.number().int().min(1).optional().default(2),
  restarts: z.coerce.number().int().min(0).optional().default(0),
  playbacks: z.coerce.number().int().min(0).optional().default(0),
  beatOffsetMs: z.coerce.number().int().optional().default(0),
  fileSizeBytes: z.coerce.number().int().min(0).optional().default(0),
  storagePath: z.string().trim().optional().default(''),
  wordsUsed: wordsUsedSchema,
  fxConfig: fxConfigSchema,
})

function validationErrorResponse(
  error: z.ZodError<z.infer<typeof recordingSubmissionSchema>>
) {
  return NextResponse.json(
    {
      error: 'Validation failed',
      details: error.flatten().fieldErrors,
    },
    { status: 400 }
  )
}

export interface ParsedRecordingSubmission extends z.infer<
  typeof recordingSubmissionSchema
> {
  isJsonPayload: boolean
  audioFile: File | null
}

export interface BuildSessionSaveInputOptions {
  userId: string
  beatId: string
  title?: string | null
  mode?: 'solo' | 'cypher'
  durationSeconds: number
  frequency?: number
  difficulty?: number
  restarts?: number
  playbacks?: number
  beatOffsetMs?: number
  fileSizeBytes?: number
  storageUrl?: string | null
  fxConfig?: unknown
  wordsUsed?: string[]
  baseWordCount?: number
}

export interface BuiltSessionSaveInput {
  createInput: Prisma.FreestyleSessionUncheckedCreateInput
  wordsUsed: string[]
  wordCount: number
  serverScore: number
}

function normalizeWordsUsed(wordsUsed: string[] = []): string[] {
  return wordsUsed.map((word) => word.trim()).filter((word) => word.length > 0)
}

function toFxConfigValue(
  fxConfig: unknown
): Prisma.InputJsonValue | typeof Prisma.DbNull {
  if (fxConfig === Prisma.DbNull || fxConfig === Prisma.JsonNull) {
    return Prisma.DbNull
  }

  return fxConfig && typeof fxConfig === 'object'
    ? (fxConfig as Prisma.InputJsonValue)
    : Prisma.DbNull
}

export function buildSessionSaveInput({
  userId,
  beatId,
  title,
  mode = 'solo',
  durationSeconds,
  frequency = 8,
  difficulty = 2,
  restarts = 0,
  playbacks = 0,
  beatOffsetMs = 0,
  fileSizeBytes = 0,
  storageUrl = null,
  fxConfig = null,
  wordsUsed = [],
  baseWordCount = 0,
}: BuildSessionSaveInputOptions): BuiltSessionSaveInput {
  const normalizedWordsUsed = normalizeWordsUsed(wordsUsed)
  const wordCount =
    normalizedWordsUsed.length > 0 ? normalizedWordsUsed.length : baseWordCount
  const serverScore = Math.round(durationSeconds * 10 * (1 + wordCount / 10))

  return {
    wordsUsed: normalizedWordsUsed,
    wordCount,
    serverScore,
    createInput: {
      userId,
      beatId,
      title: title?.trim() || 'Freestyle Session',
      storageUrl,
      fileSizeBytes,
      durationSeconds,
      frequency,
      difficulty,
      score: serverScore,
      vibe: null,
      mode,
      restarts,
      playbacks,
      wordCount,
      beatOffsetMs,
      fxConfig: toFxConfigValue(fxConfig),
    },
  }
}

export async function parseRecordingSubmissionRequest(
  request: Request,
  userId: string
): Promise<ParsedRecordingSubmission | NextResponse> {
  const contentType = request.headers.get('content-type') || ''
  const isJsonPayload = contentType.includes('application/json')

  if (isJsonPayload) {
    let body: unknown

    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON payload' },
        { status: 400 }
      )
    }

    const parsed = recordingSubmissionSchema.safeParse(body)
    if (!parsed.success) {
      return validationErrorResponse(parsed.error)
    }

    if (!parsed.data.storagePath || parsed.data.fileSizeBytes <= 0) {
      return NextResponse.json(
        { error: 'Missing required fields: storagePath, fileSizeBytes' },
        { status: 400 }
      )
    }

    const expectedPrefix = `users/${userId}/`
    if (!parsed.data.storagePath.startsWith(expectedPrefix)) {
      return NextResponse.json(
        { error: 'Invalid storagePath for current user' },
        { status: 400 }
      )
    }

    return {
      ...parsed.data,
      isJsonPayload: true,
      audioFile: null,
    }
  }

  const formData = await request.formData()
  const audioValue = formData.get('audio')
  const audioFile = audioValue instanceof File ? audioValue : null

  const parsed = recordingSubmissionSchema.safeParse({
    beatId: formData.get('beatId'),
    title: formData.get('title'),
    mode: formData.get('mode'),
    durationSeconds: formData.get('durationSeconds'),
    frequency: formData.get('frequency'),
    difficulty: formData.get('difficulty'),
    restarts: formData.get('restarts'),
    playbacks: formData.get('playbacks'),
    beatOffsetMs: formData.get('beatOffsetMs'),
    fileSizeBytes: audioFile?.size ?? 0,
    storagePath: '',
    wordsUsed: formData.get('wordsUsed'),
    fxConfig: formData.get('fxConfig'),
  })

  if (!parsed.success) {
    return validationErrorResponse(parsed.error)
  }

  if (!audioFile) {
    return NextResponse.json(
      { error: 'Missing required field: audio' },
      { status: 400 }
    )
  }

  return {
    ...parsed.data,
    isJsonPayload: false,
    audioFile,
  }
}

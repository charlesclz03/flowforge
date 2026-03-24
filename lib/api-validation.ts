import { z } from 'zod'
import { NextResponse } from 'next/server'

/**
 * Helper to parse, validate, and extract typed data from a JSON request.
 * Returns a NextResponse (400) if validation fails, or the parsed data if successful.
 *
 * Usage:
 *   const data = await validateRequest(request, mySchema)
 *   if (data instanceof NextResponse) return data
 *   // ...use data with full type safety
 */
export async function validateJsonRequest<T extends z.ZodTypeAny>(
  req: Request,
  schema: T
): Promise<z.infer<T> | NextResponse> {
  try {
    const body = await req.json()
    const result = schema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: result.error.flatten().fieldErrors,
        },
        { status: 400 }
      )
    }

    return result.data
  } catch (error) {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 })
  }
}

// --- Common API Schemas ---

export const supportRequestSchema = z.object({
  subject: z.string().trim().max(120).optional().default('Support Request'),
  message: z.string().trim().min(1, 'Message content is required').max(5000),
})

export const sessionCompleteSchema = z.object({
  beatId: z.string().min(1, 'Beat ID is required'),
  title: z.string().trim().optional().default('Freestyle Session'),
  mode: z.enum(['solo', 'cypher']).optional().default('solo'),
  durationSeconds: z.coerce.number().int().positive('Duration must be > 0'),
  frequency: z.coerce.number().int().optional().default(8),
  difficulty: z.coerce.number().int().optional().default(2),
  restarts: z.coerce.number().int().min(0).optional().default(0),
  baseWordCount: z.coerce.number().int().min(0).optional().default(0),
  wordsUsed: z.array(z.string()).optional().default([]),
})

export const signedUrlSchema = z.object({
  fileName: z.string().min(1, 'File name is required'),
  contentType: z.string().min(1, 'Content type is required'),
  bucket: z.string().optional(),
})

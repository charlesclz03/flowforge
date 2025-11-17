import { supabase, RECORDINGS_BUCKET } from '@/lib/supabase/client'

export interface RecordingUploadResult {
  storageUrl: string
  path: string
}

/**
 * Upload a recording audio file to Supabase Storage
 */
export async function uploadRecording(
  userId: string,
  recordingId: string,
  audioBlob: Blob
): Promise<RecordingUploadResult> {
  try {
    // Generate file path: userId/recordingId.webm
    const filePath = `${userId}/${recordingId}.webm`
    const fileExtension = audioBlob.type.split('/')[1] || 'webm'
    const fileName = `${recordingId}.${fileExtension}`

    // Convert blob to File for upload
    const file = new File([audioBlob], fileName, { type: audioBlob.type })

    // Upload to Supabase Storage
    const { data: _data, error } = await supabase.storage
      .from(RECORDINGS_BUCKET)
      .upload(filePath, file, {
        contentType: audioBlob.type,
        upsert: false, // Don't overwrite existing files
      })

    if (error) {
      throw new Error(`Failed to upload recording: ${error.message}`)
    }

    // Get public URL
    const { data: urlData } = supabase.storage.from(RECORDINGS_BUCKET).getPublicUrl(filePath)

    return {
      storageUrl: urlData.publicUrl,
      path: filePath,
    }
  } catch (error) {
    console.error('Error uploading recording:', error)
    throw error
  }
}

/**
 * Delete a recording from Supabase Storage
 */
export async function deleteRecording(filePath: string): Promise<void> {
  try {
    const { error } = await supabase.storage.from(RECORDINGS_BUCKET).remove([filePath])

    if (error) {
      throw new Error(`Failed to delete recording: ${error.message}`)
    }
  } catch (error) {
    console.error('Error deleting recording:', error)
    throw error
  }
}

/**
 * Get a signed URL for downloading a recording
 */
export async function getRecordingDownloadUrl(
  filePath: string,
  expiresIn: number = 3600
): Promise<string> {
  try {
    const { data, error } = await supabase.storage
      .from(RECORDINGS_BUCKET)
      .createSignedUrl(filePath, expiresIn)

    if (error) {
      throw new Error(`Failed to create signed URL: ${error.message}`)
    }

    return data.signedUrl
  } catch (error) {
    console.error('Error creating signed URL:', error)
    throw error
  }
}

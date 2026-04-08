import { audioBucketName, supabase, supabaseConfigError } from '../lib/supabase'
import type { PlayableTrack, SaveTrackInput, UploadedTrack } from '../types/eq'

const TRACKS_TABLE = 'uploaded_tracks'

type UploadedTrackRow = {
  id: string
  title: string
  original_filename: string
  mime_type: string
  file_size: number
  duration_seconds: number | null
  storage_path: string
  created_at: string
  user_id: string | null
}

const sanitizeFileName = (name: string) =>
  name.replace(/[^a-zA-Z0-9._-]/g, '-').replace(/-+/g, '-')

const mapRowToTrack = (row: UploadedTrackRow): UploadedTrack => ({
  id: row.id,
  title: row.title,
  originalFilename: row.original_filename,
  mimeType: row.mime_type,
  fileSize: row.file_size,
  durationSeconds: row.duration_seconds,
  storagePath: row.storage_path,
  createdAt: row.created_at,
  userId: row.user_id,
})

export const listUploadedTracks = async (): Promise<UploadedTrack[]> => {
  if (!supabase) {
    return []
  }

  const { data, error } = await supabase
    .from(TRACKS_TABLE)
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? []).map((row) => mapRowToTrack(row as UploadedTrackRow))
}

export const saveUploadedTrack = async (
  file: File,
  input: SaveTrackInput,
): Promise<UploadedTrack> => {
  if (!supabase) {
    throw new Error(supabaseConfigError ?? 'Supabase is not configured.')
  }

  const fileName = sanitizeFileName(file.name)
  const storagePath = `${Date.now()}-${fileName}`

  const { error: uploadError } = await supabase.storage
    .from(audioBucketName)
    .upload(storagePath, file, {
      cacheControl: '3600',
      contentType: file.type,
      upsert: false,
    })

  if (uploadError) {
    throw new Error(uploadError.message)
  }

  const { data, error } = await supabase
    .from(TRACKS_TABLE)
    .insert({
      title: input.title,
      original_filename: file.name,
      mime_type: file.type,
      file_size: file.size,
      duration_seconds: input.durationSeconds,
      storage_path: storagePath,
      user_id: null,
    })
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return mapRowToTrack(data as UploadedTrackRow)
}

export const getPlayableTrack = async (id: string): Promise<PlayableTrack> => {
  if (!supabase) {
    throw new Error(supabaseConfigError ?? 'Supabase is not configured.')
  }

  const { data, error } = await supabase
    .from(TRACKS_TABLE)
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    throw new Error(error.message)
  }

  const row = data as UploadedTrackRow
  const { data: signedData, error: signedError } = await supabase.storage
    .from(audioBucketName)
    .createSignedUrl(row.storage_path, 60 * 60)

  if (signedError || !signedData?.signedUrl) {
    throw new Error(signedError?.message ?? 'Unable to create playback URL.')
  }

  return {
    ...mapRowToTrack(row),
    playbackUrl: signedData.signedUrl,
  }
}

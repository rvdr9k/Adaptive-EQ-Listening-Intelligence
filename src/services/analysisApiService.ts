type BackendHealthResponse = {
  status?: string
  service?: string
  version?: string
}

export type TrackAnalysisResult = {
  trackId: string
  summary: string
  eqRecommendation: string
  tempoBpmEstimate: number
  energyLevel: string
  updatedAt: string
}

export type BackendHealthState = {
  status: 'checking' | 'online' | 'offline'
  message: string
}

const defaultApiUrl = 'http://127.0.0.1:8000'

const getApiBaseUrl = () => {
  const fromEnv = import.meta.env.VITE_ANALYSIS_API_URL as string | undefined
  return (fromEnv ?? defaultApiUrl).replace(/\/+$/, '')
}

const mapAnalysisPayload = (payload: Record<string, unknown>): TrackAnalysisResult => ({
  trackId: String(payload.track_id ?? ''),
  summary: String(payload.summary ?? ''),
  eqRecommendation: String(payload.eq_recommendation ?? ''),
  tempoBpmEstimate: Number(payload.tempo_bpm_estimate ?? 0),
  energyLevel: String(payload.energy_level ?? ''),
  updatedAt: String(payload.updated_at ?? ''),
})

export const getInitialBackendHealth = (): BackendHealthState => ({
  status: 'checking',
  message: 'Checking analysis backend...',
})

export const fetchBackendHealth = async (): Promise<BackendHealthState> => {
  const controller = new AbortController()
  const timeoutId = window.setTimeout(() => controller.abort(), 4000)

  try {
    const response = await fetch(`${getApiBaseUrl()}/health`, {
      method: 'GET',
      signal: controller.signal,
    })

    if (!response.ok) {
      return {
        status: 'offline',
        message: `Backend unavailable (HTTP ${response.status}).`,
      }
    }

    const payload = (await response.json()) as BackendHealthResponse
    const serviceLabel = payload.service ?? 'Analysis API'

    return {
      status: 'online',
      message: `${serviceLabel} is online.`,
    }
  } catch {
    return {
      status: 'offline',
      message: 'Backend is offline. Start FastAPI at 127.0.0.1:8000.',
    }
  } finally {
    window.clearTimeout(timeoutId)
  }
}

export const getTrackAnalysis = async (
  trackId: string,
): Promise<TrackAnalysisResult | null> => {
  const response = await fetch(`${getApiBaseUrl()}/analysis/${trackId}`, {
    method: 'GET',
  })

  if (response.status === 404) {
    return null
  }

  if (!response.ok) {
    throw new Error(`Analysis lookup failed (HTTP ${response.status}).`)
  }

  const payload = (await response.json()) as Record<string, unknown>
  return mapAnalysisPayload(payload)
}

export const runTrackAnalysis = async (trackId: string): Promise<TrackAnalysisResult> => {
  const response = await fetch(`${getApiBaseUrl()}/analysis/${trackId}`, {
    method: 'POST',
  })

  if (!response.ok) {
    throw new Error(`Analysis run failed (HTTP ${response.status}).`)
  }

  const payload = (await response.json()) as Record<string, unknown>
  return mapAnalysisPayload(payload)
}

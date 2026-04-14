type BackendHealthResponse = {
  status?: string
  service?: string
  version?: string
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

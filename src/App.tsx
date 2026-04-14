import { useEffect, useState } from 'react'
import { DashboardView } from './features/dashboard/DashboardView'
import { HistoryInsightsView } from './features/history/HistoryInsightsView'
import { LandingPage } from './features/landing/LandingPage'
import { AudioPlayerView } from './features/player/AudioPlayerView'
import { supabaseConfigError } from './lib/supabase'
import {
  fetchBackendHealth,
  getInitialBackendHealth,
  type BackendHealthState,
} from './services/analysisApiService'
import { getDashboardSummary, getHistoryInsights, getPlayerState } from './services/mockEqService'
import { getPlayableTrack, listUploadedTracks } from './services/uploadedTracksService'
import { AppShell } from './shared/AppShell'
import type {
  DashboardSummary,
  HistoryInsights,
  PlayableTrack,
  PlayerState,
  ScreenId,
  UploadedTrack,
} from './types/eq'

type AppDataState = {
  dashboard: DashboardSummary | null
  history: HistoryInsights | null
  player: PlayerState | null
}

const initialState: AppDataState = {
  dashboard: null,
  history: null,
  player: null,
}

const validRoutes: ScreenId[] = ['intro', 'dashboard', 'player', 'history']

const getRouteFromHash = (): ScreenId => {
  const route = window.location.hash.replace('#/', '') || 'intro'

  if (validRoutes.includes(route as ScreenId)) {
    return route as ScreenId
  }

  return 'intro'
}

function App() {
  const [activeScreen, setActiveScreen] = useState<ScreenId>(getRouteFromHash)
  const [data, setData] = useState<AppDataState>(initialState)
  const [backendHealth, setBackendHealth] = useState<BackendHealthState>(
    getInitialBackendHealth,
  )
  const [uploadedTracks, setUploadedTracks] = useState<UploadedTrack[]>([])
  const [historyMessage, setHistoryMessage] = useState(supabaseConfigError ?? '')
  const [playerLoadError, setPlayerLoadError] = useState('')
  const [selectedPlayableTrack, setSelectedPlayableTrack] = useState<PlayableTrack | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const handleHashChange = () => {
      setActiveScreen(getRouteFromHash())
    }

    window.addEventListener('hashchange', handleHashChange)

    return () => {
      window.removeEventListener('hashchange', handleHashChange)
    }
  }, [])

  useEffect(() => {
    const checkBackendHealth = async () => {
      const status = await fetchBackendHealth()
      setBackendHealth(status)
    }

    void checkBackendHealth()
  }, [])

  useEffect(() => {
    const loadAppData = async () => {
      const [dashboard, history, player, tracksResult] = await Promise.all([
        getDashboardSummary(),
        getHistoryInsights(),
        getPlayerState(),
        listUploadedTracks()
          .then((tracks) => ({ tracks, error: '' }))
          .catch((error: Error) => ({ tracks: [], error: error.message })),
      ])

      setData({ dashboard, history, player })
      setUploadedTracks(tracksResult.tracks)
      setHistoryMessage((current) => tracksResult.error || current)
      setIsLoading(false)
    }

    void loadAppData()
  }, [])

  const refreshUploadedTracks = async () => {
    try {
      const tracks = await listUploadedTracks()
      setUploadedTracks(tracks)
      setHistoryMessage(supabaseConfigError ?? '')
    } catch (error) {
      setHistoryMessage(
        error instanceof Error ? error.message : 'Unable to load uploaded tracks.',
      )
    }
  }

  const handleOpenTrack = async (trackId: string) => {
    try {
      const track = await getPlayableTrack(trackId)
      setSelectedPlayableTrack(track)
      setPlayerLoadError('')
      window.location.hash = '#/player'
    } catch (error) {
      setPlayerLoadError(
        error instanceof Error ? error.message : 'Unable to load track for playback.',
      )
    }
  }

  if (activeScreen === 'intro') {
    return <LandingPage />
  }

  return (
    <AppShell
      activeScreen={activeScreen}
      backendHealthMessage={backendHealth.message}
      backendHealthStatus={backendHealth.status}
      isLoading={isLoading}
    >
      {activeScreen === 'dashboard' && data.dashboard ? (
        <DashboardView summary={data.dashboard} />
      ) : null}
      {activeScreen === 'player' && data.player ? (
        <AudioPlayerView
          key={selectedPlayableTrack?.playbackUrl ?? 'local-player'}
          onTrackSaved={refreshUploadedTracks}
          openedTrack={selectedPlayableTrack}
          player={data.player}
          playerLoadError={playerLoadError}
        />
      ) : null}
      {activeScreen === 'history' && data.history ? (
        <HistoryInsightsView
          historyMessage={historyMessage}
          onOpenTrack={handleOpenTrack}
          tracks={uploadedTracks}
        />
      ) : null}
    </AppShell>
  )
}

export default App

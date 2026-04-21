import { useEffect, useState } from 'react'
import { DashboardView } from './features/dashboard/DashboardView'
import { HistoryInsightsView } from './features/history/HistoryInsightsView'
import { LandingPage } from './features/landing/LandingPage'
import { AudioPlayerView } from './features/player/AudioPlayerView'
import { supabaseConfigError } from './lib/supabase'
import {
  fetchBackendHealth,
  getTrackAnalysis,
  getInitialBackendHealth,
  runTrackAnalysis,
  type BackendHealthState,
  type TrackAnalysisResult,
} from './services/analysisApiService'
import { getDashboardSummary, getHistoryInsights, getPlayerState } from './services/mockEqService'
import { getPlayableTrack, listUploadedTracks } from './services/uploadedTracksService'
import { AppShell } from './shared/AppShell'
import type {
  DashboardAnalysisStatus,
  DashboardTrackAnalysis,
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
  const [selectedDashboardTrackId, setSelectedDashboardTrackId] = useState('')
  const [analysisStatus, setAnalysisStatus] = useState<DashboardAnalysisStatus>('idle')
  const [analysisMessage, setAnalysisMessage] = useState(
    'Choose a saved track and run analysis.',
  )
  const [analysisResult, setAnalysisResult] = useState<DashboardTrackAnalysis | null>(null)
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
    if (uploadedTracks.length === 0) {
      setSelectedDashboardTrackId('')
      setAnalysisStatus('idle')
      setAnalysisResult(null)
      setAnalysisMessage('Save tracks in Player to run analysis.')
      return
    }

    setSelectedDashboardTrackId((current) =>
      current && uploadedTracks.some((track) => track.id === current)
        ? current
        : uploadedTracks[0]?.id ?? '',
    )
  }, [uploadedTracks])

  useEffect(() => {
    const loadExistingAnalysis = async () => {
      if (!selectedDashboardTrackId) {
        return
      }

      try {
        const result = await getTrackAnalysis(selectedDashboardTrackId)

        if (!result) {
          setAnalysisStatus('idle')
          setAnalysisResult(null)
          setAnalysisMessage('No analysis yet. Click Analyze to generate one.')
          return
        }

        const mappedResult: DashboardTrackAnalysis = {
          trackId: result.trackId,
          summary: result.summary,
          eqRecommendation: result.eqRecommendation,
          tempoBpmEstimate: result.tempoBpmEstimate,
          energyLevel: result.energyLevel,
          updatedAt: result.updatedAt,
        }

        setAnalysisStatus('success')
        setAnalysisResult(mappedResult)
        setAnalysisMessage('Loaded existing analysis for this track.')
      } catch (error) {
        setAnalysisStatus('error')
        setAnalysisResult(null)
        setAnalysisMessage(
          error instanceof Error ? error.message : 'Unable to fetch analysis.',
        )
      }
    }

    void loadExistingAnalysis()
  }, [selectedDashboardTrackId])

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

  const handleRunAnalysis = async () => {
    if (!selectedDashboardTrackId) {
      setAnalysisStatus('idle')
      setAnalysisResult(null)
      setAnalysisMessage('Select a track first.')
      return
    }

    setAnalysisStatus('loading')
    setAnalysisMessage('Running mock analysis...')

    try {
      const result: TrackAnalysisResult = await runTrackAnalysis(selectedDashboardTrackId)

      setAnalysisStatus('success')
      setAnalysisResult({
        trackId: result.trackId,
        summary: result.summary,
        eqRecommendation: result.eqRecommendation,
        tempoBpmEstimate: result.tempoBpmEstimate,
        energyLevel: result.energyLevel,
        updatedAt: result.updatedAt,
      })
      setAnalysisMessage('Analysis complete.')
    } catch (error) {
      setAnalysisStatus('error')
      setAnalysisResult(null)
      setAnalysisMessage(
        error instanceof Error ? error.message : 'Analysis failed to run.',
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
        <DashboardView
          analysisMessage={analysisMessage}
          analysisResult={analysisResult}
          analysisStatus={analysisStatus}
          onAnalyze={handleRunAnalysis}
          onSelectTrack={setSelectedDashboardTrackId}
          selectedTrackId={selectedDashboardTrackId}
          summary={data.dashboard}
          tracks={uploadedTracks}
        />
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

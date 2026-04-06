import { useEffect, useState } from 'react'
import { DashboardView } from './features/dashboard/DashboardView'
import { HistoryInsightsView } from './features/history/HistoryInsightsView'
import { LandingPage } from './features/landing/LandingPage'
import { AudioPlayerView } from './features/player/AudioPlayerView'
import { getDashboardSummary, getHistoryInsights, getPlayerState } from './services/mockEqService'
import { AppShell } from './shared/AppShell'
import type {
  DashboardSummary,
  HistoryInsights,
  PlayerState,
  ScreenId,
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
    const loadAppData = async () => {
      const [dashboard, history, player] = await Promise.all([
        getDashboardSummary(),
        getHistoryInsights(),
        getPlayerState(),
      ])

      setData({ dashboard, history, player })
      setIsLoading(false)
    }

    void loadAppData()
  }, [])

  if (activeScreen === 'intro') {
    return <LandingPage />
  }

  return (
    <AppShell activeScreen={activeScreen} isLoading={isLoading}>
      {activeScreen === 'dashboard' && data.dashboard ? (
        <DashboardView summary={data.dashboard} />
      ) : null}
      {activeScreen === 'player' && data.player ? (
        <AudioPlayerView player={data.player} />
      ) : null}
      {activeScreen === 'history' && data.history ? (
        <HistoryInsightsView insights={data.history} />
      ) : null}
    </AppShell>
  )
}

export default App

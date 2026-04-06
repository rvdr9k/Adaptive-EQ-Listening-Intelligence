export type ScreenId = 'intro' | 'dashboard' | 'player' | 'history'

export type EQBand = {
  label: string
  frequencyHz: number
  gainDb: number
}

export type EQCurve = {
  presetName: string
  profile: string
  bands: EQBand[]
}

export type DashboardSummary = {
  currentTrack: {
    title: string
    artist: string
    genre: string
    mood: string
    energy: string
    confidence: number
  }
  recommendation: {
    headline: string
    reason: string
    listeningMode: string
  }
  curve: EQCurve
  tags: string[]
  metrics: Array<{
    label: string
    value: string
    detail: string
  }>
}

export type TrackSession = {
  id: string
  title: string
  artist: string
  genre: string
  listenedAt: string
  eqSnapshot: string
  insight: string
  pattern: string | null
}

export type InsightPattern = {
  id: string
  title: string
  description: string
  strength: 'High' | 'Medium' | 'Emerging'
}

export type HistoryInsights = {
  sessions: TrackSession[]
  patterns: InsightPattern[]
}

export type PlayerQueueItem = {
  id: string
  title: string
  artist: string
  durationLabel: string
  isActive?: boolean
}

export type PlayerState = {
  track: {
    title: string
    artist: string
    genre: string
    artworkGradient: string
  }
  playback: {
    elapsedLabel: string
    durationLabel: string
    progressPercent: number
    status: 'Playing' | 'Paused'
  }
  curve: EQCurve
  contextNotes: string[]
  queue: PlayerQueueItem[]
}

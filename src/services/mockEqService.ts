import type {
  DashboardSummary,
  HistoryInsights,
  PlayerState,
} from '../types/eq'

const delay = async () => new Promise((resolve) => setTimeout(resolve, 180))

export const getDashboardSummary = async (): Promise<DashboardSummary> => {
  await delay()

  return {
    currentTrack: {
      title: '',
      artist: '',
      genre: '',
      mood: '',
      energy: '',
      confidence: 0,
    },
    recommendation: {
      headline: '',
      reason: '',
      listeningMode: '',
    },
    curve: {
      presetName: '',
      profile: '',
      bands: [],
    },
    tags: [],
    metrics: [],
  }
}

export const getHistoryInsights = async (): Promise<HistoryInsights> => {
  await delay()

  return {
    sessions: [],
    patterns: [],
  }
}

export const getPlayerState = async (): Promise<PlayerState> => {
  await delay()

  return {
    track: {
      title: '',
      artist: '',
      genre: '',
      artworkGradient:
        'linear-gradient(135deg, rgba(34,34,34,0.95), rgba(20,20,20,0.92) 45%, rgba(9,10,12,0.98))',
    },
    playback: {
      elapsedLabel: '--:--',
      durationLabel: '--:--',
      progressPercent: 0,
      status: 'Paused',
    },
    curve: {
      presetName: '',
      profile: '',
      bands: [],
    },
    contextNotes: [],
    queue: [],
  }
}

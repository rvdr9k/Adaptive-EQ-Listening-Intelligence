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
      title: 'Midnight Atlas',
      artist: 'Neon Harbor',
      genre: 'Synthwave',
      mood: 'Cinematic',
      energy: '76%',
      confidence: 0.91,
    },
    recommendation: {
      headline: 'Warm low-end lift with a restrained presence boost',
      reason:
        'The current track leans bright in the upper mids, so the suggested curve balances body and keeps the vocal edge controlled.',
      listeningMode: 'Night Drive Profile',
    },
    curve: {
      presetName: 'Velvet Pulse',
      profile: 'Adaptive recommendation',
      bands: [
        { label: '32 Hz', frequencyHz: 32, gainDb: 1.8 },
        { label: '64 Hz', frequencyHz: 64, gainDb: 2.4 },
        { label: '125 Hz', frequencyHz: 125, gainDb: 1.1 },
        { label: '500 Hz', frequencyHz: 500, gainDb: -0.6 },
        { label: '2 kHz', frequencyHz: 2000, gainDb: -1.0 },
        { label: '8 kHz', frequencyHz: 8000, gainDb: 1.2 },
      ],
    },
    tags: ['Late-night listening', 'Wide stereo image', 'Vocals kept smooth'],
    metrics: [
      {
        label: 'Genre',
        value: 'Synthwave',
        detail: 'Detected from repeated texture and tempo cues',
      },
      {
        label: 'Mood',
        value: 'Cinematic',
        detail: 'Pads and reverb tails dominate the current mix',
      },
      {
        label: 'Energy',
        value: '76%',
        detail: 'Steady drive with moderate transient emphasis',
      },
    ],
  }
}

export const getHistoryInsights = async (): Promise<HistoryInsights> => {
  await delay()

  return {
    sessions: [
      {
        id: 'session-1',
        title: 'Static Bloom',
        artist: 'Aurora District',
        genre: 'Dream Pop',
        listenedAt: 'Today · 8:40 PM',
        eqSnapshot: 'Soft bass lift, dipped 2 kHz, air boost',
        insight: 'You preferred a softer top end while preserving shimmer.',
        pattern: 'Recurring treble smoothing on vocal-led tracks',
      },
      {
        id: 'session-2',
        title: 'Chrome Hearts',
        artist: 'Voltage Avenue',
        genre: 'Electro Pop',
        listenedAt: 'Yesterday · 11:15 PM',
        eqSnapshot: 'Sub-bass push, slight low-mid cleanup',
        insight: 'Dance-oriented songs trend toward stronger punch below 80 Hz.',
        pattern: 'Frequent bass-forward tuning on upbeat electronic songs',
      },
      {
        id: 'session-3',
        title: 'Dustlight',
        artist: 'Paper Skies',
        genre: 'Indie Rock',
        listenedAt: 'Sat · 6:05 PM',
        eqSnapshot: 'Presence cut, upper bass support',
        insight: 'You consistently reduce harshness when guitars dominate the mix.',
        pattern: null,
      },
    ],
    patterns: [
      {
        id: 'pattern-1',
        title: 'Bass confidence rises with electronic genres',
        description:
          'Across recent sessions, synth-driven tracks were matched with stronger low-frequency boosts and tighter mids.',
        strength: 'High',
      },
      {
        id: 'pattern-2',
        title: 'Upper-mid restraint on dense mixes',
        description:
          'Songs with stacked vocals or guitars repeatedly received a gentle 2 kHz to 4 kHz reduction.',
        strength: 'Medium',
      },
      {
        id: 'pattern-3',
        title: 'Cinematic moods pair with wider, softer curves',
        description:
          'Atmospheric listening sessions lean toward warm lows and a lighter high-end polish.',
        strength: 'Emerging',
      },
    ],
  }
}

export const getPlayerState = async (): Promise<PlayerState> => {
  await delay()

  return {
    track: {
      title: 'Afterglow Circuit',
      artist: 'Signal Youth',
      genre: 'Alt Electronica',
      artworkGradient:
        'linear-gradient(135deg, rgba(39,188,118,0.95), rgba(24,24,24,0.92) 45%, rgba(9,10,12,0.98))',
    },
    playback: {
      elapsedLabel: '02:14',
      durationLabel: '04:48',
      progressPercent: 47,
      status: 'Playing',
    },
    curve: {
      presetName: 'Glass Horizon',
      profile: 'Playback-ready preview',
      bands: [
        { label: '60', frequencyHz: 60, gainDb: 2.0 },
        { label: '150', frequencyHz: 150, gainDb: 0.8 },
        { label: '400', frequencyHz: 400, gainDb: -0.4 },
        { label: '1k', frequencyHz: 1000, gainDb: -0.8 },
        { label: '4k', frequencyHz: 4000, gainDb: 0.6 },
        { label: '10k', frequencyHz: 10000, gainDb: 1.5 },
      ],
    },
    contextNotes: [
      'Bass is slightly lifted to give the groove more weight.',
      'Upper mids are held back to keep the vocal texture smooth.',
      'High frequencies stay open for a bright, airy finish.',
    ],
    queue: [
      {
        id: 'track-1',
        title: 'Afterglow Circuit',
        artist: 'Signal Youth',
        durationLabel: '4:48',
        isActive: true,
      },
      {
        id: 'track-2',
        title: 'Velvet Decoder',
        artist: 'Night Arcade',
        durationLabel: '3:54',
      },
      {
        id: 'track-3',
        title: 'Heat Mirage',
        artist: 'Nova Static',
        durationLabel: '5:11',
      },
      {
        id: 'track-4',
        title: 'Blue Current',
        artist: 'The Monochords',
        durationLabel: '4:03',
      },
    ],
  }
}

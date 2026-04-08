import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import { saveUploadedTrack } from '../../services/uploadedTracksService'
import type { PlayableTrack, PlayerState } from '../../types/eq'

type AudioPlayerViewProps = {
  onTrackSaved: () => Promise<void>
  openedTrack: PlayableTrack | null
  player: PlayerState
  playerLoadError?: string
}

const SUPPORTED_AUDIO_TYPES = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg']

const formatTime = (value: number) => {
  if (!Number.isFinite(value) || value < 0) {
    return '--:--'
  }

  const minutes = Math.floor(value / 60)
  const seconds = Math.floor(value % 60)

  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

const getInitialTrackState = (
  player: PlayerState,
  openedTrack: PlayableTrack | null,
) =>
  openedTrack
    ? {
        ...player.track,
        title: openedTrack.title,
        artist: 'Saved upload',
        genre: 'Cloud track',
      }
    : player.track

const getInitialPlaybackState = (
  player: PlayerState,
  openedTrack: PlayableTrack | null,
) =>
  openedTrack
    ? {
        elapsedLabel: '0:00',
        durationLabel:
          openedTrack.durationSeconds !== null ? formatTime(openedTrack.durationSeconds) : '--:--',
        progressPercent: 0,
        status: 'Paused' as const,
      }
    : player.playback

export function AudioPlayerView({
  onTrackSaved,
  openedTrack,
  player,
  playerLoadError,
}: AudioPlayerViewProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [status, setStatus] = useState<'Playing' | 'Paused'>(
    openedTrack ? 'Paused' : player.playback.status,
  )
  const [selectedTrack, setSelectedTrack] = useState(() =>
    getInitialTrackState(player, openedTrack),
  )
  const [playback, setPlayback] = useState(() =>
    getInitialPlaybackState(player, openedTrack),
  )
  const [selectedFileName, setSelectedFileName] = useState(
    openedTrack?.originalFilename ?? '',
  )
  const [localFile, setLocalFile] = useState<File | null>(null)
  const [audioSource, setAudioSource] = useState<string | null>(
    openedTrack?.playbackUrl ?? null,
  )
  const [audioSourceKind, setAudioSourceKind] = useState<'object' | 'remote' | null>(
    openedTrack ? 'remote' : null,
  )
  const [fileError, setFileError] = useState('')
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'success' | 'error'>(
    openedTrack ? 'success' : 'idle',
  )
  const [saveMessage, setSaveMessage] = useState(
    openedTrack ? 'Loaded from cloud history.' : '',
  )
  const hasTrack = Boolean(selectedTrack.title)
  const hasCurve = player.curve.bands.length > 0

  useEffect(() => {
    return () => {
      if (audioSource && audioSourceKind === 'object') {
        URL.revokeObjectURL(audioSource)
      }
    }
  }, [audioSource, audioSourceKind])

  const resetPlaybackState = () => {
    setStatus('Paused')
    setPlayback({
      elapsedLabel: '0:00',
      durationLabel: '--:--',
      progressPercent: 0,
      status: 'Paused',
    })
  }

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    if (!SUPPORTED_AUDIO_TYPES.includes(file.type)) {
      setFileError('Please choose an MP3, WAV, or OGG audio file.')
      event.target.value = ''
      return
    }

    if (audioSource && audioSourceKind === 'object') {
      URL.revokeObjectURL(audioSource)
    }

    const nextUrl = URL.createObjectURL(file)

    setFileError('')
    setSaveState('idle')
    setSaveMessage('')
    setLocalFile(file)
    setSelectedFileName(file.name)
    setAudioSource(nextUrl)
    setAudioSourceKind('object')
    resetPlaybackState()
    setSelectedTrack({
      ...player.track,
      title: file.name.replace(/\.[^/.]+$/, ''),
      artist: 'Local file',
      genre: 'Uploaded audio',
    })

    event.target.value = ''
  }

  const handleTogglePlayback = async () => {
    if (!audioRef.current || !audioSource) {
      return
    }

    if (audioRef.current.paused) {
      await audioRef.current.play()
      setStatus('Playing')
      setPlayback((current) => ({ ...current, status: 'Playing' }))
      return
    }

    audioRef.current.pause()
    setStatus('Paused')
    setPlayback((current) => ({ ...current, status: 'Paused' }))
  }

  const handleSave = async () => {
    if (!localFile) {
      return
    }

    setSaveState('saving')
    setSaveMessage('Saving track to cloud...')

    try {
      const durationSeconds =
        playback.durationLabel !== '--:--' && audioRef.current
          ? Math.round(audioRef.current.duration)
          : null

      await saveUploadedTrack(localFile, {
        title: selectedTrack.title || localFile.name.replace(/\.[^/.]+$/, ''),
        durationSeconds,
      })

      setSaveState('success')
      setSaveMessage('Track saved successfully.')
      await onTrackSaved()
    } catch (error) {
      setSaveState('error')
      setSaveMessage(
        error instanceof Error ? error.message : 'Unable to save track right now.',
      )
    }
  }

  const handleLoadedMetadata = () => {
    if (!audioRef.current) {
      return
    }

    const duration = audioRef.current.duration

    setPlayback((current) => ({
      ...current,
      durationLabel: formatTime(duration),
    }))
  }

  const handleTimeUpdate = () => {
    if (!audioRef.current) {
      return
    }

    const currentTime = audioRef.current.currentTime
    const duration = audioRef.current.duration
    const progressPercent =
      Number.isFinite(duration) && duration > 0 ? (currentTime / duration) * 100 : 0

    setPlayback((current) => ({
      ...current,
      elapsedLabel: formatTime(currentTime),
      durationLabel: formatTime(duration),
      progressPercent,
    }))
  }

  const handleEnded = () => {
    setStatus('Paused')
    setPlayback((current) => ({
      ...current,
      elapsedLabel: '0:00',
      progressPercent: 0,
      status: 'Paused',
    }))

    if (audioRef.current) {
      audioRef.current.currentTime = 0
    }
  }

  return (
    <section className="spotify-page">
      <div className="spotify-main">
        <article className="spotify-hero">
          <div
            className={`spotify-cover${hasTrack ? '' : ' spotify-cover--empty'}`}
            style={{ backgroundImage: selectedTrack.artworkGradient }}
          >
            <span>Now playing</span>
            <strong>{hasTrack ? selectedTrack.genre : 'Nothing playing'}</strong>
          </div>

          <div className="spotify-details">
            <span className="eyebrow">Audio Player</span>
            <h2>{hasTrack ? selectedTrack.title : 'No track selected'}</h2>
            <p className="subtle-copy">
              {hasTrack ? selectedTrack.artist : 'Add audio to start playback.'}
            </p>

            <label className="upload-control" htmlFor="audio-upload">
              <span>Choose audio file</span>
              <input
                accept=".mp3,.wav,.ogg,audio/mpeg,audio/wav,audio/ogg"
                id="audio-upload"
                onChange={handleFileChange}
                type="file"
              />
            </label>
            {selectedFileName ? <p className="upload-meta">{selectedFileName}</p> : null}
            {fileError ? <p className="upload-error">{fileError}</p> : null}
            {playerLoadError ? <p className="upload-error">{playerLoadError}</p> : null}

            <div className="player-pills">
              <span className="pill">{status}</span>
              <span className={`pill pill--status pill--${saveState}`}>{saveState}</span>
            </div>

            <div className="progress-shell progress-shell--large">
              <div
                className="progress-bar"
                style={{ width: `${playback.progressPercent}%` }}
              />
            </div>
            <div className="time-row">
              <span>{playback.elapsedLabel}</span>
              <span>{playback.durationLabel}</span>
            </div>

            <div className="control-row">
              <button className="ghost-button ghost-button--round" disabled type="button">
                PREV
              </button>
              <button
                className="primary-button primary-button--round"
                disabled={!audioSource}
                onClick={() => void handleTogglePlayback()}
                type="button"
              >
                {status === 'Playing' ? 'PAUSE' : 'PLAY'}
              </button>
              <button
                className="ghost-button"
                disabled={!localFile || saveState === 'saving'}
                onClick={() => void handleSave()}
                type="button"
              >
                {saveState === 'saving' ? 'Saving...' : 'Save'}
              </button>
            </div>
            {saveMessage ? <p className="upload-meta">{saveMessage}</p> : null}

            <audio
              ref={audioRef}
              onEnded={handleEnded}
              onLoadedMetadata={handleLoadedMetadata}
              onTimeUpdate={handleTimeUpdate}
              src={audioSource ?? undefined}
            />
          </div>
        </article>

        <article className="card spotify-card">
          <div className="card-header">
            <div>
              <span className="eyebrow">EQ snapshot</span>
              <h3>{hasCurve ? player.curve.profile : 'No EQ data yet'}</h3>
            </div>
          </div>
          {hasCurve ? (
            <>
              <div className="mini-band-grid mini-band-grid--wide">
                {player.curve.bands.map((band) => (
                  <div className="mini-band" key={band.label}>
                    <span>{band.label}</span>
                    <strong>
                      {band.gainDb > 0 ? '+' : ''}
                      {band.gainDb.toFixed(1)} dB
                    </strong>
                  </div>
                ))}
              </div>
              <div className="note-stack">
                {player.contextNotes.map((note) => (
                  <p key={note}>{note}</p>
                ))}
              </div>
            </>
          ) : (
            <div className="queue-empty">EQ details will appear here once analysis is added.</div>
          )}
        </article>
      </div>

      <aside className="spotify-sidepanel">
        <div className="card side-card">
          <span className="eyebrow">Up next</span>
          <h3>Queue</h3>
          <div className="queue-empty">Queue support is still empty in this step.</div>
        </div>
      </aside>
    </section>
  )
}

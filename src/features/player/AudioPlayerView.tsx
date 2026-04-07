import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import type { PlayerState } from '../../types/eq'

type AudioPlayerViewProps = {
  player: PlayerState
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

export function AudioPlayerView({ player }: AudioPlayerViewProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [status, setStatus] = useState(player.playback.status)
  const [selectedTrack, setSelectedTrack] = useState(player.track)
  const [playback, setPlayback] = useState(player.playback)
  const [selectedFileName, setSelectedFileName] = useState('')
  const [objectUrl, setObjectUrl] = useState<string | null>(null)
  const [fileError, setFileError] = useState('')
  const hasTrack = Boolean(selectedTrack.title)
  const hasCurve = player.curve.bands.length > 0

  useEffect(() => {
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl)
      }
    }
  }, [objectUrl])

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

    setFileError('')
    setSelectedFileName(file.name)

    if (objectUrl) {
      URL.revokeObjectURL(objectUrl)
    }

    const nextUrl = URL.createObjectURL(file)
    setObjectUrl(nextUrl)
    setStatus('Paused')
    setPlayback({
      elapsedLabel: '0:00',
      durationLabel: '--:--',
      progressPercent: 0,
      status: 'Paused',
    })
    setSelectedTrack({
      ...player.track,
      title: file.name.replace(/\.[^/.]+$/, ''),
      artist: 'Local file',
      genre: 'Uploaded audio',
    })

    event.target.value = ''
  }

  const handleTogglePlayback = async () => {
    if (!audioRef.current || !objectUrl) {
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

            <div className="player-pills">
              <span className="pill">{status}</span>
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
                disabled={!objectUrl}
                onClick={() => void handleTogglePlayback()}
                type="button"
              >
                {status === 'Playing' ? 'PAUSE' : 'PLAY'}
              </button>
              <button className="ghost-button ghost-button--round" disabled type="button">
                NEXT
              </button>
            </div>

            <audio
              ref={audioRef}
              onEnded={handleEnded}
              onLoadedMetadata={handleLoadedMetadata}
              onTimeUpdate={handleTimeUpdate}
              src={objectUrl ?? undefined}
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
            <div className="queue-empty">EQ details will appear here once audio is loaded.</div>
          )}
        </article>
      </div>

      <aside className="spotify-sidepanel">
        <div className="card side-card">
          <span className="eyebrow">Up next</span>
          <h3>Queue</h3>
          {player.queue.length > 0 ? (
            <div className="queue-list">
              {player.queue.map((item) => (
                <div className={`queue-item${item.isActive ? ' is-active' : ''}`} key={item.id}>
                  <div>
                    <strong>{item.title}</strong>
                    <p>{item.artist}</p>
                  </div>
                  <span>{item.durationLabel}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="queue-empty">No songs queued yet.</div>
          )}
        </div>
      </aside>
    </section>
  )
}

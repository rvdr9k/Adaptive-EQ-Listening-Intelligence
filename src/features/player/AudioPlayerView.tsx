import { useState } from 'react'
import type { PlayerState } from '../../types/eq'

type AudioPlayerViewProps = {
  player: PlayerState
}

export function AudioPlayerView({ player }: AudioPlayerViewProps) {
  const [status, setStatus] = useState(player.playback.status)

  return (
    <section className="spotify-page">
      <div className="spotify-main">
        <article className="spotify-hero">
          <div
            className="spotify-cover"
            style={{ backgroundImage: player.track.artworkGradient }}
          >
            <span>Now playing</span>
            <strong>{player.track.genre}</strong>
          </div>

          <div className="spotify-details">
            <span className="eyebrow">Audio Player</span>
            <h2>{player.track.title}</h2>
            <p className="subtle-copy">{player.track.artist}</p>

            <div className="player-pills">
              <span className="pill">Adaptive EQ</span>
              <span className="pill">{player.curve.presetName}</span>
              <span className="pill">{status}</span>
            </div>

            <div className="progress-shell progress-shell--large">
              <div
                className="progress-bar"
                style={{ width: `${player.playback.progressPercent}%` }}
              />
            </div>
            <div className="time-row">
              <span>{player.playback.elapsedLabel}</span>
              <span>{player.playback.durationLabel}</span>
            </div>

            <div className="control-row">
              <button className="ghost-button ghost-button--round" type="button">
                ◀
              </button>
              <button
                className="primary-button primary-button--round"
                onClick={() => setStatus((current) => (current === 'Playing' ? 'Paused' : 'Playing'))}
                type="button"
              >
                {status === 'Playing' ? '❚❚' : '▶'}
              </button>
              <button className="ghost-button ghost-button--round" type="button">
                ▶
              </button>
            </div>
          </div>
        </article>

        <article className="card spotify-card">
          <div className="card-header">
            <div>
              <span className="eyebrow">EQ snapshot</span>
              <h3>{player.curve.profile}</h3>
            </div>
          </div>
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
        </article>
      </div>

      <aside className="spotify-sidepanel">
        <div className="card side-card">
          <span className="eyebrow">Up next</span>
          <h3>Queue</h3>
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
        </div>
      </aside>
    </section>
  )
}

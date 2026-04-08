import type { UploadedTrack } from '../../types/eq'

type HistoryInsightsViewProps = {
  historyMessage?: string
  onOpenTrack: (trackId: string) => void
  tracks: UploadedTrack[]
}

const formatDate = (value: string) =>
  new Date(value).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })

const formatDuration = (durationSeconds: number | null) => {
  if (durationSeconds === null) {
    return 'Unknown duration'
  }

  const minutes = Math.floor(durationSeconds / 60)
  const seconds = Math.floor(durationSeconds % 60)

  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

export function HistoryInsightsView({
  historyMessage,
  onOpenTrack,
  tracks,
}: HistoryInsightsViewProps) {
  return (
    <section className="panel-stack">
      <div className="section-heading">
        <div>
          <span className="eyebrow">History & Insights</span>
          <h2>Saved uploads and cloud-backed playback history</h2>
        </div>
      </div>

      <div className="history-layout">
        <article className="card">
          <div className="card-header">
            <div>
              <span className="eyebrow">Listening history</span>
              <h3>Saved tracks</h3>
            </div>
          </div>

          {tracks.length > 0 ? (
            <div className="session-list">
              {tracks.map((track) => (
                <button
                  className="session-card session-card--button"
                  key={track.id}
                  onClick={() => onOpenTrack(track.id)}
                  type="button"
                >
                  <div className="session-card__top">
                    <div>
                      <strong>{track.title}</strong>
                      <p>{track.originalFilename}</p>
                    </div>
                    <span>{formatDate(track.createdAt)}</span>
                  </div>
                  <div className="tag-row">
                    <span className="tag">{track.mimeType}</span>
                    <span className="tag">{formatDuration(track.durationSeconds)}</span>
                  </div>
                  <p>Click to reopen this saved track in the player.</p>
                </button>
              ))}
            </div>
          ) : (
            <div className="queue-empty">
              {historyMessage || 'Your saved uploads will appear here.'}
            </div>
          )}
        </article>

        <article className="card card-soft">
          <span className="eyebrow">Next layer</span>
          <h3>Insights are still empty</h3>
          <div className="queue-empty">
            This page now stores real uploaded tracks. EQ insights and listening patterns can be added later on top of the same saved history.
          </div>
        </article>
      </div>
    </section>
  )
}

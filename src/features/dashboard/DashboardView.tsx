import type { DashboardSummary } from '../../types/eq'

type DashboardViewProps = {
  summary: DashboardSummary
}

export function DashboardView({ summary }: DashboardViewProps) {
  const hasTrack = Boolean(summary.currentTrack.title)
  const hasCurve = summary.curve.bands.length > 0
  const peak = Math.max(...summary.curve.bands.map((band) => Math.abs(band.gainDb)), 1)

  return (
    <section className="panel-stack">
      <div className="section-heading">
        <div>
          <span className="eyebrow">EQ Dashboard</span>
          <h2>{hasTrack ? summary.currentTrack.title : 'No track loaded'}</h2>
        </div>
        {hasTrack ? (
          <div className="confidence-pill">
            Confidence {(summary.currentTrack.confidence * 100).toFixed(0)}%
          </div>
        ) : null}
      </div>

      <div className="dashboard-grid">
        <article className="card feature-card">
          <div className="card-header">
            <div>
              <span className="eyebrow">Recommended curve</span>
              <h3>{hasCurve ? summary.curve.presetName : 'No EQ recommendation yet'}</h3>
            </div>
            {summary.recommendation.listeningMode ? (
              <span className="subtle-copy">{summary.recommendation.listeningMode}</span>
            ) : null}
          </div>

          {hasCurve ? (
            <>
              <div className="curve-chart" aria-label="EQ curve chart">
                {summary.curve.bands.map((band) => (
                  <div className="curve-chart__column" key={band.label}>
                    <div
                      className={`curve-chart__bar${band.gainDb < 0 ? ' is-negative' : ''}`}
                      style={{ height: `${(Math.abs(band.gainDb) / peak) * 100}%` }}
                    />
                    <span>{band.label}</span>
                    <strong>
                      {band.gainDb > 0 ? '+' : ''}
                      {band.gainDb.toFixed(1)} dB
                    </strong>
                  </div>
                ))}
              </div>

              <p className="recommendation-copy">{summary.recommendation.headline}</p>
              <p className="subtle-copy">{summary.recommendation.reason}</p>
            </>
          ) : (
            <div className="queue-empty">EQ recommendations will appear here after audio is added.</div>
          )}
        </article>

        <article className="card card-soft">
          <span className="eyebrow">Track profile</span>
          <h3>{hasTrack ? summary.currentTrack.artist : 'No track information yet'}</h3>
          {summary.metrics.length > 0 ? (
            <div className="metric-grid">
              {summary.metrics.map((metric) => (
                <div className="metric-card" key={metric.label}>
                  <span>{metric.label}</span>
                  <strong>{metric.value}</strong>
                  <p>{metric.detail}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="queue-empty">Track details will show here once audio is loaded.</div>
          )}
        </article>
      </div>

      <div className="dashboard-grid dashboard-grid--secondary">
        <article className="card">
          <span className="eyebrow">Selected mode</span>
          <h3>{summary.recommendation.listeningMode || 'No mode selected'}</h3>
          <p className="subtle-copy">
            Listening mode details will appear here after analysis is available.
          </p>
        </article>

        <article className="card">
          <span className="eyebrow">Active signals</span>
          {summary.tags.length > 0 ? (
            <div className="tag-row">
              {summary.tags.map((tag) => (
                <span className="tag" key={tag}>
                  {tag}
                </span>
              ))}
            </div>
          ) : (
            <div className="queue-empty">Detected signals will appear here.</div>
          )}
        </article>
      </div>
    </section>
  )
}

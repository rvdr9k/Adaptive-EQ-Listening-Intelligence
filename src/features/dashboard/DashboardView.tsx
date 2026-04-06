import type { DashboardSummary } from '../../types/eq'

type DashboardViewProps = {
  summary: DashboardSummary
}

export function DashboardView({ summary }: DashboardViewProps) {
  const peak = Math.max(...summary.curve.bands.map((band) => Math.abs(band.gainDb)), 1)

  return (
    <section className="panel-stack">
      <div className="section-heading">
        <div>
          <span className="eyebrow">EQ Dashboard</span>
          <h2>{summary.currentTrack.title}</h2>
        </div>
        <div className="confidence-pill">
          Confidence {(summary.currentTrack.confidence * 100).toFixed(0)}%
        </div>
      </div>

      <div className="dashboard-grid">
        <article className="card feature-card">
          <div className="card-header">
            <div>
              <span className="eyebrow">Recommended curve</span>
              <h3>{summary.curve.presetName}</h3>
            </div>
            <span className="subtle-copy">{summary.recommendation.listeningMode}</span>
          </div>

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
        </article>

        <article className="card card-soft">
          <span className="eyebrow">Track profile</span>
          <h3>{summary.currentTrack.artist}</h3>
          <div className="metric-grid">
            {summary.metrics.map((metric) => (
              <div className="metric-card" key={metric.label}>
                <span>{metric.label}</span>
                <strong>{metric.value}</strong>
                <p>{metric.detail}</p>
              </div>
            ))}
          </div>
        </article>
      </div>

      <div className="dashboard-grid dashboard-grid--secondary">
        <article className="card">
          <span className="eyebrow">Selected mode</span>
          <h3>{summary.recommendation.listeningMode}</h3>
          <p className="subtle-copy">
            Tuned to keep the track full in the lows, clean in the mids, and open
            in the highs without over-sharpening the mix.
          </p>
        </article>

        <article className="card">
          <span className="eyebrow">Active signals</span>
          <div className="tag-row">
            {summary.tags.map((tag) => (
              <span className="tag" key={tag}>
                {tag}
              </span>
            ))}
          </div>
        </article>
      </div>
    </section>
  )
}

import type {
  DashboardAnalysisStatus,
  DashboardSummary,
  DashboardTrackAnalysis,
  UploadedTrack,
} from '../../types/eq'

type DashboardViewProps = {
  analysisMessage: string
  analysisResult: DashboardTrackAnalysis | null
  analysisStatus: DashboardAnalysisStatus
  onAnalyze: () => Promise<void>
  onSelectTrack: (trackId: string) => void
  selectedTrackId: string
  summary: DashboardSummary
  tracks: UploadedTrack[]
}

export function DashboardView({
  analysisMessage,
  analysisResult,
  analysisStatus,
  onAnalyze,
  onSelectTrack,
  selectedTrackId,
  summary,
  tracks,
}: DashboardViewProps) {
  const hasTrack = Boolean(summary.currentTrack.title)
  const hasCurve = summary.curve.bands.length > 0
  const peak = Math.max(...summary.curve.bands.map((band) => Math.abs(band.gainDb)), 1)
  const analysisTitle = tracks.find((track) => track.id === selectedTrackId)?.title ?? ''

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
          <span className="eyebrow">Track analysis</span>
          <h3>{analysisTitle || (tracks.length > 0 ? 'Select a saved track' : 'No saved tracks')}</h3>
          {tracks.length > 0 ? (
            <>
              <div className="analysis-controls">
                <select
                  className="analysis-select"
                  onChange={(event) => onSelectTrack(event.target.value)}
                  value={selectedTrackId}
                >
                  <option value="">Choose a saved track</option>
                  {tracks.map((track) => (
                    <option key={track.id} value={track.id}>
                      {track.title}
                    </option>
                  ))}
                </select>
                <div className="analysis-actions">
                  <span className={`pill pill--status pill--${analysisStatus}`}>
                    {analysisStatus}
                  </span>
                  <button
                    className="primary-button"
                    disabled={!selectedTrackId || analysisStatus === 'loading'}
                    onClick={() => void onAnalyze()}
                    type="button"
                  >
                    {analysisStatus === 'loading' ? 'Analyzing...' : 'Analyze'}
                  </button>
                </div>
              </div>
              <p className="subtle-copy analysis-message">{analysisMessage}</p>
            </>
          ) : (
            <div className="queue-empty">Save tracks in Player to run dashboard analysis.</div>
          )}
          {analysisResult ? (
            <div className="analysis-result">
              <div className="analysis-result__copy">
                <p>{analysisResult.summary}</p>
                <p className="subtle-copy">{analysisResult.eqRecommendation}</p>
              </div>
              <div className="tag-row">
                <span className="tag">Tempo {analysisResult.tempoBpmEstimate} BPM</span>
                <span className="tag">{analysisResult.energyLevel}</span>
              </div>
            </div>
          ) : null}
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

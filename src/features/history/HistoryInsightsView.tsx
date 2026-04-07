import type { HistoryInsights } from '../../types/eq'

type HistoryInsightsViewProps = {
  insights: HistoryInsights
}

export function HistoryInsightsView({ insights }: HistoryInsightsViewProps) {
  return (
    <section className="panel-stack">
      <div className="section-heading">
        <div>
          <span className="eyebrow">History & Insights</span>
          <h2>Past songs, EQ choices, and tuning patterns</h2>
        </div>
      </div>

      <div className="history-layout">
        <article className="card">
          <div className="card-header">
            <div>
              <span className="eyebrow">Listening history</span>
              <h3>Recent sessions</h3>
            </div>
          </div>

          {insights.sessions.length > 0 ? (
            <div className="session-list">
              {insights.sessions.map((session) => (
                <div className="session-card" key={session.id}>
                  <div className="session-card__top">
                    <div>
                      <strong>{session.title}</strong>
                      <p>{session.artist}</p>
                    </div>
                    <span>{session.listenedAt}</span>
                  </div>
                  <div className="tag-row">
                    <span className="tag">{session.genre}</span>
                    <span className="tag">{session.eqSnapshot}</span>
                  </div>
                  <p>{session.insight}</p>
                  <div className="pattern-callout">
                    {session.pattern ?? 'Unique tuning session with no repeated pattern flagged.'}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="queue-empty">Your listening history will appear here.</div>
          )}
        </article>

        <article className="card card-soft">
          <span className="eyebrow">Pattern library</span>
          <h3>Cross-session insights</h3>
          {insights.patterns.length > 0 ? (
            <div className="pattern-list">
              {insights.patterns.map((pattern) => (
                <div className="pattern-card" key={pattern.id}>
                  <div className="pattern-card__head">
                    <strong>{pattern.title}</strong>
                    <span>{pattern.strength}</span>
                  </div>
                  <p>{pattern.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="queue-empty">Insights will show up here after listening activity is recorded.</div>
          )}
        </article>
      </div>
    </section>
  )
}

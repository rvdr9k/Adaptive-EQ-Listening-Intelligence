export function LandingPage() {
  return (
    <div className="landing-shell">
      <section className="landing-hero">
        <div className="landing-copy">
          <span className="eyebrow">Adaptive EQ AI</span>
          <h1>A listening app that turns tracks, tuning, and habits into a clear EQ experience.</h1>
          <p>
            Explore a music-style interface with an EQ dashboard, a player inspired by
            modern streaming apps, and a history page that highlights patterns in how
            songs are tuned over time.
          </p>
          <div className="landing-actions">
            <a className="primary-link" href="#/player">
              Enter App
            </a>
            <a className="secondary-link" href="#/dashboard">
              Dashboard
            </a>
          </div>
        </div>

        <div className="landing-showcase">
          <div className="showcase-card">
            <span>EQ Dashboard</span>
            <strong>Curve Intelligence</strong>
          </div>
          <div className="showcase-card">
            <span>Audio Player</span>
            <strong>Current Song and Queue</strong>
          </div>
          <div className="showcase-card">
            <span>History</span>
            <strong>Genre Tuning and Patterns</strong>
          </div>
        </div>
      </section>
    </div>
  )
}

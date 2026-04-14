import type { PropsWithChildren } from 'react'
import type { ScreenId } from '../types/eq'

type AppShellProps = PropsWithChildren<{
  activeScreen: Exclude<ScreenId, 'intro'>
  backendHealthMessage: string
  backendHealthStatus: 'checking' | 'online' | 'offline'
  isLoading: boolean
}>

const navItems: Array<{
  id: Exclude<ScreenId, 'intro'>
  label: string
  description: string
}> = [
  { id: 'dashboard', label: 'Dashboard', description: 'Curve view' },
  { id: 'player', label: 'Player', description: 'Now playing' },
  { id: 'history', label: 'History', description: 'Patterns' },
]

export function AppShell({
  activeScreen,
  backendHealthMessage,
  backendHealthStatus,
  isLoading,
  children,
}: AppShellProps) {
  return (
    <div className="app-frame">
      <aside className="sidebar">
        <a className="brand-block" href="#/intro">
          <span className="brand-mark">EQ</span>
          <div>
            <strong>Adaptive EQ AI</strong>
            <p>Listening intelligence</p>
          </div>
        </a>

        <nav className="sidebar-nav" aria-label="Primary">
          {navItems.map((item) => {
            const isActive = item.id === activeScreen

            return (
              <a
                key={item.id}
                className={`sidebar-link${isActive ? ' is-active' : ''}`}
                href={`#/${item.id}`}
              >
                <strong>{item.label}</strong>
                <span>{item.description}</span>
              </a>
            )
          })}
        </nav>

        <div className="sidebar-card">
          <span className="eyebrow">Session</span>
          <strong>Focused listening</strong>
          <p>Curves, playback, and history stay connected across the app.</p>
        </div>
      </aside>

      <div className="main-shell">
        <header className="topbar">
          <div>
            <span className="eyebrow">Adaptive EQ AI</span>
            <h1>{navItems.find((item) => item.id === activeScreen)?.label}</h1>
          </div>
          <div className="topbar-actions">
            <span className={`backend-chip backend-chip--${backendHealthStatus}`}>
              {backendHealthMessage}
            </span>
            <a className="topbar-chip" href="#/player">
              Open player
            </a>
            <a className="topbar-chip topbar-chip--accent" href="#/history">
              View insights
            </a>
          </div>
        </header>

        <main className="page-shell">
          {isLoading ? <div className="loading-card">Loading your listening workspace...</div> : children}
        </main>
      </div>
    </div>
  )
}

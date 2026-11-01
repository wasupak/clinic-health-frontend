import type { ReactNode } from 'react'
import { branding } from '../config/branding'
import './AppShell.css'

export type AppPage = 'dashboard' | 'patients'

interface AppShellProps {
  activePage: AppPage
  children: ReactNode
  onNavigate: (page: AppPage) => void
}

export function AppShell({ activePage, children, onNavigate }: AppShellProps) {
  return (
    <div className="app-layout">
      <header className="app-header">
        <button type="button" className="brand-button" onClick={() => onNavigate('dashboard')} aria-label="Go to dashboard">
          <img src={branding.logoPath} alt="" className="brand-logo" />
          <span>
            <span className="eyebrow">{branding.applicationName}</span>
            <span className="brand-name">{branding.clinicName}</span>
          </span>
        </button>

        <nav className="top-nav" aria-label="Main navigation">
          <button type="button" className={activePage === 'dashboard' ? 'nav-link active' : 'nav-link'} onClick={() => onNavigate('dashboard')} aria-current={activePage === 'dashboard' ? 'page' : undefined}>
            Dashboard
          </button>
          <button type="button" className={activePage === 'patients' ? 'nav-link active' : 'nav-link'} onClick={() => onNavigate('patients')} aria-current={activePage === 'patients' ? 'page' : undefined}>
            Patients
          </button>
        </nav>
      </header>

      <main className="app-content">{children}</main>
    </div>
  )
}

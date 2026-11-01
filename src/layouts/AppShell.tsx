import type { ReactNode } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { branding } from '../config/branding'
import './AppShell.css'

interface AppShellProps {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="app-layout">
      <header className="app-header">
        <Link to="/dashboard" className="brand-button" aria-label="Go to dashboard">
          <img src={branding.logoPath} alt="" className="brand-logo" />
          <span>
            <span className="eyebrow">{branding.applicationName}</span>
            <span className="brand-name">{branding.clinicName}</span>
          </span>
        </Link>

        <nav className="top-nav" aria-label="Main navigation">
          <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            Dashboard
          </NavLink>
          <NavLink to="/patients" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            Patients
          </NavLink>
        </nav>
      </header>

      <main className="app-content">{children}</main>
    </div>
  )
}

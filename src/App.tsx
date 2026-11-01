import { useEffect, useState } from 'react'
import { branding } from './config/branding'
import { AppShell, type AppPage } from './layouts/AppShell'
import { DashboardPage } from './pages/DashboardPage'
import { PatientsPage } from './pages/PatientsPage'
import './App.css'

function App() {
  const [activePage, setActivePage] = useState<AppPage>('patients')

  useEffect(() => {
    document.title = branding.documentTitle
  }, [])

  return (
    <AppShell activePage={activePage} onNavigate={setActivePage}>
      {activePage === 'dashboard' ? <DashboardPage /> : <PatientsPage />}
    </AppShell>
  )
}

export default App

import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { branding } from './config/branding'
import { AppShell } from './layouts/AppShell'
import { DashboardPage } from './pages/DashboardPage'
import { PatientDetailPage } from './pages/PatientDetailPage'
import { PatientsPage } from './pages/PatientsPage'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
          <Route path="/" element={<Navigate to="/patients" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/patients" element={<PatientsPage />} />
          <Route path="/patients/:patientHn" element={<PatientDetailPage />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  )
}

document.title = branding.documentTitle

export default App

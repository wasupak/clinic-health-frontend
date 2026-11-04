import { useEffect, useState } from 'react'
import { fetchDashboardSummary, type DashboardSummary } from '../api/dashboard'
import { VitalCoverageChart } from '../components/dashboard/VitalCoverageChart'
import { VitalFrequencyChart } from '../components/dashboard/VitalFrequencyChart'

export function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboardSummary()
      .then(setSummary)
      .catch((requestError: unknown) => {
        setError(requestError instanceof Error ? requestError.message : 'Unable to load dashboard')
      })
  }, [])

  return (
    <section className="dashboard-page" aria-labelledby="dashboard-heading">
      <p className="eyebrow">Overview</p>
      <h1 id="dashboard-heading">Dashboard</h1>
      {error && <p className="state-message state-error" role="alert">{error}</p>}
      {!summary && !error && <p className="state-message">Loading dashboard…</p>}
      {summary && (
        <>
          <div className="summary-grid dashboard-summary-grid">
            <article className="summary-card"><p>Active patients</p><strong>{summary.totalActivePatients}</strong><span>Current active patient list</span></article>
            <article className="summary-card"><p>Vital coverage</p><strong>{summary.patientsWithVitalsLast30Days} / {summary.totalActivePatients}</strong><span>Patients with Vital in 30 days</span></article>
            <article className="summary-card"><p>Average interval</p><strong>{summary.averageDaysBetweenVitals === null ? '—' : `${summary.averageDaysBetweenVitals} days`}</strong><span>Between recorded Vital dates</span></article>
          </div>
          <div className="chart-grid dashboard-chart-grid">
            <VitalCoverageChart summary={summary} />
            <VitalFrequencyChart summary={summary} />
          </div>
        </>
      )}
    </section>
  )
}

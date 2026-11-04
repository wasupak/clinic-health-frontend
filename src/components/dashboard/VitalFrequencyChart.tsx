import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { DashboardSummary } from '../../api/dashboard'

export function VitalFrequencyChart({ summary }: { summary: DashboardSummary }) {
  return (
    <article className="chart-card dashboard-chart-card">
      <h2>Vital submission frequency</h2>
      <p className="chart-description">Patients grouped by their average interval between recorded Vital dates.</p>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={summary.frequencyBuckets} margin={{ top: 8, right: 12, left: 0, bottom: 32 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="label" angle={-18} textAnchor="end" interval={0} height={60} />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="count" name="Patients" fill="#0ea5e9" radius={[5, 5, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </article>
  )
}

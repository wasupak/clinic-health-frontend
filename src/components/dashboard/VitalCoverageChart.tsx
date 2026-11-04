import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import type { DashboardSummary } from '../../api/dashboard'

const colors = ['#2563eb', '#cbd5e1']

export function VitalCoverageChart({ summary }: { summary: DashboardSummary }) {
  const data = [
    { name: 'With Vital in last 30 days', value: summary.patientsWithVitalsLast30Days },
    { name: 'No Vital in last 30 days', value: summary.patientsWithoutVitalsLast30Days },
  ]

  return (
    <article className="chart-card dashboard-chart-card">
      <h2>Vital coverage</h2>
      <p className="chart-description">Active patients with at least one Vital record in the last 30 days.</p>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={70} outerRadius={100} paddingAngle={3} label={({ value }) => value}>
            {data.map((entry, index) => <Cell key={entry.name} fill={colors[index]} />)}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </article>
  )
}

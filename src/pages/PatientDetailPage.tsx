import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { format, subDays } from 'date-fns'
import { th } from 'date-fns/locale/th'
import { useNavigate, useParams } from 'react-router-dom'
import Select from 'react-select'
import { fetchPatients, type Patient } from '../api/patients'
import { fetchVitalRecords, type VitalRecord } from '../api/vitals'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const toNumber = (value: number | string | null) => (value === null ? null : Number(value))

function toDateKey(value: string) {
  return value.slice(0, 10)
}

export function PatientDetailPage() {
  const { patientHn = '' } = useParams()
  const navigate = useNavigate()
  const [patients, setPatients] = useState<Patient[]>([])
  const [records, setRecords] = useState<VitalRecord[]>([])
  const [range, setRange] = useState<[Date | null, Date | null]>(() => [
    subDays(new Date(), 29),
    new Date(),
  ])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPatients()
      .then(setPatients)
      .catch(() => setError('Unable to load patients'))
  }, [])

  useEffect(() => {
    if (!patientHn) return

    setIsLoading(true)
    fetchVitalRecords(patientHn)
      .then(setRecords)
      .catch((requestError: unknown) => {
        setError(requestError instanceof Error ? requestError.message : 'Unable to load vital records')
      })
      .finally(() => setIsLoading(false))
  }, [patientHn])

  const patient = patients.find((item) => item.patientHn === patientHn)
  const selectedOption = patient
    ? { value: patient.patientHn, label: `${patient.patientHn} - ${patient.firstName ?? ''} ${patient.lastName ?? ''}`.trim() }
    : null

  const filteredRecords = useMemo(() => {
    const [start, end] = range
    const startKey = start ? format(start, 'yyyy-MM-dd') : null
    const endKey = end ? format(end, 'yyyy-MM-dd') : null

    return records.filter((record) => {
      const dateKey = toDateKey(record.recordedAt)
      return (!startKey || dateKey >= startKey) && (!endKey || dateKey <= endKey)
    })
  }, [range, records])

  const orderedRecords = [...filteredRecords].sort((a, b) => b.recordedAt.localeCompare(a.recordedAt))
  const latest = orderedRecords[0]

  const average = (values: Array<number | null>) => {
    const available = values.filter((value): value is number => value !== null)
    return available.length ? available.reduce((sum, value) => sum + value, 0) / available.length : null
  }

  const avgWeight = average(filteredRecords.map((record) => toNumber(record.weightKg)))
  const avgPulse = average(filteredRecords.map((record) => record.pulseBpm))
  const avgSystolic = average(filteredRecords.map((record) => record.systolic))
  const avgDiastolic = average(filteredRecords.map((record) => record.diastolic))

  const chartRecords = [...filteredRecords].sort((a, b) => a.recordedAt.localeCompare(b.recordedAt))
  const vitalChartData = chartRecords.map((record) => ({
    date: format(new Date(record.recordedAt), 'dd/MM'),
    systolic: record.systolic,
    diastolic: record.diastolic,
    pulse: record.pulseBpm,
  }))
  const weightChartData = chartRecords.map((record) => ({
    date: format(new Date(record.recordedAt), 'dd/MM'),
    weight: toNumber(record.weightKg),
  }))
  const fluidChartData = chartRecords.map((record) => ({
    date: format(new Date(record.recordedAt), 'dd/MM'),
    intake: toNumber(record.fluidIntakeMl),
    output: toNumber(record.urineOutputMl),
  }))

  return (
    <section className="patient-detail-page">
      <button type="button" className="back-link" onClick={() => navigate('/patients')}>
        ← Back to patients
      </button>

      <div className="detail-toolbar">
        <div>
          <p className="eyebrow">Patient health profile</p>
          <h1>{patient ? `${patient.firstName ?? ''} ${patient.lastName ?? ''}`.trim() : patientHn}</h1>
        </div>
        <Select
          className="patient-select"
          value={selectedOption}
          options={patients.map((item) => ({ value: item.patientHn, label: `${item.patientHn} - ${item.firstName ?? ''} ${item.lastName ?? ''}`.trim() }))}
          onChange={(option) => option && navigate(`/patients/${option.value}`)}
          placeholder="Select patient..."
          isSearchable
        />
      </div>

      <div className="detail-filter-row">
        <span className="filter-label">Recorded date range</span>
        <DatePicker
          selectsRange
          startDate={range[0]}
          endDate={range[1]}
          onChange={(dates) => setRange(dates)}
          dateFormat="dd/MM/yyyy"
          locale={th}
          isClearable
          placeholderText="All recorded dates"
        />
      </div>

      {error && <p className="state-message state-error" role="alert">{error}</p>}
      {isLoading && <p className="state-message">Loading vital records…</p>}

      {!isLoading && !error && (
        <>
          <div className="summary-grid">
            <SummaryCard label="Blood pressure" latest={latest?.systolic && latest?.diastolic ? `${latest.systolic}/${latest.diastolic} mmHg` : '—'} average={avgSystolic && avgDiastolic ? `${Math.round(avgSystolic)}/${Math.round(avgDiastolic)} mmHg` : '—'} />
            <SummaryCard label="Pulse" latest={latest?.pulseBpm ? `${latest.pulseBpm} bpm` : '—'} average={avgPulse ? `${Math.round(avgPulse)} bpm` : '—'} />
            <SummaryCard label="Body weight" latest={toNumber(latest?.weightKg ?? null)?.toFixed(1) ?? '—'} average={avgWeight ? `${avgWeight.toFixed(1)} kg` : '—'} />
            <SummaryCard label="Records" latest={`${filteredRecords.length}`} average={latest ? `Last: ${format(new Date(latest.recordedAt), 'dd/MM/yyyy')}` : '—'} />
          </div>

          <div className="chart-grid">
            <ChartCard title="Vital Signs Trend">
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={vitalChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="systolic" name="Systolic" stroke="#ef4444" connectNulls />
                  <Line type="monotone" dataKey="diastolic" name="Diastolic" stroke="#3b82f6" connectNulls />
                  <Line type="monotone" dataKey="pulse" name="Pulse" stroke="#22c55e" connectNulls />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Body Weight Trend">
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={weightChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="weight" name="Weight (kg)" stroke="#f59e0b" connectNulls />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Fluid Balance Trend">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={fluidChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="intake" name="Intake (ml)" fill="#3b82f6" />
                  <Bar dataKey="output" name="Output (ml)" fill="#94a3b8" />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          <div className="content-card detail-table-card">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Recorded measurements</p>
                <h2>Detail</h2>
              </div>
            </div>
            {filteredRecords.length === 0 ? (
              <p className="state-message">No records found for the selected date range.</p>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr><th>Recorded date</th><th>Weight</th><th>BP</th><th>Pulse</th><th>Fluid intake</th><th>Urine output</th></tr>
                  </thead>
                  <tbody>
                    {chartRecords.map((record) => (
                      <tr key={record.id}>
                        <td>{format(new Date(record.recordedAt), 'dd/MM/yyyy')}</td>
                        <td>{toNumber(record.weightKg)?.toFixed(1) ?? '—'}</td>
                        <td>{record.systolic && record.diastolic ? `${record.systolic}/${record.diastolic}` : '—'}</td>
                        <td>{record.pulseBpm ?? '—'}</td>
                        <td>{toNumber(record.fluidIntakeMl) ?? '—'}</td>
                        <td>{toNumber(record.urineOutputMl) ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </section>
  )
}

function SummaryCard({ label, latest, average }: { label: string; latest: string; average: string }) {
  return <article className="summary-card"><p>{label}</p><strong>{latest}</strong><span>Average: {average}</span></article>
}

function ChartCard({ title, children }: { title: string; children: ReactNode }) {
  return <article className="chart-card"><h2>{title}</h2>{children}</article>
}

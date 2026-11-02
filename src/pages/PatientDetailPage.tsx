import { useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { format, subDays } from 'date-fns'
import { th } from 'date-fns/locale/th'
import { toPng } from 'html-to-image'
import { useNavigate, useParams } from 'react-router-dom'
import Select from 'react-select'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { fetchPatients, type Patient } from '../api/patients'
import { fetchVitalRecords, type VitalRecord } from '../api/vitals'
import { icons } from '../config/icons'
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
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [shareError, setShareError] = useState<string | null>(null)
  const reportRef = useRef<HTMLElement | null>(null)
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

  const exportSummaryImage = async () => {
    if (!reportRef.current) return

    setIsExporting(true)
    await new Promise((resolve) => requestAnimationFrame(resolve))

    try {
      const dataUrl = await toPng(reportRef.current, {
        cacheBust: true,
        pixelRatio: 1.5,
        backgroundColor: '#f8fafc',
      })
      setPreviewUrl(dataUrl)
    } catch {
      setError('Unable to create PNG preview')
    } finally {
      setIsExporting(false)
    }
  }

  const downloadPreview = () => {
    if (!previewUrl) return

    const link = document.createElement('a')
    link.download = `patient-${patientHn}-summary.png`
    link.href = previewUrl
    link.click()
  }

  const sharePreview = async () => {
    if (!previewUrl || !navigator.share) {
      setShareError('This browser does not support image sharing. Use Download PNG instead.')
      return
    }

    try {
      const response = await fetch(previewUrl)
      const blob = await response.blob()
      const file = new File([blob], `patient-${patientHn}-summary.png`, { type: 'image/png' })

      if (navigator.canShare && !navigator.canShare({ files: [file] })) {
        setShareError('This browser cannot share image files. Use Download PNG instead.')
        return
      }

      await navigator.share({
        title: `Patient ${patientHn} summary`,
        files: [file],
      })
    } catch (shareRequestError: unknown) {
      if (shareRequestError instanceof DOMException && shareRequestError.name === 'AbortError') return
      setShareError('Unable to share this image. Use Download PNG instead.')
    }
  }

  const formattedRange = `${range[0] ? format(range[0], 'dd/MM/yyyy') : 'All'} - ${range[1] ? format(range[1], 'dd/MM/yyyy') : 'dates'}`

  return (
    <section ref={reportRef} className={`patient-detail-page export-image-area${isExporting ? ' exporting' : ''}`}>
      <button type="button" className="back-link" onClick={() => navigate('/patients')}>
        <FontAwesomeIcon icon={icons.back} aria-hidden="true" />
        Back to patients
      </button>

      <div className="detail-toolbar">
        <div>
          <p className="eyebrow">Patient health profile</p>
          <h1>{patient ? `${patient.firstName ?? ''} ${patient.lastName ?? ''}`.trim() : patientHn}</h1>
        </div>
        <div className="detail-actions export-controls">
          <Select
            className="patient-select"
            value={selectedOption}
            options={patients.map((item) => ({ value: item.patientHn, label: `${item.patientHn} - ${item.firstName ?? ''} ${item.lastName ?? ''}`.trim() }))}
            onChange={(option) => option && navigate(`/patients/${option.value}`)}
            placeholder="Select patient..."
            isSearchable
            classNamePrefix="patient-select"
          />
          <button type="button" className="button primary" onClick={exportSummaryImage} disabled={isExporting}>
            <FontAwesomeIcon icon={icons.exportImage} aria-hidden="true" />
            {isExporting ? 'Preparing…' : 'Export PNG'}
          </button>
        </div>
      </div>

      <p className="export-only export-date-range">Recorded date range: {formattedRange}</p>

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
                    {orderedRecords.map((record) => (
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

      {previewUrl && (
        <div className="modal-backdrop" role="presentation">
          <section className="export-preview-modal" role="dialog" aria-modal="true" aria-labelledby="export-preview-heading">
            <div className="modal-heading">
              <div>
                <p className="eyebrow">Patient report</p>
                <h2 id="export-preview-heading">PNG preview</h2>
              </div>
              <button type="button" className="icon-button" onClick={() => setPreviewUrl(null)} aria-label="Close preview"><FontAwesomeIcon icon={icons.close} /></button>
            </div>
            <div className="export-preview-image-wrap">
              <img src={previewUrl} alt={`Patient ${patientHn} report preview`} className="export-preview-image" />
            </div>
            <div className="form-actions">
              <button type="button" className="button secondary" onClick={() => setPreviewUrl(null)}>Cancel</button>
              <button type="button" className="button secondary" onClick={sharePreview}><FontAwesomeIcon icon={icons.share} aria-hidden="true" />Share</button>
              <button type="button" className="button primary" onClick={downloadPreview}><FontAwesomeIcon icon={icons.download} aria-hidden="true" />Download PNG</button>
            </div>
            {shareError && <p className="form-error" role="alert">{shareError}</p>}
          </section>
        </div>
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

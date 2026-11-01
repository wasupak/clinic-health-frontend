import { useState, type FormEvent } from 'react'
import DatePicker from 'react-datepicker'
import { format } from 'date-fns'
import { th } from 'date-fns/locale/th'
import 'react-datepicker/dist/react-datepicker.css'
import { createVitalRecord, type CreateVitalRecordInput } from '../api/vitals'
import type { Patient } from '../api/patients'

interface VitalRecordFormProps {
  patient: Patient
  onCancel: () => void
  onCreated: () => void
}

export function VitalRecordForm({ patient, onCancel, onCreated }: VitalRecordFormProps) {
  const [recordedAt, setRecordedAt] = useState(() => new Date())
  const [weightKg, setWeightKg] = useState('')
  const [systolic, setSystolic] = useState('')
  const [diastolic, setDiastolic] = useState('')
  const [pulseBpm, setPulseBpm] = useState('')
  const [fluidIntakeMl, setFluidIntakeMl] = useState('')
  const [urineOutputMl, setUrineOutputMl] = useState('')
  const [shortnessOfBreath, setShortnessOfBreath] = useState(false)
  const [chestPain, setChestPain] = useState(false)
  const [otherSymptoms, setOtherSymptoms] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const numberOrUndefined = (value: string) =>
    value.trim() === '' ? undefined : Number(value)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSaving(true)
    setError(null)

    const input: CreateVitalRecordInput = {
      recordedAt: format(recordedAt, 'yyyy-MM-dd'),
      weightKg: numberOrUndefined(weightKg),
      systolic: numberOrUndefined(systolic),
      diastolic: numberOrUndefined(diastolic),
      pulseBpm: numberOrUndefined(pulseBpm),
      fluidIntakeMl: numberOrUndefined(fluidIntakeMl),
      urineOutputMl: numberOrUndefined(urineOutputMl),
      shortnessOfBreath,
      chestPain,
      otherSymptoms: otherSymptoms.trim() || undefined,
    }

    try {
      await createVitalRecord(patient.patientHn, input)
      onCreated()
    } catch (requestError: unknown) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to save vital record')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="vital-form-heading">
        <div className="modal-heading">
          <div>
            <p className="eyebrow">{patient.patientHn}</p>
            <h2 id="vital-form-heading">Add vital record</h2>
          </div>
          <button type="button" className="icon-button" onClick={onCancel} aria-label="Close form">
            ×
          </button>
        </div>

        <p className="modal-patient-name">
          {[patient.firstName, patient.lastName].filter(Boolean).join(' ') || 'Unnamed patient'}
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <label>
              Measurement date
              <DatePicker
                selected={recordedAt}
                onChange={(date) => date && setRecordedAt(date)}
                dateFormat="dd/MM/yyyy"
                locale={th}
                maxDate={new Date()}
                placeholderText="DD/MM/YYYY"
                required
              />
            </label>
            <label>
              Weight (kg)
              <input type="number" min="0" step="0.01" value={weightKg} onChange={(event) => setWeightKg(event.target.value)} />
            </label>
            <label>
              Systolic
              <input type="number" min="0" max="300" value={systolic} onChange={(event) => setSystolic(event.target.value)} />
            </label>
            <label>
              Diastolic
              <input type="number" min="0" max="300" value={diastolic} onChange={(event) => setDiastolic(event.target.value)} />
            </label>
            <label>
              Pulse (bpm)
              <input type="number" min="0" max="300" value={pulseBpm} onChange={(event) => setPulseBpm(event.target.value)} />
            </label>
            <label>
              Fluid intake (ml)
              <input type="number" min="0" step="0.01" value={fluidIntakeMl} onChange={(event) => setFluidIntakeMl(event.target.value)} />
            </label>
            <label>
              Urine output (ml)
              <input type="number" min="0" step="0.01" value={urineOutputMl} onChange={(event) => setUrineOutputMl(event.target.value)} />
            </label>
          </div>

          <div className="checkbox-row">
            <label><input type="checkbox" checked={shortnessOfBreath} onChange={(event) => setShortnessOfBreath(event.target.checked)} /> Shortness of breath</label>
            <label><input type="checkbox" checked={chestPain} onChange={(event) => setChestPain(event.target.checked)} /> Chest pain</label>
          </div>

          <label>
            Other symptoms
            <textarea value={otherSymptoms} onChange={(event) => setOtherSymptoms(event.target.value)} rows={3} />
          </label>

          {error && <p className="form-error" role="alert">{error}</p>}

          <div className="form-actions">
            <button type="button" className="button secondary" onClick={onCancel} disabled={isSaving}>Cancel</button>
            <button type="submit" className="button primary" disabled={isSaving}>
              {isSaving ? 'Saving…' : 'Save vital'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

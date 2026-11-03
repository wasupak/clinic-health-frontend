import { useEffect, useState, type FormEvent } from 'react'
import DatePicker from 'react-datepicker'
import { format } from 'date-fns'
import { th } from 'date-fns/locale/th'
import 'react-datepicker/dist/react-datepicker.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { createPatient, deletePatient, fetchDoctors, updatePatient, type Diagnosis, type Doctor, type Patient } from '../api/patients'
import { icons } from '../config/icons'

interface PatientFormModalProps {
  patient: Patient | null
  onCancel: () => void
  onSaved: () => void
  onDeleted: () => void
}

const genders = [
  { value: '', label: 'Not specified' },
  { value: 'MALE', label: 'Male' },
  { value: 'FEMALE', label: 'Female' },
  { value: 'OTHER', label: 'Other' },
]

export function PatientFormModal({ patient, onCancel, onSaved, onDeleted }: PatientFormModalProps) {
  const isEditing = patient !== null
  const [patientHn, setPatientHn] = useState(patient?.patientHn ?? '')
  const [firstName, setFirstName] = useState(patient?.firstName ?? '')
  const [lastName, setLastName] = useState(patient?.lastName ?? '')
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(patient?.dateOfBirth ? new Date(patient.dateOfBirth) : null)
  const [gender, setGender] = useState(patient?.gender ?? '')
  const [doctorId, setDoctorId] = useState(patient?.doctorId ? String(patient.doctorId) : '')
  const [diagnosis, setDiagnosis] = useState<Diagnosis | ''>(patient?.diagnosis ?? '')
  const [targetBw, setTargetBw] = useState(patient?.targetBw ? String(patient.targetBw) : '')
  const [doseLasix, setDoseLasix] = useState(patient?.doseLasix ?? '')
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDoctors()
      .then(setDoctors)
      .catch(() => setDoctors([]))
  }, [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSaving(true)
    setError(null)

    const input = {
      ...(isEditing ? {} : { patientHn: patientHn.trim() }),
      firstName: firstName.trim() || null,
      lastName: lastName.trim() || null,
      dateOfBirth: dateOfBirth ? format(dateOfBirth, 'yyyy-MM-dd') : null,
      gender: gender || null,
      doctorId: doctorId ? Number(doctorId) : null,
      diagnosis: diagnosis || null,
      targetBw: targetBw ? Number(targetBw) : null,
      doseLasix: doseLasix.trim() || null,
    }

    try {
      if (isEditing && patient) {
        await updatePatient(patient.patientHn, input)
      } else {
        if (!patientHn.trim()) {
          setError('Patient HN is required')
          return
        }
        await createPatient(input)
      }

      onSaved()
    } catch (requestError: unknown) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to save patient')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete() {
    if (!patient) return
    if (!window.confirm(`Deactivate patient ${patient.patientHn}?`)) return

    setIsDeleting(true)
    setError(null)

    try {
      await deletePatient(patient.patientHn)
      onDeleted()
    } catch (requestError: unknown) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to deactivate patient')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal-card patient-form-modal" role="dialog" aria-modal="true" aria-labelledby="patient-form-heading">
        <div className="modal-heading">
          <div>
            <p className="eyebrow">Patient management</p>
            <h2 id="patient-form-heading">{isEditing ? 'Edit patient' : 'Add patient'}</h2>
          </div>
          <button type="button" className="icon-button" onClick={onCancel} aria-label="Close form"><FontAwesomeIcon icon={icons.close} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <label>
              Patient HN
              <input value={patientHn} onChange={(event) => setPatientHn(event.target.value)} disabled={isEditing} required />
            </label>
            <label>
              Gender
              <select value={gender} onChange={(event) => setGender(event.target.value)}>
                {genders.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </label>
            <label>
              First name
              <input value={firstName} onChange={(event) => setFirstName(event.target.value)} />
            </label>
            <label>
              Last name
              <input value={lastName} onChange={(event) => setLastName(event.target.value)} />
            </label>
            <label>
              Doctor
              <select value={doctorId} onChange={(event) => setDoctorId(event.target.value)}>
                <option value="">Not specified</option>
                {doctors.map((doctor) => (
                  <option key={doctor.doctorId} value={doctor.doctorId}>{doctor.doctorName}</option>
                ))}
              </select>
            </label>
            <label>
              Diagnosis
              <select value={diagnosis} onChange={(event) => setDiagnosis(event.target.value as Diagnosis | '')}>
                <option value="">Not specified</option>
                <option value="ICM">ICM</option>
                <option value="DCM">DCM</option>
                <option value="ICM_Post_CBAG">ICM Post CBAG</option>
              </select>
            </label>
            <label>
              Target BW
              <input type="number" min="0" step="1" value={targetBw} onChange={(event) => setTargetBw(event.target.value)} />
            </label>
            <label>
              Lasix dose
              <input value={doseLasix} onChange={(event) => setDoseLasix(event.target.value)} maxLength={50} />
            </label>            
            <label>
              Date of birth
              <DatePicker
                selected={dateOfBirth}
                onChange={setDateOfBirth}
                dateFormat="dd/MM/yyyy"
                locale={th}
                maxDate={new Date()}
                isClearable
                placeholderText="DD/MM/YYYY"
              />
            </label>
          </div>

          {error && <p className="form-error" role="alert">{error}</p>}

          <div className="form-actions">
            {isEditing && <button type="button" className="button danger" onClick={handleDelete} disabled={isSaving || isDeleting}><FontAwesomeIcon icon={icons.archive} aria-hidden="true" />{isDeleting ? 'Deactivating…' : 'Deactivate'}</button>}
            <button type="button" className="button secondary" onClick={onCancel} disabled={isSaving}>Cancel</button>
            <button type="submit" className="button primary" disabled={isSaving || isDeleting}><FontAwesomeIcon icon={icons.save} aria-hidden="true" />{isSaving ? 'Saving…' : 'Save patient'}</button>
          </div>
        </form>
      </section>
    </div>
  )
}

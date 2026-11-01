import { useEffect, useState } from 'react'
import { fetchPatients, type Patient } from '../api/patients'

export function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPatients()
      .then(setPatients)
      .catch((requestError: unknown) => {
        setError(requestError instanceof Error ? requestError.message : 'Unable to load patients')
      })
      .finally(() => setIsLoading(false))
  }, [])

  const formatDate = (date: string | null) => {
    if (!date) return '—'

    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(new Date(date))
  }

  const formatPatientName = (patient: Patient) =>
    [patient.firstName, patient.lastName].filter(Boolean).join(' ') || 'Unnamed patient'

  return (
    <section className="content-card" aria-labelledby="patients-heading">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Patient management</p>
          <h1 id="patients-heading">Patients</h1>
        </div>
        {!isLoading && !error && <span className="count-badge">{patients.length}</span>}
      </div>

      {isLoading && <p className="state-message">Loading patients…</p>}
      {!isLoading && error && <p className="state-message state-error" role="alert">{error}</p>}
      {!isLoading && !error && patients.length === 0 && <p className="state-message">No patients found.</p>}

      {!isLoading && !error && patients.length > 0 && (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th scope="col">Patient HN</th>
                <th scope="col">Name</th>
                <th scope="col">Date of birth</th>
                <th scope="col">Gender</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((patient) => (
                <tr key={patient.id}>
                  <td>{patient.patientHn}</td>
                  <td>{formatPatientName(patient)}</td>
                  <td>{formatDate(patient.dateOfBirth)}</td>
                  <td>{patient.gender ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

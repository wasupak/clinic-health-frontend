import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchPatients, type Patient } from '../api/patients'
import { VitalRecordForm } from '../components/VitalRecordForm'

export function PatientsPage() {
  const navigate = useNavigate()
  const pageSize = 20
  const [patients, setPatients] = useState<Patient[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    fetchPatients()
      .then(setPatients)
      .catch((requestError: unknown) => {
        setError(requestError instanceof Error ? requestError.message : 'Unable to load patients')
      })
      .finally(() => setIsLoading(false))
  }, [])

  const formatPatientName = (patient: Patient) =>
    [patient.firstName, patient.lastName].filter(Boolean).join(' ') || 'Unnamed patient'

  const calculateAge = (dateOfBirth: string | null) => {
    if (!dateOfBirth) return '—'

    const birthDate = new Date(dateOfBirth)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getUTCFullYear()
    const monthDifference = today.getMonth() - birthDate.getUTCMonth()

    if (
      monthDifference < 0 ||
      (monthDifference === 0 && today.getDate() < birthDate.getUTCDate())
    ) {
      age -= 1
    }

    return age >= 0 ? `${age}` : '—'
  }

  const filteredPatients = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    if (!normalizedSearch) return patients

    return patients.filter((patient) =>
      [patient.patientHn, patient.firstName, patient.lastName]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(normalizedSearch),
    )
  }, [patients, searchTerm])

  const totalPages = Math.max(1, Math.ceil(filteredPatients.length / pageSize))
  const paginatedPatients = filteredPatients.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  )

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages)
  }, [currentPage, totalPages])

  return (
    <section className="content-card" aria-labelledby="patients-heading">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Patient management</p>
          <h1 id="patients-heading">Patients</h1>
        </div>
        {!isLoading && !error && <span className="count-badge">{patients.length}</span>}
      </div>

      {!isLoading && !error && (
        <div className="table-toolbar">
          <label className="search-field">
            <span>Search name or HN</span>
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by name or patient HN"
            />
          </label>
          <span className="table-meta">
            {filteredPatients.length} of {patients.length} patients
          </span>
        </div>
      )}

      {isLoading && <p className="state-message">Loading patients…</p>}
      {!isLoading && error && <p className="state-message state-error" role="alert">{error}</p>}
      {!isLoading && !error && patients.length === 0 && <p className="state-message">No patients found.</p>}
      {!isLoading && !error && patients.length > 0 && filteredPatients.length === 0 && (
        <p className="state-message">No patients match your search.</p>
      )}

      {!isLoading && !error && paginatedPatients.length > 0 && (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th scope="col">Patient HN</th>
                <th scope="col">Name</th>
                <th scope="col">Age</th>
                <th scope="col">Gender</th>
                <th scope="col"><span className="visually-hidden">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {paginatedPatients.map((patient) => (
                <tr key={patient.id}>
                  <td><button type="button" className="patient-link" onClick={() => navigate(`/patients/${patient.patientHn}`)}>{patient.patientHn}</button></td>
                  <td><button type="button" className="patient-link" onClick={() => navigate(`/patients/${patient.patientHn}`)}>{formatPatientName(patient)}</button></td>
                  <td>{calculateAge(patient.dateOfBirth)}</td>
                  <td>{patient.gender ?? '—'}</td>
                  <td className="action-cell">
                    <button type="button" className="add-vital-button" onClick={() => setSelectedPatient(patient)} aria-label={`Add vital record for ${formatPatientName(patient)}`}>
                      +
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="pagination" aria-label="Patient list pagination">
            <button
              type="button"
              className="pagination-button"
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span>Page {currentPage} of {totalPages}</span>
            <button
              type="button"
              className="pagination-button"
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {selectedPatient && (
        <VitalRecordForm
          patient={selectedPatient}
          onCancel={() => setSelectedPatient(null)}
          onCreated={() => setSelectedPatient(null)}
        />
      )}
    </section>
  )
}

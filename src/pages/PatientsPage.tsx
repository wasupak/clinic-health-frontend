import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { fetchPatients, type Patient } from '../api/patients'
import { PatientFormModal } from '../components/PatientFormModal'
import { icons } from '../config/icons'
import { VitalRecordForm } from '../components/VitalRecordForm'

type SortKey = 'patientHn' | 'name' | 'age' | 'gender' | 'records'
type SortDirection = 'asc' | 'desc'

export function PatientsPage() {
  const navigate = useNavigate()
  const pageSize = 20
  const [patients, setPatients] = useState<Patient[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null)
  const [isPatientFormOpen, setIsPatientFormOpen] = useState(false)
  const [sortKey, setSortKey] = useState<SortKey>('patientHn')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

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

  const sortedPatients = useMemo(() => {
    const getSortValue = (patient: Patient): string | number | null => {
      switch (sortKey) {
        case 'patientHn':
          return patient.patientHn
        case 'name':
          return formatPatientName(patient)
        case 'age': {
          const age = calculateAge(patient.dateOfBirth)
          return age === '—' ? null : Number(age)
        }
        case 'gender':
          return patient.gender ?? null
        case 'records':
          return patient.recordsCount
      }
    }

    return [...filteredPatients].sort((firstPatient, secondPatient) => {
      const firstValue = getSortValue(firstPatient)
      const secondValue = getSortValue(secondPatient)

      if (firstValue === null && secondValue === null) return 0
      if (firstValue === null) return 1
      if (secondValue === null) return -1

      const comparison = typeof firstValue === 'number' && typeof secondValue === 'number'
        ? firstValue - secondValue
        : String(firstValue).localeCompare(String(secondValue), undefined, { numeric: true, sensitivity: 'base' })

      return sortDirection === 'asc' ? comparison : -comparison
    })
  }, [filteredPatients, sortDirection, sortKey])

  const handleSort = (nextSortKey: SortKey) => {
    if (sortKey === nextSortKey) {
      setSortDirection((direction) => direction === 'asc' ? 'desc' : 'asc')
      return
    }

    setSortKey(nextSortKey)
    setSortDirection('asc')
  }

  const sortIndicator = (column: SortKey) => {
    if (sortKey !== column) return '↕'
    return sortDirection === 'asc' ? '↑' : '↓'
  }

  const totalPages = Math.max(1, Math.ceil(filteredPatients.length / pageSize))
  const paginatedPatients = sortedPatients.slice(
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
        <div className="section-heading-actions">
          {!isLoading && !error && <span className="count-badge">{patients.length}</span>}
          <button type="button" className="button primary" onClick={() => { setEditingPatient(null); setIsPatientFormOpen(true) }}>
            <FontAwesomeIcon icon={icons.addPatient} aria-hidden="true" />
            Add patient
          </button>
        </div>
      </div>

      {!isLoading && !error && (
        <div className="table-toolbar">
          <label className="search-field">
            <span>Search name or HN</span>
            <div className="search-input-wrapper">
              <FontAwesomeIcon icon={icons.search} aria-hidden="true" />
              <input type="search" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search by name or patient HN" />
            </div>
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
                <th scope="col" aria-sort={sortKey === 'patientHn' ? sortDirection === 'asc' ? 'ascending' : 'descending' : 'none'}><button type="button" className="sort-header-button" onClick={() => handleSort('patientHn')}>Patient HN <span aria-hidden="true">{sortIndicator('patientHn')}</span></button></th>
                <th scope="col" aria-sort={sortKey === 'name' ? sortDirection === 'asc' ? 'ascending' : 'descending' : 'none'}><button type="button" className="sort-header-button" onClick={() => handleSort('name')}>Name <span aria-hidden="true">{sortIndicator('name')}</span></button></th>
                <th scope="col" aria-sort={sortKey === 'age' ? sortDirection === 'asc' ? 'ascending' : 'descending' : 'none'}><button type="button" className="sort-header-button" onClick={() => handleSort('age')}>Age <span aria-hidden="true">{sortIndicator('age')}</span></button></th>
                <th scope="col" aria-sort={sortKey === 'gender' ? sortDirection === 'asc' ? 'ascending' : 'descending' : 'none'}><button type="button" className="sort-header-button" onClick={() => handleSort('gender')}>Gender <span aria-hidden="true">{sortIndicator('gender')}</span></button></th>
                <th scope="col" aria-sort={sortKey === 'records' ? sortDirection === 'asc' ? 'ascending' : 'descending' : 'none'}><button type="button" className="sort-header-button" onClick={() => handleSort('records')}>Records (30 days) <span aria-hidden="true">{sortIndicator('records')}</span></button></th>
                <th scope="col"><span className="visually-hidden">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {paginatedPatients.map((patient) => (
                <tr key={patient.id}>
                  <td>
                    <div className="patient-hn-cell">
                      <button type="button" className="edit-inline-button" onClick={() => { setEditingPatient(patient); setIsPatientFormOpen(true) }} aria-label={`Edit patient ${patient.patientHn}`}>
                        <FontAwesomeIcon icon={icons.edit} aria-hidden="true" />
                      </button>
                      <button type="button" className="patient-link" onClick={() => navigate(`/patients/${patient.patientHn}`)}>{patient.patientHn}</button>
                    </div>
                  </td>
                  <td><button type="button" className="patient-link" onClick={() => navigate(`/patients/${patient.patientHn}`)}>{formatPatientName(patient)}</button></td>
                  <td>{calculateAge(patient.dateOfBirth)}</td>
                  <td>{patient.gender ?? '—'}</td>
                  <td className="records-count-cell">{patient.recordsCount}</td>
                  <td className="action-cell">
                    <div className="row-actions">
                      <button type="button" className="add-vital-button" onClick={() => setSelectedPatient(patient)} aria-label={`Add vital record for ${formatPatientName(patient)}`}>
                        <FontAwesomeIcon icon={icons.add} aria-hidden="true" />
                        Add Vital
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="table-note">Records = vital records recorded during the last 30 days.</p>
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
          onCreated={() => {
            setSelectedPatient(null)
            fetchPatients().then(setPatients)
          }}
        />
      )}

      {isPatientFormOpen && (
        <PatientFormModal
          patient={editingPatient}
          onCancel={() => setIsPatientFormOpen(false)}
          onSaved={() => {
            setIsPatientFormOpen(false)
            fetchPatients().then(setPatients)
          }}
          onDeleted={() => {
            setIsPatientFormOpen(false)
            fetchPatients().then(setPatients)
          }}
        />
      )}
    </section>
  )
}

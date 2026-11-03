export type Diagnosis = 'ICM' | 'DCM' | 'ICM_Post_CBAG'

export interface Patient {
  id: number;
  patientHn: string;
  firstName: string | null;
  lastName: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  isActive: boolean;
  doctorId: number | null;
  doctorName: string | null;
  diagnosis: Diagnosis | null;
  targetBw: number | null;
  doseLasix: string | null;
  recordsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface SavePatientInput {
  patientHn?: string;
  firstName?: string | null;
  lastName?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  doctorId?: number | null;
  diagnosis?: Diagnosis | null;
  targetBw?: number | null;
  doseLasix?: string | null;
}

export interface Doctor {
  doctorId: number;
  doctorName: string;
}

export async function fetchDoctors(): Promise<Doctor[]> {
  const response = await fetch('/api/doctors');

  if (!response.ok) {
    throw new Error(`Unable to load doctors (${response.status})`);
  }

  return response.json() as Promise<Doctor[]>;
}

export async function fetchPatients(): Promise<Patient[]> {
  const response = await fetch('/api/patients');

  if (!response.ok) {
    throw new Error(`Unable to load patients (${response.status})`);
  }

  return response.json() as Promise<Patient[]>;
}

export async function createPatient(input: SavePatientInput): Promise<Patient> {
  const response = await fetch('/api/patients', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(await response.text() || `Unable to create patient (${response.status})`)
  }

  return response.json() as Promise<Patient>
}

export async function updatePatient(patientHn: string, input: SavePatientInput): Promise<Patient> {
  const response = await fetch(`/api/patients/${patientHn}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(await response.text() || `Unable to update patient (${response.status})`)
  }

  return response.json() as Promise<Patient>
}

export async function deletePatient(patientHn: string): Promise<void> {
  const response = await fetch(`/api/patients/${patientHn}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error(await response.text() || `Unable to deactivate patient (${response.status})`)
  }
}

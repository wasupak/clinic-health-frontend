export interface Patient {
  id: number;
  patientHn: string;
  firstName: string | null;
  lastName: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SavePatientInput {
  patientHn?: string;
  firstName?: string | null;
  lastName?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
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

export interface Patient {
  id: number;
  patientHn: string;
  firstName: string | null;
  lastName: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  createdAt: string;
  updatedAt: string;
}

export async function fetchPatients(): Promise<Patient[]> {
  const response = await fetch('/api/patients');

  if (!response.ok) {
    throw new Error(`Unable to load patients (${response.status})`);
  }

  return response.json() as Promise<Patient[]>;
}

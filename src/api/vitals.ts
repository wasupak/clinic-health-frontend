export interface CreateVitalRecordInput {
  recordedAt: string;
  weightKg?: number;
  systolic?: number;
  diastolic?: number;
  pulseBpm?: number;
  fluidIntakeMl?: number;
  urineOutputMl?: number;
  shortnessOfBreath?: boolean;
  chestPain?: boolean;
  otherSymptoms?: string;
}

export interface VitalRecord {
  id: number;
  patientHn: string;
  recordedAt: string;
  weightKg: number | string | null;
  systolic: number | null;
  diastolic: number | null;
  pulseBpm: number | null;
  fluidIntakeMl: number | string | null;
  urineOutputMl: number | string | null;
  shortnessOfBreath: boolean | null;
  chestPain: boolean | null;
  otherSymptoms: string | null;
  createdAt: string;
}

export async function fetchVitalRecords(patientHn: string): Promise<VitalRecord[]> {
  const response = await fetch(`/api/patients/${patientHn}/vitals`)

  if (!response.ok) {
    throw new Error(`Unable to load vital records (${response.status})`)
  }

  return response.json() as Promise<VitalRecord[]>
}

export async function createVitalRecord(
  patientHn: string,
  input: CreateVitalRecordInput,
): Promise<void> {
  const response = await fetch(`/api/patients/${patientHn}/vitals`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Unable to create vital record (${response.status})`);
  }
}

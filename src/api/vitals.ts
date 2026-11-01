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

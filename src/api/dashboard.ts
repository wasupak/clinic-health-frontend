export interface DashboardFrequencyBucket {
  key: string;
  label: string;
  count: number;
}

export interface DashboardSummary {
  totalActivePatients: number;
  patientsWithVitalsLast30Days: number;
  patientsWithoutVitalsLast30Days: number;
  averageDaysBetweenVitals: number | null;
  frequencyBuckets: DashboardFrequencyBucket[];
}

export async function fetchDashboardSummary(): Promise<DashboardSummary> {
  const response = await fetch('/api/dashboard/summary');

  if (!response.ok) {
    throw new Error(`Unable to load dashboard summary (${response.status})`);
  }

  return response.json() as Promise<DashboardSummary>;
}

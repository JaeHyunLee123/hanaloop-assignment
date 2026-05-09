export type GhgEmission = {
  yearMonth: string; // "2025-01","2025-02","2025-03"
  source: string; // gasoline, lpg, diesel, etc
  emissions: number; // tons of CO2 equivalent
};

export type ExtendedGhgEmission = GhgEmission & {
  scope: 1 | 2 | 3;
  pcfStage: 1 | 2 | 3 | 4 | 5;
};

export type Country = {
  name: string;
  code: string;
}

export type Company = {
  id: string;
  name: string;
  country: string; // Country.code
  emissions: ExtendedGhgEmission[];
}

export type Post = {
  id: string;
  title: string;
  resourceUid: string; // Company.id
  dateTime: string; // e.g. "2024-02"
  content: string;
};

export interface DashboardStats {
  totalEmissions: number;
  emissionsByScope: { name: string; value: number }[];
  emissionsByCompany: { name: string; value: number }[];
  emissionsByPcfStage: { name: string; value: number }[];
  emissionsByMonth: { name: string; value: number }[];
  cradleToGatePcf: number;
  cradleToGravePcf: number;
}

export const COLORS = ["#4edea3", "#2a9d8f", "#e9c46a", "#f4a261", "#e76f51", "#8ab4f8"];
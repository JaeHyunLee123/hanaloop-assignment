export type GhgEmission = {
  yearMonth: string; // "2025-01","2025-02","2025-03"
  source: string; // gasoline, lpg, diesel, etc
  emissions: number; // tons of CO2 equivalent
};

export type Country = {
  name: string;
  code: string;
}

export type Company = {
  id: string;
  name: string;
  country: string; // Country.code
  emissions: GhgEmission[];
}

export type Post = {
  id: string;
  title: string;
  resourceUid: string; // Company.id
  dateTime: string; // e.g. "2024-02"
  content: string;
};


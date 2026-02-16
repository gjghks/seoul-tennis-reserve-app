export interface SurfaceInfo {
  type: string;
  count: number | null;
}

export type SurfaceCategory =
  | 'clay'             // 클레이, 앙투카
  | 'artificial_grass' // 인조잔디
  | 'hard'             // 하드코트, 우레탄, 케미칼, 아크릴, 탄성복합고무
  | 'mixed'            // 2종 이상 혼합
  | 'other'
  | 'unknown';

export interface LightingInfo {
  count: number;
  lux: number | null;
}

export interface FacilityEnrichment {
  facilityName: string;
  normalizedName: string;
  district: string;
  address: string | null;
  courtCount: number;
  surfaces: SurfaceInfo[];
  surfaceCategory: SurfaceCategory;
  surfaceDisplay: string;
  area: number;
  siteArea: number;
  builtYear: number | null;
  owner: string | null;
  manager: string | null;
  contact: string | null;
  website: string | null;
  indoorOutdoor: 'indoor' | 'outdoor' | null;
  lighting: LightingInfo | null;
  spectatorSeats: number | null;
  renovation: string | null;
}

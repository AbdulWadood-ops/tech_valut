export interface DeviceSpecText {
  display?: string;
  processor?: string;
  os?: string;
  water_resistance?: string;
  camera_main?: string;
  build_material?: string;
  [key: string]: string | undefined;
}

export interface DeviceSpecNumeric {
  ram_gb?: number;
  storage_gb?: number;
  battery_mah?: number;
  weight_grams?: number;
  screen_size_inches?: number;
  refresh_rate_hz?: number;
  [key: string]: number | undefined;
}

export interface DeviceSpecs {
  text: DeviceSpecText;
  numeric: DeviceSpecNumeric;
}

export interface Device {
  id: string;
  deviceId: string;
  name: string;
  brand: string;
  category: 'Smartphone' | 'Tablet' | 'Smartwatch' | 'Laptop';
  status: 'active' | 'maintenance' | 'offline' | 'updating';
  searchCount: number;
  requestCount: number;
  lastAccessedHoursAgo: number;
  basePrice: number;
  lat: number;
  lng: number;
  specs: DeviceSpecs;
  createdAt: string;
  updatedAt: string;
}

export interface RankedDevice {
  rank: number;
  deviceId: string;
  name: string;
  brand: string;
  category: string;
  score: number;
  searchScore: number;
  requestScore: number;
  recencyScore: number;
  searchCount: number;
  requestCount: number;
  lastAccessedHoursAgo: number;
}

export interface FieldVerificationResult {
  fieldName: string;
  type: 'text' | 'numeric';
  claimedValue: string;
  referenceValue: string;
  similarityScore: number;
  flagged: boolean;
  mismatchReason: string;
}

export interface VerificationReport {
  engine: string;
  executionTimeMs: number;
  deviceId: string;
  deviceName: string;
  overallConfidence: number;
  totalChecked: number;
  flaggedCount: number;
  verified: boolean;
  fields: FieldVerificationResult[];
  semanticAnalysis?: {
    summary: string;
    actionItems: string[];
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  };
}

export interface CursorPaginatedResponse<T> {
  devices: T[];
  nextCursor: string | null;
  totalCount: number;
  page: number;
  limit: number;
  source: 'redis-cache' | 'database';
  latencyMs: number;
}

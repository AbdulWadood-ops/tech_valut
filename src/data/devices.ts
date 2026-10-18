export interface DeviceSpecs {
  technology?: string;
  bands5g?: string;
  dimensions?: string;
  weight?: string;
  build?: string;
  sim?: string;
  resistance?: string;
  displayTypeSize?: string;
  protection?: string;
  peakBrightness?: string;
  pixelDensity?: string;
  chipset?: string;
  gpu?: string;
  os?: string;
  ram?: string;
  storageVariants?: string;
  cardSlot?: string;
  mainCamera?: string;
  selfieCamera?: string;
  video?: string;
  capacity?: string;
  wiredCharging?: string;
  wirelessCharging?: string;
  wifi?: string;
  bluetooth?: string;
  nfcUsb?: string;
  sensors?: string;
  colors?: string;
  releaseDate?: string;
}

export interface DevicePerformance {
  cpuScore: number;
  cpuPercent: number;
  gpuScore: number;
  gpuPercent: number;
  batteryLife: string;
  batteryPercent: number;
  antutuScore: string;
  antutuPercent: number;
}

export interface Device {
  id: string;
  name: string;
  brand: string;
  category: 'mobiles' | 'laptops' | 'watches' | 'earbuds' | 'tablets';
  image: string;
  price: string;
  rating: number;
  specs: DeviceSpecs;
  rawSpecs?: string;
  description?: string;
  performance: DevicePerformance;
  buyUrl?: string;
  buyLink?: string;
  buy_url?: string;
  buy_link?: string;
  buyLinks?: string[] | Record<string, string>;
}

/**
 * Checks whether a device has a valid, non-empty buy link configured in its data.
 */
export function hasBuyLink(device?: Partial<Device> | null): boolean {
  if (!device) return false;
  const anyDev = device as any;
  const link = anyDev.buyUrl || anyDev.buyLink || anyDev.buy_url || anyDev.buy_link;
  if (typeof link === 'string' && link.trim().length > 0) return true;
  if (Array.isArray(anyDev.buyLinks) && anyDev.buyLinks.length > 0) {
    return anyDev.buyLinks.some((l: unknown) => typeof l === 'string' && l.trim().length > 0);
  }
  if (anyDev.buyLinks && typeof anyDev.buyLinks === 'object') {
    return Object.values(anyDev.buyLinks).some((l: unknown) => typeof l === 'string' && (l as string).trim().length > 0);
  }
  return false;
}

/**
 * Extracts the primary buy URL for a device if available.
 */
export function getBuyLink(device?: Partial<Device> | null): string | null {
  if (!device) return null;
  const anyDev = device as any;
  const link = anyDev.buyUrl || anyDev.buyLink || anyDev.buy_url || anyDev.buy_link;
  if (typeof link === 'string' && link.trim().length > 0) return link.trim();
  if (Array.isArray(anyDev.buyLinks) && anyDev.buyLinks.length > 0) {
    const first = anyDev.buyLinks.find((l: unknown) => typeof l === 'string' && l.trim().length > 0);
    if (first) return (first as string).trim();
  }
  if (anyDev.buyLinks && typeof anyDev.buyLinks === 'object') {
    const first = (Object.values(anyDev.buyLinks) as string[]).find(l => typeof l === 'string' && l.trim().length > 0);
    if (first) return first.trim();
  }
  return null;
}

export interface DeviceReview {
  id: string;
  name?: string;
  pros: string[];
  cons: string[];
  reviews: any[];
}

export interface NewsArticle {
  _id?: string;
  title: string;
  slug: string;
  type: 'news' | 'review';
  link: string;
  summary: string;
  image: string;
  source: string;
  publishedAt: Date | string;
  deviceId: string | null;
  createdAt: Date | string;
}

// Export empty array to maintain backward compatibility with imports if any are left
export const devices: Device[] = [];



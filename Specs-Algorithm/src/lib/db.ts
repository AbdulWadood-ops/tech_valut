import { Device } from './types';

// Global device store holding 15,000 devices in memory (acting as MongoDB primary source)
const globalForDB = global as unknown as {
  devicesStore?: Device[];
};

const BRANDS = ['Apple', 'Samsung', 'Google', 'OnePlus', 'Xiaomi', 'Sony', 'Motorola', 'Asus'];
const CATEGORIES: Array<Device['category']> = ['Smartphone', 'Tablet', 'Smartwatch', 'Laptop'];
const STATUSES: Array<Device['status']> = ['active', 'maintenance', 'offline', 'updating'];

const BASE_SPECS = [
  {
    name: 'Pro Max Extreme',
    text: {
      display: '6.7-inch Super Retina XDR OLED 120Hz ProMotion HDR10+',
      processor: 'Octa-core 3.4GHz 3nm Bionic Processor',
      os: 'v18.1 Enterprise Secure OS',
      water_resistance: 'IP68 water & dust resistant (6m for 30 min)',
      camera_main: '48MP f/1.78 main sensor with sensor-shift OIS',
      build_material: 'Titanium aerospace frame with Ceramic Glass front',
    },
    numeric: {
      ram_gb: 12,
      storage_gb: 512,
      battery_mah: 4850,
      weight_grams: 221,
      screen_size_inches: 6.7,
      refresh_rate_hz: 120,
    },
  },
  {
    name: 'Ultra Vision',
    text: {
      display: '6.8-inch Dynamic AMOLED 2X 120Hz QHD+ Vision Booster',
      processor: 'Snapdragon 8 Gen 3 for Galaxy (4nm)',
      os: 'OneUI 6.1 on Android 14',
      water_resistance: 'IP68 certified water resistant',
      camera_main: '200MP f/1.7 wide lens with Laser AF',
      build_material: 'Armor Aluminum 2.0 with Gorilla Glass Armor',
    },
    numeric: {
      ram_gb: 16,
      storage_gb: 1024,
      battery_mah: 5000,
      weight_grams: 232,
      screen_size_inches: 6.8,
      refresh_rate_hz: 120,
    },
  },
  {
    name: 'Core Edge Lite',
    text: {
      display: '6.4-inch FHD+ OLED 90Hz',
      processor: 'Tensor G3 AI Neural Chip',
      os: 'Pure OS 14 with 7 years security updates',
      water_resistance: 'IP67 water protection',
      camera_main: '50MP f/1.85 Octa-PD Quad Bayer',
      build_material: 'Recycled Aluminum housing with Matte back',
    },
    numeric: {
      ram_gb: 8,
      storage_gb: 128,
      battery_mah: 4400,
      weight_grams: 187,
      screen_size_inches: 6.4,
      refresh_rate_hz: 90,
    },
  },
];

function generateDataset(count = 15000): Device[] {
  const devices: Device[] = [];
  const now = new Date();

  for (let i = 1; i <= count; i++) {
    const brand = BRANDS[i % BRANDS.length];
    const category = CATEGORIES[i % CATEGORIES.length];
    const baseSpec = BASE_SPECS[i % BASE_SPECS.length];
    const status = STATUSES[i % STATUSES.length];

    // Geographic coordinates centered around major hubs (London, New York, Tokyo, Berlin, Sydney)
    const latBase = [40.7128, 51.5074, 35.6762, 52.5200, -33.8688, 37.7749, 1.3521][i % 7];
    const lngBase = [-74.0060, -0.1278, 139.6503, 13.4050, 151.2093, -122.4194, 103.8198][i % 7];
    const latOffset = ((i * 37) % 1000 - 500) / 2500;
    const lngOffset = ((i * 73) % 1000 - 500) / 2500;

    const searchCount = (i * 137 % 6500) + 15;
    const requestCount = (i * 251 % 4200) + 8;
    const lastAccessedHoursAgo = ((i * 19) % 240) * 0.4;
    const basePrice = 299 + (i % 12) * 90;

    devices.push({
      id: `dev-${i.toString().padStart(6, '0')}`,
      deviceId: `DEV-${i.toString().padStart(6, '0')}`,
      name: `${brand} ${baseSpec.name} ${category} (v${(i % 5) + 1})`,
      brand,
      category,
      status,
      searchCount,
      requestCount,
      lastAccessedHoursAgo,
      basePrice,
      lat: Number((latBase + latOffset).toFixed(6)),
      lng: Number((lngBase + lngOffset).toFixed(6)),
      specs: {
        text: { ...baseSpec.text },
        numeric: {
          ...baseSpec.numeric,
          ram_gb: baseSpec.numeric.ram_gb + ((i % 3) * 4),
          storage_gb: baseSpec.numeric.storage_gb * (((i % 3) === 2) ? 2 : 1),
        },
      },
      createdAt: new Date(now.getTime() - (i * 3600000)).toISOString(),
      updatedAt: new Date(now.getTime() - (lastAccessedHoursAgo * 3600000)).toISOString(),
    });
  }

  return devices;
}

export function getDevicesDB(): Device[] {
  if (!globalForDB.devicesStore) {
    console.log('[DB] Seeding 15,000 devices into primary data store...');
    globalForDB.devicesStore = generateDataset(15000);
  }
  return globalForDB.devicesStore;
}

export function getDeviceById(id: string): Device | undefined {
  const all = getDevicesDB();
  return all.find((d) => d.id === id || d.deviceId === id);
}

export function updateDeviceStatus(id: string, status: Device['status']): Device | null {
  const all = getDevicesDB();
  const index = all.findIndex((d) => d.id === id || d.deviceId === id);
  if (index === -1) return null;
  all[index] = {
    ...all[index],
    status,
    updatedAt: new Date().toISOString(),
  };
  return all[index];
}

export function resetDevicesDB(): Device[] {
  globalForDB.devicesStore = generateDataset(15000);
  return globalForDB.devicesStore;
}

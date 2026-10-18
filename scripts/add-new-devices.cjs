const fs = require('fs');
const path = require('path');

const brandsDir = path.join(__dirname, '..', 'src', 'data', 'brands');

// Hand-curated list of the newest 2024/2025 devices that might be missing
const NEW_DEVICES = [
  {
    brand: "Apple",
    name: "iPhone 16 Pro",
    category: "mobiles",
    image: "apple-iphone-16-pro",
    price: "$999",
    rating: 4.8,
    specs: {
      technology: "GSM / CDMA / HSPA / EVDO / LTE / 5G",
      dimensions: "149.6 x 71.5 x 8.3 mm",
      weight: "199 g",
      displayTypeSize: "LTPO Super Retina XDR OLED, 6.3 inches",
      chipset: "Apple A18 Pro (3 nm)",
      os: "iOS 18",
      ram: "8 GB",
      storageVariants: "128GB / 256GB / 512GB / 1TB",
      mainCamera: "48MP + 48MP + 12MP",
      selfieCamera: "12MP",
      capacity: "3582 mAh",
      releaseDate: "Sep 2024"
    },
    performance: {
      cpuScore: 10500,
      cpuPercent: 93,
      gpuScore: 13000,
      gpuPercent: 92,
      batteryLife: "105",
      batteryPercent: 88,
      antutuScore: "1.65M",
      antutuPercent: 90
    }
  },
  {
    brand: "Samsung",
    name: "Galaxy S24",
    category: "mobiles",
    image: "samsung-galaxy-s24",
    price: "$799",
    rating: 4.6,
    specs: {
      technology: "GSM / CDMA / HSPA / EVDO / LTE / 5G",
      dimensions: "147 x 70.6 x 7.6 mm",
      weight: "167 g",
      displayTypeSize: "Dynamic LTPO AMOLED 2X, 6.2 inches",
      chipset: "Snapdragon 8 Gen 3 / Exynos 2400",
      os: "Android 14, One UI 6.1",
      ram: "8 GB",
      storageVariants: "128GB / 256GB / 512GB",
      mainCamera: "50MP + 10MP + 12MP",
      selfieCamera: "12MP",
      capacity: "4000 mAh",
      releaseDate: "Jan 2024"
    },
    performance: {
      cpuScore: 9800,
      cpuPercent: 86,
      gpuScore: 12500,
      gpuPercent: 88,
      batteryLife: "98",
      batteryPercent: 82,
      antutuScore: "1.55M",
      antutuPercent: 86
    }
  },
  {
    brand: "Xiaomi",
    name: "14 Pro",
    category: "mobiles",
    image: "xiaomi-14-pro",
    price: "$850",
    rating: 4.7,
    specs: {
      technology: "GSM / CDMA / HSPA / CDMA2000 / LTE / 5G",
      dimensions: "161.4 x 75.3 x 8.5 mm",
      weight: "223 g",
      displayTypeSize: "LTPO AMOLED, 6.73 inches",
      chipset: "Snapdragon 8 Gen 3 (4 nm)",
      os: "Android 14, HyperOS",
      ram: "12 GB / 16 GB",
      storageVariants: "256GB / 512GB / 1TB",
      mainCamera: "50MP + 50MP + 50MP",
      selfieCamera: "32MP",
      capacity: "4880 mAh",
      releaseDate: "Nov 2023"
    },
    performance: {
      cpuScore: 9900,
      cpuPercent: 87,
      gpuScore: 12800,
      gpuPercent: 89,
      batteryLife: "110",
      batteryPercent: 85,
      antutuScore: "1.98M",
      antutuPercent: 96
    }
  },
  {
    brand: "Vivo",
    name: "X100 Pro",
    category: "mobiles",
    image: "vivo-x100-pro",
    price: "$950",
    rating: 4.7,
    specs: {
      technology: "GSM / CDMA / HSPA / LTE / 5G",
      dimensions: "164.1 x 75.3 x 8.9 mm",
      weight: "221 g",
      displayTypeSize: "LTPO AMOLED, 6.78 inches",
      chipset: "Mediatek Dimensity 9300 (4 nm)",
      os: "Android 14, Funtouch 14",
      ram: "12 GB / 16 GB",
      storageVariants: "256GB / 512GB / 1TB",
      mainCamera: "50MP + 50MP + 50MP",
      selfieCamera: "32MP",
      capacity: "5400 mAh",
      releaseDate: "Nov 2023"
    },
    performance: {
      cpuScore: 10100,
      cpuPercent: 89,
      gpuScore: 13100,
      gpuPercent: 91,
      batteryLife: "115",
      batteryPercent: 89,
      antutuScore: "2.1M",
      antutuPercent: 98
    }
  },
  {
    brand: "OnePlus",
    name: "12",
    category: "mobiles",
    image: "oneplus-12",
    price: "$799",
    rating: 4.6,
    specs: {
      technology: "GSM / CDMA / HSPA / LTE / 5G",
      dimensions: "164.3 x 75.8 x 9.2 mm",
      weight: "220 g",
      displayTypeSize: "LTPO AMOLED, 6.82 inches",
      chipset: "Snapdragon 8 Gen 3 (4 nm)",
      os: "Android 14, OxygenOS 14",
      ram: "12 GB / 16 GB",
      storageVariants: "256GB / 512GB / 1TB",
      mainCamera: "50MP + 64MP + 48MP",
      selfieCamera: "32MP",
      capacity: "5400 mAh",
      releaseDate: "Dec 2023"
    },
    performance: {
      cpuScore: 9950,
      cpuPercent: 88,
      gpuScore: 12900,
      gpuPercent: 90,
      batteryLife: "112",
      batteryPercent: 87,
      antutuScore: "2.1M",
      antutuPercent: 98
    }
  },
  {
    brand: "Google",
    name: "Pixel 9",
    category: "mobiles",
    image: "google-pixel-9",
    price: "$799",
    rating: 4.5,
    specs: {
      technology: "GSM / HSPA / LTE / 5G",
      dimensions: "152.8 x 72 x 8.5 mm",
      weight: "198 g",
      displayTypeSize: "OLED, 6.3 inches",
      chipset: "Google Tensor G4 (4 nm)",
      os: "Android 14",
      ram: "12 GB",
      storageVariants: "128GB / 256GB",
      mainCamera: "50MP + 48MP",
      selfieCamera: "10.5MP",
      capacity: "4700 mAh",
      releaseDate: "Aug 2024"
    },
    performance: {
      cpuScore: 8800,
      cpuPercent: 78,
      gpuScore: 11000,
      gpuPercent: 77,
      batteryLife: "100",
      batteryPercent: 78,
      antutuScore: "1.2M",
      antutuPercent: 70
    }
  }
];

async function addNewDevices() {
  console.log('Injecting new devices into brand JSON files...');
  let addedCount = 0;

  for (const newDev of NEW_DEVICES) {
    const brandSlug = newDev.brand.toLowerCase();
    const filePath = path.join(brandsDir, `${brandSlug}.json`);
    
    // Format full ID and GSMArena image URL
    const idSlug = newDev.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    newDev.id = `${brandSlug}-${idSlug}-2024`;
    if (!newDev.image.startsWith('http')) {
      newDev.image = `https://fdn2.gsmarena.com/vv/bigpic/${newDev.image}.jpg`;
    }
    
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      
      // Check if device already exists by checking if any device name includes the new device name
      const exists = data.some(d => d.name.toLowerCase() === newDev.name.toLowerCase() || d.id === newDev.id);
      
      if (!exists) {
        data.unshift(newDev); // Add to the top
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        console.log(`Added ${newDev.name} to ${brandSlug}.json`);
        addedCount++;
      } else {
        console.log(`${newDev.name} already exists in ${brandSlug}.json`);
      }
    } else {
      console.log(`Brand file not found for ${newDev.brand}, creating it...`);
      fs.writeFileSync(filePath, JSON.stringify([newDev], null, 2));
      addedCount++;
    }
  }
  
  console.log(`Successfully added ${addedCount} new devices.`);
}

addNewDevices().catch(console.error);

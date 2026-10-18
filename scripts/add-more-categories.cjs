const fs = require('fs');
const path = require('path');

const brandsDir = path.join(__dirname, '..', 'src', 'data', 'brands');

const NEW_DEVICES = [
  // --- Laptops ---
  {
    brand: "Apple",
    name: "MacBook Pro 16 (M3 Max)",
    category: "laptops",
    image: "https://www.apple.com/v/macbook-pro/ah/images/overview/themes/performance/performance_m3_max__b96n03q2yqgi_large.jpg",
    price: "$3499",
    rating: 4.9,
    specs: {
      technology: "Wi-Fi 6E / Bluetooth 5.3",
      dimensions: "355.7 x 248.1 x 16.8 mm",
      weight: "2.14 kg",
      displayTypeSize: "Liquid Retina XDR, 16.2 inches",
      chipset: "Apple M3 Max (16-core CPU, 40-core GPU)",
      os: "macOS Sonoma",
      ram: "48 GB / 128 GB",
      storageVariants: "1TB / 2TB / 4TB / 8TB SSD",
      mainCamera: "1080p FaceTime HD",
      capacity: "100 Wh",
      releaseDate: "Oct 2023"
    },
    performance: {
      cpuScore: 28000,
      cpuPercent: 98,
      gpuScore: 45000,
      gpuPercent: 95,
      batteryLife: "22h total",
      batteryPercent: 95,
      antutuScore: "3.5M",
      antutuPercent: 99
    }
  },
  {
    brand: "Samsung",
    name: "Galaxy Book4 Ultra",
    category: "laptops",
    image: "https://images.samsung.com/is/image/samsung/p6pim/us/np960xfg-ka1us/gallery/us-galaxy-book4-ultra-16-inch-np960-np960xfg-ka1us-539958316?$650_519_PNG$",
    price: "$2399",
    rating: 4.7,
    specs: {
      technology: "Wi-Fi 7 / Bluetooth 5.3",
      dimensions: "355.4 x 250.4 x 16.5 mm",
      weight: "1.86 kg",
      displayTypeSize: "Dynamic AMOLED 2X, 16.0 inches",
      chipset: "Intel Core Ultra 9 185H",
      gpu: "NVIDIA GeForce RTX 4070",
      os: "Windows 11 Home",
      ram: "32 GB",
      storageVariants: "1TB / 2TB NVMe SSD",
      mainCamera: "1080p FHD",
      capacity: "76 Wh",
      releaseDate: "Feb 2024"
    },
    performance: {
      cpuScore: 24500,
      cpuPercent: 90,
      gpuScore: 42000,
      gpuPercent: 92,
      batteryLife: "16h total",
      batteryPercent: 85,
      antutuScore: "3.2M",
      antutuPercent: 95
    }
  },
  {
    brand: "Dell",
    name: "XPS 16",
    category: "laptops",
    image: "https://i.dell.com/is/image/DellContent/content/dam/ss2/product-images/dell-client-products/notebooks/xps-notebooks/xps-16-9640/media-gallery/silver/touch/notebook-xps-16-9640-t-silver-gallery-2.psd?fmt=png-alpha&pscan=auto&scl=1&hei=402&wid=536&qlt=100,1&resMode=sharp2&size=536,402&chrss=full",
    price: "$2999",
    rating: 4.6,
    specs: {
      technology: "Wi-Fi 7 / Bluetooth 5.4",
      dimensions: "358.1 x 240.0 x 18.7 mm",
      weight: "2.20 kg",
      displayTypeSize: "OLED Touch, 16.3 inches",
      chipset: "Intel Core Ultra 7 155H",
      gpu: "NVIDIA GeForce RTX 4070",
      os: "Windows 11 Pro",
      ram: "32 GB / 64 GB",
      storageVariants: "1TB / 2TB / 4TB PCIe 4.0 SSD",
      mainCamera: "1080p FHD",
      capacity: "99.5 Wh",
      releaseDate: "Jan 2024"
    },
    performance: {
      cpuScore: 23000,
      cpuPercent: 87,
      gpuScore: 41000,
      gpuPercent: 91,
      batteryLife: "18h total",
      batteryPercent: 88,
      antutuScore: "3.0M",
      antutuPercent: 92
    }
  },
  {
    brand: "Asus",
    name: "ROG Zephyrus G16 (2024)",
    category: "laptops",
    image: "https://dlcdnwebimgs.asus.com/gain/c1dfa637-ef57-4f65-8b2b-5fdb4d95b214/w800",
    price: "$2899",
    rating: 4.8,
    specs: {
      technology: "Wi-Fi 7 / Bluetooth 5.4",
      dimensions: "354.0 x 246.0 x 14.9 mm",
      weight: "1.85 kg",
      displayTypeSize: "ROG Nebula OLED (240Hz), 16.0 inches",
      chipset: "Intel Core Ultra 9 185H",
      gpu: "NVIDIA GeForce RTX 4090",
      os: "Windows 11 Pro",
      ram: "32 GB LPDDR5X",
      storageVariants: "2TB PCIe 4.0 SSD",
      mainCamera: "1080p FHD",
      capacity: "90 Wh",
      releaseDate: "Jan 2024"
    },
    performance: {
      cpuScore: 25000,
      cpuPercent: 91,
      gpuScore: 48000,
      gpuPercent: 98,
      batteryLife: "12h total",
      batteryPercent: 75,
      antutuScore: "3.6M",
      antutuPercent: 99
    }
  },

  // --- Earbuds ---
  {
    brand: "Apple",
    name: "AirPods Pro (2nd Gen)",
    category: "earbuds",
    image: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MTJV3?wid=1144&hei=1144&fmt=jpeg&qlt=90&.v=1694014871985",
    price: "$249",
    rating: 4.8,
    specs: {
      technology: "Bluetooth 5.3",
      dimensions: "30.9 x 21.8 x 24.0 mm",
      weight: "5.3 g (per bud)",
      displayTypeSize: "N/A",
      chipset: "Apple H2",
      os: "N/A",
      ram: "N/A",
      storageVariants: "N/A",
      mainCamera: "N/A",
      capacity: "MagSafe Charging Case (USB-C)",
      releaseDate: "Sep 2023",
      bluetooth: "5.3",
      resistance: "IP54 dust, sweat, and water resistant"
    },
    performance: {
      cpuScore: 0,
      cpuPercent: 0,
      gpuScore: 0,
      gpuPercent: 0,
      batteryLife: "6h (30h total)",
      batteryPercent: 85,
      antutuScore: "N/A",
      antutuPercent: 0
    }
  },
  {
    brand: "Samsung",
    name: "Galaxy Buds2 Pro",
    category: "earbuds",
    image: "https://images.samsung.com/is/image/samsung/p6pim/us/sm-r510nzaaxar/gallery/us-galaxy-buds2-pro-r510-sm-r510nzaaxar-533207436?$650_519_PNG$",
    price: "$229",
    rating: 4.7,
    specs: {
      technology: "Bluetooth 5.3",
      dimensions: "21.6 x 19.9 x 18.7 mm",
      weight: "5.5 g (per bud)",
      displayTypeSize: "N/A",
      chipset: "Samsung Audio Chip",
      os: "N/A",
      ram: "N/A",
      storageVariants: "N/A",
      mainCamera: "N/A",
      capacity: "500 mAh (case)",
      releaseDate: "Aug 2022",
      bluetooth: "5.3",
      resistance: "IPX7 water resistant"
    },
    performance: {
      cpuScore: 0,
      cpuPercent: 0,
      gpuScore: 0,
      gpuPercent: 0,
      batteryLife: "5h (18h total)",
      batteryPercent: 70,
      antutuScore: "N/A",
      antutuPercent: 0
    }
  },
  {
    brand: "Sony",
    name: "WF-1000XM5",
    category: "earbuds",
    image: "https://electronics.sony.com/image/5b09075796bfa8a36d246ad881cc10f1?fmt=png-alpha&wid=660&hei=660",
    price: "$299",
    rating: 4.9,
    specs: {
      technology: "Bluetooth 5.3",
      dimensions: "20.1 x 19.2 x 22.0 mm",
      weight: "5.9 g (per bud)",
      displayTypeSize: "N/A",
      chipset: "Integrated Processor V2 + QN2e",
      os: "N/A",
      ram: "N/A",
      storageVariants: "N/A",
      mainCamera: "N/A",
      capacity: "Wireless Charging Case",
      releaseDate: "Jul 2023",
      bluetooth: "5.3",
      resistance: "IPX4 water resistant"
    },
    performance: {
      cpuScore: 0,
      cpuPercent: 0,
      gpuScore: 0,
      gpuPercent: 0,
      batteryLife: "8h (24h total)",
      batteryPercent: 90,
      antutuScore: "N/A",
      antutuPercent: 0
    }
  },

  // --- Tablets ---
  {
    brand: "Apple",
    name: "iPad Pro 13 (M4)",
    category: "tablets",
    image: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/ipad-pro-13-select-wifi-spaceblack-202405?wid=940&hei=1112&fmt=png-alpha&.v=1713308890280",
    price: "$1299",
    rating: 4.9,
    specs: {
      technology: "Wi-Fi 6E / 5G / Bluetooth 5.3",
      dimensions: "281.6 x 215.5 x 5.1 mm",
      weight: "579 g",
      displayTypeSize: "Ultra Retina XDR OLED, 13.0 inches",
      chipset: "Apple M4 (9/10-core CPU)",
      os: "iPadOS 17.5",
      ram: "8 GB / 16 GB",
      storageVariants: "256GB / 512GB / 1TB / 2TB",
      mainCamera: "12MP",
      capacity: "38.99 Wh",
      releaseDate: "May 2024"
    },
    performance: {
      cpuScore: 16000,
      cpuPercent: 96,
      gpuScore: 22000,
      gpuPercent: 95,
      batteryLife: "10h total",
      batteryPercent: 88,
      antutuScore: "2.7M",
      antutuPercent: 99
    }
  },
  {
    brand: "Samsung",
    name: "Galaxy Tab S9 Ultra",
    category: "tablets",
    image: "https://images.samsung.com/is/image/samsung/p6pim/us/sm-x910nzaaxar/gallery/us-galaxy-tab-s9-ultra-wi-fi-sm-x910-sm-x910nzaaxar-537409214?$650_519_PNG$",
    price: "$1199",
    rating: 4.8,
    specs: {
      technology: "Wi-Fi 6E / 5G / Bluetooth 5.3",
      dimensions: "326.4 x 208.6 x 5.5 mm",
      weight: "732 g",
      displayTypeSize: "Dynamic AMOLED 2X, 14.6 inches",
      chipset: "Snapdragon 8 Gen 2 for Galaxy",
      os: "Android 13, One UI 5.1",
      ram: "12 GB / 16 GB",
      storageVariants: "256GB / 512GB / 1TB",
      mainCamera: "13MP + 8MP",
      capacity: "11200 mAh",
      releaseDate: "Aug 2023"
    },
    performance: {
      cpuScore: 11000,
      cpuPercent: 88,
      gpuScore: 14000,
      gpuPercent: 89,
      batteryLife: "14h total",
      batteryPercent: 92,
      antutuScore: "1.6M",
      antutuPercent: 85
    }
  },

  // --- Watches ---
  {
    brand: "Apple",
    name: "Apple Watch Ultra 2",
    category: "watches",
    image: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/watch-ultra2-titanium-ocean-blue-nc-select_VW_PF+watch-face-49-ultra2-ocean-blue-nc_VW_PF?wid=2000&hei=2000&fmt=png-alpha&.v=1693847248356,1693847377598",
    price: "$799",
    rating: 4.9,
    specs: {
      technology: "LTE / HSPA / GSM",
      dimensions: "49 x 44 x 14.4 mm",
      weight: "61.4 g",
      displayTypeSize: "Retina LTPO OLED (3000 nits), 1.92 inches",
      chipset: "Apple S9",
      os: "watchOS 10",
      ram: "N/A",
      storageVariants: "64GB",
      mainCamera: "N/A",
      capacity: "564 mAh",
      releaseDate: "Sep 2023",
      resistance: "100m water resistant (IP6X)"
    },
    performance: {
      cpuScore: 0,
      cpuPercent: 0,
      gpuScore: 0,
      gpuPercent: 0,
      batteryLife: "36h total",
      batteryPercent: 80,
      antutuScore: "N/A",
      antutuPercent: 0
    }
  },
  {
    brand: "Samsung",
    name: "Galaxy Watch6 Classic",
    category: "watches",
    image: "https://images.samsung.com/is/image/samsung/p6pim/us/sm-r960nzkaxaa/gallery/us-galaxy-watch6-classic-47mm-sm-r960-sm-r960nzkaxaa-537409249?$650_519_PNG$",
    price: "$399",
    rating: 4.7,
    specs: {
      technology: "LTE / HSPA / GSM",
      dimensions: "46.5 x 46.5 x 10.9 mm",
      weight: "59 g",
      displayTypeSize: "Super AMOLED, 1.5 inches",
      chipset: "Exynos W930 (5 nm)",
      os: "Android Wear OS 4, One UI Watch 5",
      ram: "2 GB",
      storageVariants: "16GB",
      mainCamera: "N/A",
      capacity: "425 mAh",
      releaseDate: "Aug 2023",
      resistance: "50m water resistant (IP68)"
    },
    performance: {
      cpuScore: 0,
      cpuPercent: 0,
      gpuScore: 0,
      gpuPercent: 0,
      batteryLife: "40h total",
      batteryPercent: 85,
      antutuScore: "N/A",
      antutuPercent: 0
    }
  }
];

async function addMoreCategories() {
  console.log('Injecting laptops, earbuds, tablets, and watches...');
  let addedCount = 0;

  for (const newDev of NEW_DEVICES) {
    const brandSlug = newDev.brand.toLowerCase();
    const filePath = path.join(brandsDir, `${brandSlug}.json`);
    
    const idSlug = newDev.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    newDev.id = `${brandSlug}-${idSlug}-2024`;
    
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      
      const exists = data.some(d => d.name.toLowerCase() === newDev.name.toLowerCase() || d.id === newDev.id);
      
      if (!exists) {
        data.unshift(newDev);
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

addMoreCategories().catch(console.error);

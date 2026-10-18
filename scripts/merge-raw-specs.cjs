const fs = require('fs');
const path = require('path');

const RAW_FILE = path.join(__dirname, '../devices.json');
const BRANDS_DIR = path.join(__dirname, '../src/data/brands');

function normalizeBrandSlug(brand) {
  return brand.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function run() {
  if (!fs.existsSync(RAW_FILE)) {
    console.error('RAW_FILE not found');
    return;
  }
  const rawData = JSON.parse(fs.readFileSync(RAW_FILE, 'utf-8')).RECORDS;
  
  // Map raw data by raw id
  const rawMap = {};
  for (const row of rawData) {
    if (row.id) {
      // Store stringified JSON directly
      rawMap[row.id.toString()] = typeof row.specifications === 'string' 
        ? row.specifications 
        : JSON.stringify(row.specifications);
    }
  }

  // Update brand JSONs
  const files = fs.readdirSync(BRANDS_DIR);
  let updatedCount = 0;
  for (const file of files) {
    if (!file.endsWith('.json')) continue;
    const filePath = path.join(BRANDS_DIR, file);
    let devices = [];
    try {
      devices = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } catch (e) {
      continue;
    }

    let modified = false;
    for (const d of devices) {
      const parts = d.id.split('-');
      const rawId = parts[parts.length - 1];
      if (rawMap[rawId] && !d.rawSpecs) {
        d.rawSpecs = rawMap[rawId];
        modified = true;
        updatedCount++;
      }
    }

    if (modified) {
      fs.writeFileSync(filePath, JSON.stringify(devices, null, 2), 'utf-8');
    }
  }

  console.log(`Successfully merged rawSpecs for ${updatedCount} devices.`);
}

run();

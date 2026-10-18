const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const brandsDir = path.join(rootDir, 'src', 'data', 'brands');

async function fixData() {
  console.log('Fixing data in src/data/brands...');
  if (!fs.existsSync(brandsDir)) {
    console.error('Brands directory not found.');
    return;
  }

  const files = fs.readdirSync(brandsDir);
  let updatedDevices = 0;
  let fixedImages = 0;
  let fixedBenchmarks = 0;

  for (const file of files) {
    if (file.endsWith('.json')) {
      const filePath = path.join(brandsDir, file);
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      let fileUpdated = false;

      for (const device of data) {
        // 1. Fix Image URLs
        if (device.image) {
          if (!device.image.startsWith('http')) {
            device.image = `https://fdn2.gsmarena.com/vv/bigpic/${device.image}`;
            fileUpdated = true;
            fixedImages++;
          }
        } else {
          // Construct GSMArena URL if missing
          const slug = device.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          const brandSlug = device.brand.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          device.image = `https://fdn2.gsmarena.com/vv/bigpic/${brandSlug}-${slug}.jpg`;
          fileUpdated = true;
          fixedImages++;
        }

        // 2. Clear dummy benchmarks to force live fetch
        // `migrate.cjs` sets dummy scores. We want to remove them so the frontend/API can fetch live.
        // We add a flag `liveFetchRequired: true` or zero out the dummy scores
        if (device.performance && device.performance.antutuScore) {
          // If it ends with "M" and looks like a generic value, we flag it.
          if (device.performance.isDummy !== false) {
             device.performance.isDummy = true;
             // We can optionally keep the dummy value as a fallback, but mark it dummy
             fileUpdated = true;
             fixedBenchmarks++;
          }
        }
      }

      if (fileUpdated) {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        updatedDevices += data.length; // Just a rough metric
      }
    }
  }

  console.log(`Fixed ${fixedImages} images and flagged ${fixedBenchmarks} benchmarks across brand files.`);
}

fixData().catch(console.error);

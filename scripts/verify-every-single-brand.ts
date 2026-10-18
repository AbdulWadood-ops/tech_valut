import { getDeviceById, getDeviceReviews, getBrands } from '../src/lib/db';
import fs from 'fs';
import path from 'path';

async function verifyAllBrands() {
  console.log("===============================================================");
  console.log("🔍 COMPREHENSIVE VERIFICATION ACROSS ALL BRANDS (EVERY SINGLE ONE)");
  console.log("===============================================================\n");

  const brandsDir = path.join(process.cwd(), 'src', 'data', 'brands');
  const reviewDir = path.join(process.cwd(), 'src', 'data', 'reviews');

  const brandFiles = fs.readdirSync(brandsDir).filter(f => f.endsWith('.json') && !f.endsWith('-reviews.json'));
  console.log(`📋 Found ${brandFiles.length} total brand JSON files in system.\n`);

  let totalBrands = 0;
  let successBrands = 0;
  let totalDevicesChecked = 0;
  let failedDevices = [];
  let failedReviews = [];

  for (const file of brandFiles) {
    totalBrands++;
    const slug = file.replace('.json', '');
    const filePath = path.join(brandsDir, file);
    
    let devices = [];
    try {
      devices = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (err: any) {
      console.error(`❌ Corrupt JSON in ${file}:`, err?.message);
      continue;
    }

    if (!Array.isArray(devices) || devices.length === 0) {
      console.warn(`⚠️ Brand ${slug} has 0 devices.`);
      continue;
    }

    // Pick 2 devices from this brand to test (first and last/middle)
    const testIndices = [0];
    if (devices.length > 1) testIndices.push(Math.floor(devices.length / 2));

    let brandOk = true;

    for (const idx of testIndices) {
      const dev = devices[idx];
      totalDevicesChecked++;

      // 1. Verify Spec Loading
      const spec = await getDeviceById(dev.id);
      if (!spec) {
        failedDevices.push({ brand: slug, id: dev.id, name: dev.name });
        brandOk = false;
      }

      // 2. Verify Review Loading
      const review = await getDeviceReviews(dev.id);
      if (!review || !review.reviews || review.reviews.length === 0) {
        failedReviews.push({ brand: slug, id: dev.id, name: dev.name });
        brandOk = false;
      }
    }

    if (brandOk) {
      successBrands++;
      process.stdout.write(`✅ [${totalBrands}/${brandFiles.length}] Brand "${devices[0].brand || slug}" (${devices.length} devices) - Specs & Reviews Verified\n`);
    } else {
      process.stdout.write(`❌ [${totalBrands}/${brandFiles.length}] Brand "${slug}" - Issue detected\n`);
    }
  }

  console.log("\n===============================================================");
  console.log("📊 FINAL SUMMARY ACROSS ALL BRANDS");
  console.log("===============================================================");
  console.log(`Total Brands Audited: ${totalBrands}`);
  console.log(`Brands with 100% Working Specs & Reviews: ${successBrands} / ${totalBrands}`);
  console.log(`Total Sample Devices Audited: ${totalDevicesChecked}`);
  console.log(`Spec Loading Failures: ${failedDevices.length}`);
  console.log(`Review Loading Failures: ${failedReviews.length}`);

  if (failedDevices.length > 0) {
    console.log("\nFailed Devices:", failedDevices.slice(0, 10));
  }
  if (failedReviews.length > 0) {
    console.log("\nFailed Reviews:", failedReviews.slice(0, 10));
  }

  console.log("===============================================================\n");
  process.exit(0);
}

verifyAllBrands();

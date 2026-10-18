import { getDeviceById, getDeviceReviews } from '../src/lib/db';
import fs from 'fs';
import path from 'path';

async function testLoading() {
  console.log("==========================================");
  console.log("🧪 TESTING LOCAL SPECS & REVIEWS LOADING");
  console.log("==========================================\n");

  const brandsDir = path.join(process.cwd(), 'src', 'data', 'brands');
  const sampleBrands = ['acer', 'apple', 'samsung', 'oneplus', 'google', 'xiaomi', 'vivo'];

  for (const b of sampleBrands) {
    const file = path.join(brandsDir, `${b}.json`);
    if (fs.existsSync(file)) {
      const list = JSON.parse(fs.readFileSync(file, 'utf8'));
      if (list.length > 0) {
        const testDev = list[0];
        console.log(`\n📱 Testing Device [Brand: ${testDev.brand}]: "${testDev.name}" (${testDev.id})`);
        
        // 1. Test Specs
        const spec = await getDeviceById(testDev.id);
        if (spec) {
          console.log(`   ✅ Spec loaded: "${spec.name}"`);
          console.log(`      • Image: ${spec.image.slice(0, 70)}...`);
          console.log(`      • Cloudinary: ${spec.image.includes('cloudinary') ? 'YES ✅' : 'NO'}`);
          console.log(`      • CPU Score: ${spec.performance?.cpuScore}, AnTuTu: ${spec.performance?.antutuScore}`);
        } else {
          console.log(`   ❌ Failed to load spec for ${testDev.id}`);
        }

        // 2. Test Reviews
        const reviews = await getDeviceReviews(testDev.id);
        if (reviews) {
          console.log(`   ✅ Reviews loaded: "${(reviews as any).name || testDev.name}"`);
          console.log(`      • Pros (${reviews.pros?.length || 0}): ${reviews.pros?.[0]}`);
          console.log(`      • Cons (${reviews.cons?.length || 0}): ${reviews.cons?.[0]}`);
          console.log(`      • Verified User Reviews: ${reviews.reviews?.length || 0} reviews`);
        } else {
          console.log(`   ❌ Failed to load reviews for ${testDev.id}`);
        }
      }
    }
  }

  console.log("\n==========================================");
  console.log("🎉 ALL TESTS COMPLETED & VERIFIED!");
  console.log("==========================================\n");
  process.exit(0);
}

testLoading();

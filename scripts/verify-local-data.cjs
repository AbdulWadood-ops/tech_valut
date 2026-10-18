const { getDeviceById, getDeviceReviews, getBrands } = require('../src/lib/db');

async function testLoading() {
  console.log("==========================================");
  console.log("🧪 TESTING LOCAL SPECS & REVIEWS LOADING");
  console.log("==========================================\n");

  const sampleDevices = [
    'acer-allegro-3920',
    'apple-iphone-15-pro-max',
    'samsung-galaxy-s24-ultra',
    'oneplus-12',
    'google-pixel-8-pro',
    'xiaomi-14-ultra'
  ];

  // If specific IDs don't match exact slug format, let's also test by finding devices in brands
  const fs = require('fs');
  const path = require('path');
  const brandsDir = path.join(__dirname, '..', 'src', 'data', 'brands');
  const sampleBrands = ['acer', 'apple', 'samsung', 'oneplus', 'google'];

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
          console.log(`   ✅ Spec loaded successfully!`);
          console.log(`      • Image: ${spec.image.slice(0, 60)}...`);
          console.log(`      • Cloudinary: ${spec.image.includes('cloudinary') ? 'YES ✅' : 'NO'}`);
          console.log(`      • Benchmark CPU Score: ${spec.performance?.cpuScore}`);
          console.log(`      • AnTuTu Score: ${spec.performance?.antutuScore}`);
        } else {
          console.log(`   ❌ Failed to load spec for ${testDev.id}`);
        }

        // 2. Test Reviews
        const reviews = await getDeviceReviews(testDev.id);
        if (reviews) {
          console.log(`   ✅ Reviews loaded successfully!`);
          console.log(`      • Pros count: ${reviews.pros?.length || 0} (${reviews.pros?.[0]?.slice(0, 40)}...)`);
          console.log(`      • Cons count: ${reviews.cons?.length || 0} (${reviews.cons?.[0]?.slice(0, 40)}...)`);
          console.log(`      • User Reviews count: ${reviews.reviews?.length || 0}`);
        } else {
          console.log(`   ❌ Failed to load reviews for ${testDev.id}`);
        }
      }
    }
  }

  console.log("\n==========================================");
  console.log("🎉 ALL TESTS COMPLETED!");
  console.log("==========================================\n");
  process.exit(0);
}

testLoading();

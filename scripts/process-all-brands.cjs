const fs = require('fs');
const path = require('path');
const { processBrand } = require('./process-single-brand.cjs');
const { DONE_PHONES_DIR } = require('./brand-utils.cjs');

async function processAllBrands() {
  const txtFiles = fs.readdirSync(DONE_PHONES_DIR).filter(f => f.endsWith('.txt'));
  console.log(`\n🚀 Starting brand-by-brand pipeline for ${txtFiles.length} brands...\n`);

  const results = [];
  let totalDevices = 0;
  let totalReviews = 0;

  for (let i = 0; i < txtFiles.length; i++) {
    const file = txtFiles[i];
    const brandRaw = file.replace(/(\.txt| phones|_views|-views|-urls|_urls|-phones)/gi, '').trim();
    console.log(`[${i + 1}/${txtFiles.length}] Brand: ${brandRaw} (File: ${file})`);

    try {
      const res = await processBrand(brandRaw);
      if (res) {
        results.push(res);
        totalDevices += res.devicesCount;
        totalReviews += res.reviewsCount;
      }
    } catch (err) {
      console.error(`❌ Error processing brand ${brandRaw}:`, err.message);
    }
  }

  console.log(`\n========================================`);
  console.log(`🎉 ALL BRANDS PROCESSED SUCCESSFULLY!`);
  console.log(`========================================`);
  console.log(`📦 Total Brands Processed: ${results.length}`);
  console.log(`📱 Total Device Specs Created: ${totalDevices}`);
  console.log(`⭐ Total Review Sets Created: ${totalReviews}`);
  console.log(`========================================\n`);
}

if (require.main === module) {
  processAllBrands();
}

module.exports = { processAllBrands };

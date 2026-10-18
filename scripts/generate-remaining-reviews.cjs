const fs = require('fs');
const path = require('path');
const { generateReviews, BRANDS_DIR, REVIEWS_DIR } = require('./brand-utils.cjs');

function generateRemainingReviews() {
  const brandFiles = fs.readdirSync(BRANDS_DIR).filter(f => f.endsWith('.json') && !f.endsWith('-reviews.json'));
  console.log(`Checking ${brandFiles.length} brand files for missing review sets...`);

  let count = 0;
  for (const file of brandFiles) {
    const slug = file.replace('.json', '');
    const reviewFile = path.join(REVIEWS_DIR, `${slug}-reviews.json`);
    
    if (!fs.existsSync(reviewFile)) {
      try {
        const devices = JSON.parse(fs.readFileSync(path.join(BRANDS_DIR, file), 'utf8'));
        if (Array.isArray(devices) && devices.length > 0) {
          const reviews = devices.map(d => generateReviews(d));
          fs.writeFileSync(reviewFile, JSON.stringify(reviews, null, 2), 'utf8');
          console.log(`✅ Generated ${reviews.length} reviews for brand: ${slug}`);
          count++;
        }
      } catch (err) {
        console.error(`Error for ${file}:`, err.message);
      }
    }
  }

  console.log(`\n🎉 Generated reviews for ${count} additional brands!`);
}

generateRemainingReviews();

const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const BRANDS_DIR = path.join(__dirname, '..', 'src', 'data', 'brands');
const REVIEWS_DIR = path.join(__dirname, '..', 'src', 'data', 'reviews');

async function syncToMongoDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("❌ MONGODB_URI is not defined in .env");
    return;
  }

  console.log("🔌 Connecting to MongoDB Atlas...");
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('appdb');
    const specsCollection = db.collection('devices-specs');
    const reviewsCollection = db.collection('devices-reviews');

    console.log("✅ Connected. Starting bulk sync...");

    // 1. Sync Specs
    const specFiles = fs.readdirSync(BRANDS_DIR).filter(f => f.endsWith('.json') && !f.endsWith('-reviews.json'));
    let allDevices = [];
    for (const file of specFiles) {
      try {
        const content = JSON.parse(fs.readFileSync(path.join(BRANDS_DIR, file), 'utf8'));
        if (Array.isArray(content)) allDevices.push(...content);
      } catch (err) {}
    }

    console.log(`📱 Found ${allDevices.length} total devices across ${specFiles.length} brand files.`);

    if (allDevices.length > 0) {
      console.log("⚡ Upserting devices into 'devices-specs' collection in chunks...");
      const chunkSize = 500;
      for (let i = 0; i < allDevices.length; i += chunkSize) {
        const chunk = allDevices.slice(i, i + chunkSize);
        const ops = chunk.map(d => ({
          updateOne: {
            filter: { id: d.id },
            update: { $set: d },
            upsert: true
          }
        }));
        await specsCollection.bulkWrite(ops, { ordered: false });
        console.log(`   Processed ${Math.min(i + chunkSize, allDevices.length)}/${allDevices.length} devices...`);
      }
    }

    // 2. Sync Reviews
    if (fs.existsSync(REVIEWS_DIR)) {
      const reviewFiles = fs.readdirSync(REVIEWS_DIR).filter(f => f.endsWith('.json'));
      let allReviews = [];
      for (const file of reviewFiles) {
        try {
          const content = JSON.parse(fs.readFileSync(path.join(REVIEWS_DIR, file), 'utf8'));
          if (Array.isArray(content)) allReviews.push(...content);
        } catch (err) {}
      }

      console.log(`⭐ Found ${allReviews.length} total review documents across ${reviewFiles.length} review files.`);

      if (allReviews.length > 0) {
        console.log("⚡ Upserting reviews into 'devices-reviews' collection in chunks...");
        const chunkSize = 500;
        for (let i = 0; i < allReviews.length; i += chunkSize) {
          const chunk = allReviews.slice(i, i + chunkSize);
          const ops = chunk.map(r => ({
            updateOne: {
              filter: { id: r.id },
              update: { $set: r },
              upsert: true
            }
          }));
          await reviewsCollection.bulkWrite(ops, { ordered: false });
          console.log(`   Processed ${Math.min(i + chunkSize, allReviews.length)}/${allReviews.length} reviews...`);
        }
      }
    }

    console.log("\n🎉 MongoDB Sync completed successfully!\n");
  } catch (err) {
    console.error("❌ MongoDB sync error:", err);
  } finally {
    await client.close();
  }
}

if (require.main === module) {
  syncToMongoDB();
}

module.exports = { syncToMongoDB };

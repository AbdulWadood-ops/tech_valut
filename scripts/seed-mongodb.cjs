const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('Missing MONGODB_URI in environment');
  process.exit(1);
}

const brandsDir = path.join(__dirname, '..', 'src', 'data', 'brands');

async function seedMongoDB() {
  console.log('Connecting to MongoDB Atlas...');
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000, connectTimeoutMS: 5000 });
  
  try {
    await client.connect();
    const db = client.db('appdb');
    console.log('Connected to DB: appdb');

    const files = fs.readdirSync(brandsDir).filter(f => f.endsWith('.json'));
    console.log(`Found ${files.length} brand JSON files.`);

    const unifiedCollection = db.collection('devices');
    await unifiedCollection.deleteMany({});
    console.log('Cleared existing unified `devices` collection in MongoDB.');

    let totalUploaded = 0;
    const allDevicesToInsert = [];

    for (const file of files) {
      const filePath = path.join(brandsDir, file);
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      
      try {
        const brandDevices = JSON.parse(fileContent);
        if (!Array.isArray(brandDevices) || brandDevices.length === 0) continue;

        let rawBrandName = file.replace('.json', '');
        let formattedBrandName = rawBrandName
          .toLowerCase()
          .split(' ')
          .map(w => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ');

        // Format devices
        const formatted = brandDevices.slice(0, 30).map((d) => {
          let bName = d.brand || formattedBrandName;
          bName = bName
            .toLowerCase()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
            
          let category = d.category || 'mobiles';
          if (category === 'phones') category = 'mobiles';
          if (category === 'ear pods') category = 'earbuds';

          const devId = d.id || `${bName}-${d.name}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
          
          return {
            ...d,
            id: devId,
            brand: bName,
            category,
          };
        });

        const collectionName = `${rawBrandName.toLowerCase().replace(/\s+/g, '_')}_devices`;
        const brandCol = db.collection(collectionName);
        await brandCol.deleteMany({});
        await brandCol.insertMany(formatted);

        allDevicesToInsert.push(...formatted);
        totalUploaded += formatted.length;
      } catch (err) {
        console.error(`Error processing ${file}:`, err.message);
      }
    }

    // Insert all into unified collection
    if (allDevicesToInsert.length > 0) {
      const chunkSize = 500;
      for (let i = 0; i < allDevicesToInsert.length; i += chunkSize) {
        const chunk = allDevicesToInsert.slice(i, i + chunkSize);
        await unifiedCollection.insertMany(chunk);
      }
      console.log(`Successfully seeded ${allDevicesToInsert.length} total devices across ${files.length} brands into MongoDB Atlas!`);
    }

    console.log('MongoDB seeding completed successfully!');
  } catch (err) {
    console.error('Seeding failed:', err);
  } finally {
    await client.close();
  }
}

seedMongoDB();

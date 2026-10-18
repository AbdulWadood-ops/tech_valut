import { MongoClient } from 'mongodb';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Manually load .env
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = resolve(__dirname, '../.env');
const envContent = readFileSync(envPath, 'utf-8');
for (const line of envContent.split('\n')) {
  const [key, ...rest] = line.split('=');
  if (key && rest.length) {
    process.env[key.trim()] = rest.join('=').trim();
  }
}

const uri = process.env.MONGODB_URI;
if (!uri) { console.error('No MONGODB_URI'); process.exit(1); }

console.log('URI prefix:', uri.substring(0, 30) + '...');

const client = new MongoClient(uri, {
  serverSelectionTimeoutMS: 15000,
  connectTimeoutMS: 15000,
  family: 4,
});

try {
  console.log('Connecting...');
  await client.connect();
  console.log('✅ Connected to MongoDB!\n');

  const db = client.db('appdb');

  // List all collections
  const collections = await db.listCollections().toArray();
  console.log('📂 Collections in appdb:');
  for (const col of collections) {
    const count = await db.collection(col.name).countDocuments();
    console.log(`  - ${col.name}: ${count} documents`);
  }

  // Show one sample from device-specs if it exists
  const specCol = collections.find(c => c.name === 'device-specs');
  if (specCol) {
    const sample = await db.collection('device-specs').findOne({});
    console.log('\n📄 Sample from device-specs:', JSON.stringify(sample, null, 2).substring(0, 500));
  }

  const reviewCol = collections.find(c => c.name === 'device-reviews');
  if (reviewCol) {
    const sample = await db.collection('device-reviews').findOne({});
    console.log('\n📄 Sample from device-reviews:', JSON.stringify(sample, null, 2).substring(0, 300));
  }

} catch (err) {
  console.error('❌ Error:', err.message);
} finally {
  await client.close();
  process.exit(0);
}

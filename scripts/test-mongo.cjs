const { MongoClient } = require('mongodb');
require('dotenv').config();

async function testConnection() {
  const uri = process.env.MONGODB_URI;
  console.log("Testing connection string...");
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
  try {
    await client.connect();
    console.log("✅ Successfully connected to MongoDB Atlas!");
    const dbs = await client.db().admin().listDatabases();
    console.log("Databases:", dbs.databases.map(d => d.name));
  } catch (err) {
    console.error("❌ Connection failed:", err.message);
    if (err.message.includes('ETIMEDOUT') || err.message.includes('Server selection timed out')) {
      console.log("\n💡 Likely cause: Your current IP address is not whitelisted in MongoDB Atlas Network Access.");
      console.log("👉 Solution: Go to MongoDB Atlas Dashboard -> Network Access -> Add IP Address -> Allow Access from Anywhere (0.0.0.0/0).");
    }
  } finally {
    await client.close();
  }
}

testConnection();

// connect.cjs
const { MongoClient } = require('mongodb');
require('dotenv').config({ path: './config.env' }); // make sure path is correct

const client = new MongoClient(process.env.ATLAS_URI);
let db = null;

async function connectDB() {
  if (db) return db; // reuse connection

  try {
    await client.connect();
    db = client.db('sjmp'); // default database
    console.log('✅ MongoDB connected'); // this will now always log
    return db;
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    throw err;
  }
}

// Run test if this file is executed directly
if (require.main === module) {
  (async () => {
    try {
      await connectDB();
      console.log('MongoDB connection test successful!');
    } catch (err) {
      console.error('MongoDB connection test failed:', err);
    } finally {
      await client.close(); // close after test
    }
  })();
}

module.exports = connectDB;

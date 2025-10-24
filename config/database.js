const { MongoClient } = require("mongodb");
require("dotenv").config({ path: "./config.env" });

const uri = process.env.ATLAS_URI;
let db = null;
let client = null;

async function connectDB() {
  if (db) return db;
  
  try {
    client = new MongoClient(uri);
    await client.connect();
    db = client.db("sjmp");
    console.log("✅ Connected to MongoDB");
    return db;
  } catch (err) {
    console.error("❌ Failed to connect to DB", err);
    throw err;
  }
}

function getDB() {
  if (!db) throw new Error("Database not initialized. Call connectDB first.");
  return db;
}

module.exports = { connectDB, getDB };
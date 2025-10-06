const connectDB = require('./connect.cjs');

async function run() {
  const db = await connectDB();
  await db.collection('users').insertOne({
    fullName: "Carlo",
    email: "test@test.com",
    password: "1234"
  });
  console.log("Inserted test user!");
  process.exit(0);
}

run();

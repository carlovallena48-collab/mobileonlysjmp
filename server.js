const express = require("express");
const cors = require("cors");
const { connectDB } = require("./config/database");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 10000; // ✅ Use Render's port

// ✅ FIX: Increase payload size limit
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ✅ IMPROVED CORS for mobile apps
app.use(cors({
  origin: ['https://your-app.com', 'http://localhost:8081'], // Add your app URLs
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true
}));

// Serve uploaded files
app.use("/uploads", express.static("uploads"));

// Import routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const baptismRoutes = require("./routes/baptism");
const marriageRoutes = require("./routes/marriage");
const funeralRoutes = require("./routes/funeral");
const kumpilRoutes = require("./routes/kumpil");
const communionRoutes = require("./routes/communion");
const holyOrdersRoutes = require("./routes/holyorders");
const blessingRoutes = require("./routes/blessing");
const pamisaRoutes = require("./routes/pamisa");
const sickcallRoutes = require("./routes/sickcall");
const certificateRoutes = require("./routes/certificates");
const volunteerRoutes = require("./routes/volunteers");
const notificationRoutes = require("./routes/notifications");

// Use routes
app.use("/api", authRoutes);
app.use("/api", userRoutes);
app.use("/api", baptismRoutes);
app.use("/api", marriageRoutes);
app.use("/api", funeralRoutes);
app.use("/api", kumpilRoutes);
app.use("/api", communionRoutes);
app.use("/api", holyOrdersRoutes);
app.use("/api", blessingRoutes);
app.use("/api", pamisaRoutes);
app.use("/api", sickcallRoutes);
app.use("/api", certificateRoutes);
app.use("/api", volunteerRoutes);
app.use("/api", notificationRoutes);

// ✅ ADD THESE IMPORTANT ROUTES:
// Root route
app.get("/", (req, res) => {
  res.json({ 
    success: true,
    message: "🚀 SJMP Parish Server is running!",
    timestamp: new Date().toISOString()
  });
});

// Health check route (important for Render monitoring)
app.get("/health", (req, res) => {
  res.status(200).json({ 
    status: "OK", 
    message: "Server is healthy",
    timestamp: new Date().toISOString(),
    database: "Connected"
  });
});

// API test route
app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "✅ API is working perfectly!",
    timestamp: new Date().toISOString()
  });
});

// ✅ FIX: Add global error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Global Error Handler:', err);
  res.status(500).json({ 
    success: false,
    message: 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    message: 'Route not found',
    path: req.path
  });
});

// Initialize database and start server
connectDB().then(() => {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`✅ MongoDB Connected Successfully`);
    console.log(`🚀 Server running on port ${PORT}`);
  });
}).catch(err => {
  console.error("❌ Failed to start server:", err);
  process.exit(1);
});
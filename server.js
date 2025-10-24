const express = require("express");
const cors = require("cors");
const { connectDB } = require("./config/database");
require("dotenv").config();


const app = express();
const PORT = process.env.PORT || 5000;

// ✅ FIX: Increase payload size limit
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Middleware
app.use(cors());

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

// Test route
app.get("/", (req, res) => {
  res.send("Server is running!");
});

// ✅ FIX: Add global error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Global Error Handler:', err);
  res.status(500).json({ 
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    message: 'Route not found' 
  });
});



// Initialize database and start server
connectDB().then(() => {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
  });
}).catch(err => {
  console.error("❌ Failed to start server:", err);
});
// server.js
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const connectDB = require("./connect.cjs");
require("dotenv").config({ path: "./config.env" });

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Global variable for the database connection
let db;

// Connect to MongoDB
connectDB()
  .then((database) => {
    db = database;
    console.log("✅ Connected to MongoDB");
  })
  .catch((err) => {
    console.error("❌ Failed to connect to DB", err);
  });

// Test route
app.get("/", (req, res) => {
  res.send("Server is running!");
});
// =======================
// SIGNUP ROUTE
// =======================
app.post("/api/signup", async (req, res) => {
  try {
    const { fullName, email, password, address, contact, role } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      fullName: fullName?.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      address: address?.trim() || null,   // 👈 null na lang kung empty
      contact: contact?.trim() || null,   // 👈 para hindi maging ""
      role: role || "Member",
      profileImage: "..assets/userpriofile.png",
    };

    const result = await db.collection("users").insertOne(newUser);
    console.log("✅ User inserted:", result.insertedId);

    res.json({ message: "Signup successful", userId: result.insertedId });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Something went wrong." });
  }
});


// =======================
// LOGIN ROUTE
// =======================
app.post("/api/login", async (req, res) => {
  if (!db) return res.status(500).json({ message: "Database not connected yet." });

  try {
    const { email, password } = req.body;
    console.log("Login request received:", req.body);

    const user = await db.collection("users").findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    // Strip sensitive data (password)
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: "Login successful",
      user: userWithoutPassword,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Something went wrong." });
  }
});
// =======================
// PROFILE ROUTE
// =======================
app.get("/api/profile/:email", async (req, res) => {
  if (!db) return res.status(500).json({ message: "Database not connected yet." });

  try {
    const { email } = req.params;

    const user = await db.collection("users").findOne(
      { email: email.trim().toLowerCase() },
      {
        projection: {
          _id: 0,
          fullName: 1,
          email: 1,
          profileImage: 1,
          address: 1,
          contact: 1,
          role: 1,
        },
      }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (!user.profileImage) {
      user.profileImage = "https://i.ibb.co/L95zB7X/emojiprofile.png";
    }

    res.status(200).json(user);
  } catch (err) {
    console.error("Profile fetch error:", err);
    res.status(500).json({ message: "Something went wrong." });
  }
});

// =======================
// UPDATE PROFILE ROUTE
// =======================
app.put("/api/profile/:email", async (req, res) => {
  if (!db) return res.status(500).json({ message: "Database not connected yet." });

  try {
    const { email } = req.params;
    const { fullName, address, contact } = req.body;

    const updatedUser = await db.collection("users").findOneAndUpdate(
      { email: email.trim().toLowerCase() },
      { $set: { fullName, address, contact } },
      { returnDocument: "after" }
    );

    if (!updatedUser.value) {
      return res.status(404).json({ message: "User not found." });
    }

    res.json(updatedUser.value);
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ message: "Something went wrong." });
  }
});

// =======================
// CHANGE PASSWORD ROUTE
// =======================
app.put("/api/change-password/:email", async (req, res) => {
  if (!db) return res.status(500).json({ message: "Database not connected yet." });

  try {
    const { email } = req.params;
    const { currentPassword, newPassword } = req.body;

    const user = await db.collection("users").findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect." });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.collection("users").updateOne(
      { email: user.email },
      { $set: { password: hashedPassword } }
    );

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Change password error:", err);
    res.status(500).json({ message: "Something went wrong." });
  }
});

// =======================
// RESET PASSWORD ROUTE
// =======================
app.post("/api/reset-password/:token", async (req, res) => {
  if (!db) return res.status(500).json({ message: "Database not connected yet." });

  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({ message: "New password is required." });
    }

    const user = await db.collection("users").findOne({
      resetToken: token,
      tokenExpiry: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired password reset token." });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.collection("users").updateOne(
      { _id: user._id },
      {
        $set: { password: hashedPassword },
        $unset: { resetToken: "", tokenExpiry: "" },
      }
    );

    res.status(200).json({ message: "Password has been reset successfully." });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ message: "Something went wrong." });
  }
});
// =======================
// BAPTISM REQUEST ROUTES
// =======================
app.post("/api/baptismrequests", async (req, res) => {
  if (!db) return res.status(500).json({ message: "Database not connected yet." });

  try {
    const baptismData = {
      name: req.body.name,
      birthDate: req.body.birthDate ? new Date(req.body.birthDate) : null,
      birthPlace: req.body.birthPlace,
      fatherName: req.body.fatherName,
      fatherBirthPlace: req.body.fatherBirthPlace,
      motherName: req.body.motherName,
      motherBirthPlace: req.body.motherBirthPlace,
      marriage: req.body.marriage,
      address: req.body.address,
      godfather: req.body.godfather,
      godfatherAddress: req.body.godfatherAddress,
      godmother: req.body.godmother,
      godmotherAddress: req.body.godmotherAddress,
      baptismDate: req.body.baptismDate ? new Date(req.body.baptismDate) : null,
      baptismTime: req.body.baptismTime || null, // <-- string lang, hindi gagawin Date
      contact: req.body.contact,
      sacrament: "Baptism",
      status: "pending", // para mabasa agad ng admin at may default status
      createdAt: new Date(),
    };

    const result = await db.collection("baptismrequests").insertOne(baptismData);

    res.status(201).json({ message: "Baptismal request saved!", id: result.insertedId });
  } catch (err) {
    console.error("Baptism request save error:", err);
    res.status(500).json({ message: "Failed to save baptismal request." });
  }
});

app.get("/api/baptismrequests", async (req, res) => {
  if (!db) return res.status(500).json({ message: "Database not connected yet." });

  try {
    const requests = await db
      .collection("baptismrequests")
      .find()
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).json(requests);
  } catch (err) {
    console.error("Fetch baptism requests error:", err);
    res.status(500).json({ message: "Failed to fetch baptismal requests." });
  }
});


// =======================
// KUMPIL (CONFIRMATION) REQUEST ROUTES
// =======================
app.post("/api/kumpil_requests", async (req, res) => {
  if (!db) return res.status(500).json({ message: "Database not connected yet." });

  try {
    const kumpilData = {
      sacrament: "Kumpil",
      kumpilDate: req.body.kumpilDate ? new Date(req.body.kumpilDate) : null,
      kumpilTime: req.body.kumpilTime || null, // string format: "10:00 AM"
      confirmandName: req.body.confirmandName,
      contactNo: req.body.contactNo,
      birthPlace: req.body.birthPlace || null,
      age: req.body.age || null,
      baptismDate: req.body.baptismDate ? new Date(req.body.baptismDate) : null,
      baptismChurch: req.body.baptismChurch || null,
      fatherName: req.body.fatherName || null,
      motherName: req.body.motherName || null,
      currentAddress: req.body.currentAddress || null,
      godfatherName: req.body.godfatherName || null,
      godmotherName: req.body.godmotherName || null,
      status: "pending",
      createdAt: new Date(),
    };

    const result = await db.collection("kumpilrequests").insertOne(kumpilData);

    res.status(201).json({ message: "Kumpil request saved!", id: result.insertedId });
  } catch (err) {
    console.error("Kumpil request save error:", err);
    res.status(500).json({ message: "Failed to save Kumpil request." });
  }
});

app.get("/api/kumpil_requests", async (req, res) => {
  if (!db) return res.status(500).json({ message: "Database not connected yet." });

  try {
    const requests = await db
      .collection("kumpilrequests")
      .find()
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).json(requests);
  } catch (err) {
    console.error("Fetch Kumpil requests error:", err);
    res.status(500).json({ message: "Failed to fetch Kumpil requests." });
  }
});



// =======================
// START SERVER
// =======================
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
});

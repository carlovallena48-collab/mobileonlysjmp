const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const { ObjectId } = require("mongodb"); 
const connectDB = require("./connect.cjs");
const { OAuth2Client } = require('google-auth-library');
require("dotenv").config({ path: "./config.env" });

// FILE UPLOAD IMPORTS
const multer = require("multer");
const path = require("path");
const fs = require("fs");

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
// MULTER CONFIGURATION
// =======================
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    cb(null, `${uniqueSuffix}-${file.originalname}`); 
  },
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

app.use("/uploads", express.static(uploadDir));

// =======================
// SIGNUP ROUTE
// =======================
app.post("/api/signup", async (req, res) => {
  try {
    const { fullName, email, password, address, contact, role } = req.body;

    const existingUser = await db.collection("users").findOne({ email: email.trim().toLowerCase() });
    if (existingUser) {
        return res.status(409).json({ message: "Email already registered." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      fullName: fullName?.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      address: address?.trim() || null, 
      contact: contact?.trim() || null, 
      role: role || "Member",
      profileImage: "https://i.ibb.co/L95zB7X/emojiprofile.png", 
      createdAt: new Date(),
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
// GOOGLE AUTH ROUTE
// =======================
app.post('/auth/google/expo', async (req, res) => {
    try {
        const { accessToken } = req.body;
        
        if (!accessToken) {
            return res.status(400).json({ success: false, message: 'Access token required' });
        }

        console.log('🔐 Google auth with token:', accessToken.substring(0, 20) + '...');

        // Initialize Google OAuth client
        const client = new OAuth2Client('630251895833-jgbkmqav3iq67fhf7gg2pl3gmhap62kk.apps.googleusercontent.com');
        
        // Verify the access token
        const ticket = await client.verifyIdToken({
            idToken: accessToken,
            audience: '630251895833-jgbkmqav3iq67fhf7gg2pl3gmhap62kk.apps.googleusercontent.com'
        });
        
        const payload = ticket.getPayload();
        console.log('👤 Google user info:', payload.email);
        
        // Check if user exists in your database
        let user = await db.collection("users").findOne({ email: payload.email });
        
        if (!user) {
            // Create new user
            const newUser = {
                googleId: payload.sub,
                fullName: payload.name,
                email: payload.email,
                profileImage: payload.picture,
                role: "Member",
                createdAt: new Date(),
                address: null,
                contact: null
            };
            
            const result = await db.collection("users").insertOne(newUser);
            user = { ...newUser, _id: result.insertedId };
            console.log('✅ New user created:', payload.email);
        } else {
            console.log('✅ Existing user found:', payload.email);
        }
        
        // Remove password field if exists
        const { password, ...userWithoutPassword } = user;
        
        res.json({ 
            success: true, 
            user: userWithoutPassword,
            message: "Google login successful" 
        });
        
    } catch (error) {
        console.error('❌ Google auth error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Google authentication failed: ' + error.message 
        });
    }
});

// =======================
// PROFILE ROUTE (GET)
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

    if (!user.profileImage || user.profileImage === "..assets/userpriofile.png") {
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
app.put("/api/profile/:email", upload.single("profileImage"), async (req, res) => {
  if (!db) {
    console.error("❌ Database not connected");
    return res.status(500).json({ success: false, message: "Database not connected yet." });
  }

  try {
    const queryEmail = req.params.email?.trim().toLowerCase();
    
    console.log("🔄 UPDATE PROFILE REQUEST FOR:", queryEmail);
    console.log("📝 Request body:", req.body);
    console.log("🖼️ File received:", req.file ? req.file.filename : "No file");

    // Check if user exists
    const existingUser = await db.collection("users").findOne({ email: queryEmail });
    if (!existingUser) {
      console.warn(`❌ User not found: ${queryEmail}`);
      return res.status(404).json({ success: false, message: "User not found." });
    }

    console.log("✅ User found:", existingUser.email);

    // Build update fields
    const updateFields = { 
      updatedAt: new Date(),
      fullName: req.body.fullName || existingUser.fullName,
      address: req.body.address || existingUser.address,
      contact: req.body.contact || existingUser.contact
    };

    // Handle image upload
    if (req.file) {
      const imageUrl = `http://${req.get("host")}/uploads/${req.file.filename}`;
      updateFields.profileImage = imageUrl;
      console.log("🖼️ New image URL:", imageUrl);
    }

    console.log("📝 Final update fields:", updateFields);

    // SIMPLE AND RELIABLE UPDATE APPROACH
    const updateResult = await db.collection("users").updateOne(
      { email: queryEmail },
      { $set: updateFields }
    );

    console.log("📊 Update result:", {
      matchedCount: updateResult.matchedCount,
      modifiedCount: updateResult.modifiedCount,
      acknowledged: updateResult.acknowledged
    });

    if (updateResult.matchedCount === 0) {
      console.error("❌ No user matched for update");
      return res.status(404).json({ success: false, message: "User not found for update." });
    }

    // Get updated user data
    const updatedUser = await db.collection("users").findOne(
      { email: queryEmail },
      { projection: { password: 0 } }
    );

    if (!updatedUser) {
      console.error("❌ Failed to fetch updated user");
      return res.status(500).json({ success: false, message: "Profile updated but failed to fetch updated data." });
    }

    console.log("✅ PROFILE UPDATE SUCCESSFUL");
    console.log("👤 Updated user data:", {
      fullName: updatedUser.fullName,
      email: updatedUser.email,
      profileImage: updatedUser.profileImage
    });

    res.status(200).json({
      success: true,
      message: "Profile updated successfully!",
      user: updatedUser
    });

  } catch (err) {
    console.error("❌ PROFILE UPDATE ERROR:", err);
    console.error("❌ Error stack:", err.stack);
    
    res.status(500).json({ 
      success: false,
      message: "Failed to update profile. Please try again." 
    });
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
      { $set: { password: hashedPassword, updatedAt: new Date() } }
    );

    res.json({ success: true, message: "Password updated successfully" });
  } catch (err) {
    console.error("Change password error:", err);
    res.status(500).json({ success: false, message: "Something went wrong." });
  }
});
// =======================
// FORGOT PASSWORD REQUEST ROUTE - WITH VERIFICATION CODE
// =======================
app.post("/api/forgot-password", async (req, res) => {
  if (!db) return res.status(500).json({ message: "Database not connected yet." });

  try {
    const { email } = req.body;
    console.log('📧 Forgot password request for:', email);

    const user = await db.collection("users").findOne({ email: email.trim().toLowerCase() });

    // ALWAYS return success message for security
    const successMessage = "If a matching account was found, a verification code has been sent to your email.";

    if (!user) {
      console.log('📭 Email not found in database');
      return res.status(200).json({ message: successMessage });
    }

    console.log('✅ User found:', user.email);

    // Generate 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const codeExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Save verification code to database
    await db.collection("users").updateOne(
      { _id: user._id },
      { 
        $set: { 
          resetCode: verificationCode,
          codeExpiry: codeExpiry,
          updatedAt: new Date() 
        } 
      }
    );

    console.log('🔐 Verification code generated:', verificationCode);

    // EMAIL CONFIGURATION
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Verify email configuration
    await transporter.verify();

    const mailOptions = {
      from: {
        name: 'SJMP Parish App',
        address: process.env.EMAIL_USER
      },
      to: user.email,
      subject: "SJMP Parish App - Password Reset Verification Code",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1F7A8C;">Password Reset Verification</h2>
          <p>Hello ${user.fullName || 'User'},</p>
          <p>You requested a password reset for your SJMP Parish App account.</p>
          <p>Use the verification code below to reset your password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <div style="background-color: #f4f4f4; padding: 20px; border-radius: 10px; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1F7A8C;">
              ${verificationCode}
            </div>
          </div>
          <p><strong>This code will expire in 15 minutes.</strong></p>
          <p>If you didn't request this reset, please ignore this email.</p>
          <br>
          <p>Best regards,<br>SJMP Parish App Team</p>
        </div>
      `,
    };

    // Send email
    const emailResult = await transporter.sendMail(mailOptions);
    console.log('✅ Verification code email sent successfully!');

    res.status(200).json({ 
      message: successMessage,
      email: user.email // Return email for frontend
    });

  } catch (err) {
    console.error('❌ FORGOT PASSWORD ERROR:', err);
    
    let errorMessage = "Error sending verification code. ";
    
    if (err.code === 'EAUTH') {
      errorMessage += "Email authentication failed. Please check your email configuration.";
    } else {
      errorMessage += "Please try again later.";
    }
    
    res.status(500).json({ message: errorMessage });
  }
});

// =======================
// VERIFY RESET CODE
// =======================
app.post("/api/verify-reset-code", async (req, res) => {
  if (!db) return res.status(500).json({ message: "Database not connected yet." });

  try {
    const { email, code } = req.body;
    console.log('🔐 Verifying reset code for:', email);

    const user = await db.collection("users").findOne({ 
      email: email.trim().toLowerCase(),
      resetCode: code
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid verification code." });
    }

    // Check if code is expired
    if (user.codeExpiry && new Date() > user.codeExpiry) {
      return res.status(400).json({ message: "Verification code has expired." });
    }

    console.log('✅ Verification code is valid');

    // Generate reset token for password reset
    const resetToken = crypto.randomBytes(32).toString("hex");
    const tokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    // Save reset token and clear verification code
    await db.collection("users").updateOne(
      { _id: user._id },
      { 
        $set: { 
          resetToken: resetToken,
          tokenExpiry: tokenExpiry,
          updatedAt: new Date() 
        },
        $unset: {
          resetCode: "",
          codeExpiry: ""
        }
      }
    );

    res.status(200).json({ 
      success: true,
      message: "Verification successful.",
      resetToken: resetToken
    });

  } catch (err) {
    console.error('❌ VERIFY CODE ERROR:', err);
    res.status(500).json({ message: "Server error. Please try again." });
  }
});

// =======================
// TEST EMAIL CONFIGURATION
// =======================
app.post("/api/test-email", async (req, res) => {
  try {
    console.log('🧪 Testing email configuration...');
    console.log('📧 Email User:', process.env.EMAIL_USER);
    
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Test connection
    await transporter.verify();
    console.log('✅ Email server connection successful');

    // Send test email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // Send to yourself
      subject: "✅ SJMP Parish App - Email Test Successful",
      text: "Congratulations! Your email configuration is working correctly.",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1eb059ff;">✅ Email Test Successful!</h2>
          <p>Your SJMP Parish App email configuration is working correctly.</p>
          <p>You can now send password reset emails to your users.</p>
          <br>
          <p><strong>Server Time:</strong> ${new Date().toString()}</p>
        </div>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Test email sent successfully!');
    console.log('📧 Message ID:', result.messageId);

    res.json({ 
      success: true, 
      message: "Test email sent successfully!",
      messageId: result.messageId 
    });

  } catch (err) {
    console.error('❌ EMAIL TEST ERROR:', err);
    
    let errorDetails = "Email test failed: ";
    if (err.code === 'EAUTH') {
      errorDetails += "Authentication failed. Check your email and app password.";
    } else if (err.code === 'EENVELOPE') {
      errorDetails += "Invalid email address.";
    } else {
      errorDetails += err.message;
    }
    
    res.status(500).json({ 
      success: false, 
      error: errorDetails,
      code: err.code 
    });
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
        $set: { password: hashedPassword, updatedAt: new Date() },
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
// BAPTISM REQUEST ROUTES - UPDATED WITH BAPTISM TYPE
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
      baptismTime: req.body.baptismTime || null, 
      contact: req.body.contact,
      sacrament: "Baptism",
      status: "pending", 
      submittedByEmail: req.body.submittedByEmail?.trim().toLowerCase(),
      createdAt: new Date(),
      // NEW FIELDS ADDED
      baptismType: req.body.baptismType || "Common Baptism", // Solo Baptism or Common Baptism
      fee: req.body.baptismType === "Solo Baptism" ? "₱1,500.00" : "₱500.00",
      requirementsStatus: {
        birthCertificate: false,
        parentsCatholic: false,
        noRecordCertificate: false,
        seminarAttended: false,
        baptismalClothes: false,
        candle: false
      },
      paymentStatus: "unpaid",
      // ADDITIONAL FIELDS FOR BETTER TRACKING
      requestNumber: `BAP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      lastUpdated: new Date()
    };

    if (!baptismData.submittedByEmail) {
      return res.status(400).json({ message: "User email is required." });
    }

    const result = await db.collection("baptismrequests").insertOne(baptismData);

    console.log('✅ Baptism request saved with type:', baptismData.baptismType);
    console.log('💰 Fee:', baptismData.fee);
    console.log('🔢 Request Number:', baptismData.requestNumber);

    res.status(201).json({ 
      message: "Baptismal request saved!", 
      id: result.insertedId,
      requestNumber: baptismData.requestNumber,
      baptismType: baptismData.baptismType,
      fee: baptismData.fee
    });
  } catch (err) {
    console.error("Baptism request save error:", err);
    res.status(500).json({ message: "Failed to save baptismal request." });
  }
});

app.get("/api/baptismrequests/:email", async (req, res) => {
  if (!db) return res.status(500).json({ message: "Database not connected yet." });

  try {
    const { email } = req.params;
    const userEmail = email.trim().toLowerCase();

    const requests = await db
      .collection("baptismrequests")
      .find({ submittedByEmail: userEmail })
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).json(requests);
  } catch (err) {
    console.error("Fetch baptism requests error:", err);
    res.status(500).json({ message: "Failed to fetch baptismal requests." });
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
// UPDATE BAPTISM REQUEST (FOR ADMIN AND USERS)
// =======================
app.put("/api/baptismrequests/:id", async (req, res) => {
  if (!db) return res.status(500).json({ message: "Database not connected yet." });

  try {
    const { id } = req.params;
    const updateData = req.body;

    // Add last updated timestamp
    updateData.lastUpdated = new Date();

    const result = await db.collection("baptismrequests").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Baptism request not found." });
    }

    res.status(200).json({ 
      message: "Baptism request updated successfully!",
      updatedFields: Object.keys(updateData)
    });
  } catch (err) {
    console.error("Update baptism request error:", err);
    res.status(500).json({ message: "Failed to update baptism request." });
  }
});

// =======================
// GET BAPTISM STATISTICS
// =======================
app.get("/api/baptism-stats", async (req, res) => {
  if (!db) return res.status(500).json({ message: "Database not connected yet." });

  try {
    const totalRequests = await db.collection("baptismrequests").countDocuments();
    const pendingRequests = await db.collection("baptismrequests").countDocuments({ status: "pending" });
    const approvedRequests = await db.collection("baptismrequests").countDocuments({ status: "approved" });
    const soloBaptisms = await db.collection("baptismrequests").countDocuments({ baptismType: "Solo Baptism" });
    const commonBaptisms = await db.collection("baptismrequests").countDocuments({ baptismType: "Common Baptism" });

    const stats = {
      total: totalRequests,
      pending: pendingRequests,
      approved: approvedRequests,
      soloBaptisms: soloBaptisms,
      commonBaptisms: commonBaptisms,
      revenue: {
        solo: soloBaptisms * 1500,
        common: commonBaptisms * 500,
        total: (soloBaptisms * 1500) + (commonBaptisms * 500)
      }
    };

    res.status(200).json(stats);
  } catch (err) {
    console.error("Fetch baptism stats error:", err);
    res.status(500).json({ message: "Failed to fetch baptism statistics." });
  }
});

// =======================
// SEARCH BAPTISM REQUESTS
// =======================
app.get("/api/baptismrequests/search/:query", async (req, res) => {
  if (!db) return res.status(500).json({ message: "Database not connected yet." });

  try {
    const { query } = req.params;
    
    const requests = await db.collection("baptismrequests").find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { requestNumber: { $regex: query, $options: "i" } },
        { submittedByEmail: { $regex: query, $options: "i" } },
        { baptismType: { $regex: query, $options: "i" } }
      ]
    }).sort({ createdAt: -1 }).toArray();

    res.status(200).json(requests);
  } catch (err) {
    console.error("Search baptism requests error:", err);
    res.status(500).json({ message: "Failed to search baptism requests." });
  }
});

// =======================
// KUMPIL REQUEST ROUTES
// =======================
app.post("/api/kumpil_requests", async (req, res) => {
  if (!db) return res.status(500).json({ message: "Database not connected yet." });

  try {
    const kumpilData = {
      sacrament: "Kumpil",
      kumpilDate: req.body.kumpilDate ? new Date(req.body.kumpilDate) : null,
      kumpilTime: req.body.kumpilTime || null, 
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
      submittedByEmail: req.body.submittedByEmail?.trim().toLowerCase() || "guest@example.com", 
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
// MARRIAGE REQUEST ROUTES
// =======================
app.post("/api/marriage_requests", async (req, res) => {
  if (!db) return res.status(500).json({ message: "Database not connected yet." });

  try {
    const marriageData = {
      sacrament: "Kasal",
      groomName: req.body.groomName,
      brideName: req.body.brideName,
      marriageDate: req.body.marriageDate ? new Date(req.body.marriageDate) : null,
      marriageTime: req.body.marriageTime || null, 
      groomContact: req.body.groomContact || null,
      brideContact: req.body.brideContact || null,
      currentAddress: req.body.currentAddress || null,
      requirements: req.body.requirements || [], 
      status: "pending",
      submittedByEmail: req.body.submittedByEmail?.trim().toLowerCase() || "guest@example.com", 
      createdAt: new Date(),
    };

    const result = await db.collection("marriagerequests").insertOne(marriageData);

    res.status(201).json({ message: "Marriage request saved!", id: result.insertedId });
  } catch (err) {
    console.error("Marriage request save error:", err);
    res.status(500).json({ message: "Failed to save Marriage request." });
  }
});

app.get("/api/marriage_requests", async (req, res) => {
  if (!db) return res.status(500).json({ message: "Database not connected yet." });

  try {
    const requests = await db
      .collection("marriagerequests")
      .find()
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).json(requests);
  } catch (err) {
    console.error("Fetch Marriage requests error:", err);
    res.status(500).json({ message: "Failed to fetch Marriage requests." });
  }
});
// ✅ ADD THESE ROUTES TO YOUR SERVER (server.js)

// =======================
// NOTIFICATION ROUTES
// =======================
app.get("/api/notifications/:email", async (req, res) => {
  if (!db) return res.status(500).json({ message: "Database not connected yet." });

  try {
    const { email } = req.params;
    const userEmail = email.trim().toLowerCase();

    // Get user's baptism requests to check for status updates
    const baptismRequests = await db
      .collection("baptismrequests")
      .find({ submittedByEmail: userEmail })
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).json(baptismRequests);
  } catch (err) {
    console.error("Fetch notifications error:", err);
    res.status(500).json({ message: "Failed to fetch notifications." });
  }
});

// =======================
// UPDATE BAPTISM STATUS (FOR ADMIN)
// =======================
app.put("/api/baptismrequests/:id/status", async (req, res) => {
  if (!db) return res.status(500).json({ message: "Database not connected yet." });

  try {
    const { id } = req.params;
    const { status, remarks } = req.body;

    const result = await db.collection("baptismrequests").updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          status: status,
          remarks: remarks,
          updatedAt: new Date(),
          lastUpdated: new Date()
        } 
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Baptism request not found." });
    }

    res.status(200).json({ 
      message: `Baptism request ${status} successfully!`,
      status: status 
    });
  } catch (err) {
    console.error("Update baptism status error:", err);
    res.status(500).json({ message: "Failed to update baptism status." });
  }
});

// =======================
// GET BAPTISM BY ID
// =======================
app.get("/api/baptismrequests/id/:id", async (req, res) => {
  if (!db) return res.status(500).json({ message: "Database not connected yet." });

  try {
    const { id } = req.params;

    const request = await db.collection("baptismrequests").findOne({
      _id: new ObjectId(id)
    });

    if (!request) {
      return res.status(404).json({ message: "Baptism request not found." });
    }

    res.status(200).json(request);
  } catch (err) {
    console.error("Fetch baptism by ID error:", err);
    res.status(500).json({ message: "Failed to fetch baptism request." });
  }
});

// =======================
// UPDATE BAPTISM PAYMENT STATUS
// =======================
app.put("/api/baptismrequests/:id/payment", async (req, res) => {
  if (!db) return res.status(500).json({ message: "Database not connected yet." });

  try {
    const { id } = req.params;
    const { paymentStatus, paymentDate, receiptNumber } = req.body;

    const updateData = {
      paymentStatus: paymentStatus || "paid",
      lastUpdated: new Date()
    };

    if (paymentDate) updateData.paymentDate = new Date(paymentDate);
    if (receiptNumber) updateData.receiptNumber = receiptNumber;

    const result = await db.collection("baptismrequests").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Baptism request not found." });
    }

    res.status(200).json({ 
      message: `Payment status updated to ${updateData.paymentStatus}`,
      paymentStatus: updateData.paymentStatus
    });
  } catch (err) {
    console.error("Update baptism payment error:", err);
    res.status(500).json({ message: "Failed to update payment status." });
  }
});

// =======================
// UPDATE BAPTISM REQUIREMENTS STATUS
// =======================
app.put("/api/baptismrequests/:id/requirements", async (req, res) => {
  if (!db) return res.status(500).json({ message: "Database not connected yet." });

  try {
    const { id } = req.params;
    const { requirementsStatus } = req.body;

    const result = await db.collection("baptismrequests").updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          requirementsStatus: requirementsStatus,
          lastUpdated: new Date()
        } 
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Baptism request not found." });
    }

    res.status(200).json({ 
      message: "Requirements status updated successfully!",
      requirementsStatus: requirementsStatus
    });
  } catch (err) {
    console.error("Update baptism requirements error:", err);
    res.status(500).json({ message: "Failed to update requirements status." });
  }
});

// =======================
// GET BAPTISM BY BAPTISM TYPE
// =======================
app.get("/api/baptismrequests/type/:type", async (req, res) => {
  if (!db) return res.status(500).json({ message: "Database not connected yet." });

  try {
    const { type } = req.params;

    const requests = await db.collection("baptismrequests")
      .find({ baptismType: type })
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).json(requests);
  } catch (err) {
    console.error("Fetch baptism by type error:", err);
    res.status(500).json({ message: "Failed to fetch baptism requests by type." });
  }
});
// =======================
// FIRST COMMUNION ROUTES
// =======================
app.post("/api/first_communion_requests", async (req, res) => {
  if (!db) return res.status(500).json({ message: "Database not connected yet." });

  try {
    const communionData = {
      ...req.body,
      createdAt: new Date(),
      status: req.body.status || 'pending',
      paymentStatus: req.body.paymentStatus || 'unpaid'
    };

    const result = await db.collection("firstcommunionrequests").insertOne(communionData);

    res.status(201).json({ 
      message: "First Communion request saved!", 
      id: result.insertedId 
    });
  } catch (err) {
    console.error("First Communion request save error:", err);
    res.status(500).json({ message: "Failed to save First Communion request." });
  }
});

app.get("/api/first_communion_requests", async (req, res) => {
  if (!db) return res.status(500).json({ message: "Database not connected yet." });

  try {
    const requests = await db
      .collection("firstcommunionrequests")
      .find()
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).json(requests);
  } catch (err) {
    console.error("Fetch First Communion requests error:", err);
    res.status(500).json({ message: "Failed to fetch First Communion requests." });
  }
});
// =======================
// HOLY ORDERS REQUEST ROUTES - UPDATED
// =======================
app.post("/api/holy_orders_requests", async (req, res) => {
  if (!db) return res.status(500).json({ message: "Database not connected yet." });

  try {
    console.log('📥 Received Holy Orders request:', req.body);

    // Basic validation
    if (!req.body.name || !req.body.email || !req.body.contactNumber) {
      return res.status(400).json({ 
        message: "Name, email, and contact number are required." 
      });
    }

    const holyOrdersData = {
      sacrament: "Holy Orders",
      name: req.body.name,
      email: req.body.email,
      contactNumber: req.body.contactNumber,
      status: "pending",
      submittedByEmail: req.body.email.trim().toLowerCase(), // Use the form email
      createdAt: new Date(),
      requestNumber: `HOLY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      lastUpdated: new Date(),
      // Optional fields with empty defaults
      references: []
    };

    const result = await db.collection("holyordersrequests").insertOne(holyOrdersData);

    console.log('✅ Holy Orders request saved:', holyOrdersData.requestNumber);

    res.status(201).json({ 
      message: "Holy Orders application submitted successfully!", 
      id: result.insertedId,
      requestNumber: holyOrdersData.requestNumber
    });
  } catch (err) {
    console.error("Holy Orders request save error:", err);
    res.status(500).json({ message: "Failed to submit Holy Orders application." });
  }
});

// =======================
// PAMISA REQUEST ROUTES
// =======================
app.post("/api/pamisa_requests", async (req, res) => {
  if (!db) return res.status(500).json({ message: "Database not connected yet." });

  try {
    console.log('📥 Received Pamisa request:', req.body);

    // Basic validation
    if (!req.body.intention || !req.body.names || !req.body.date || !req.body.time) {
      return res.status(400).json({ 
        message: "Intention, names, date, and time are required." 
      });
    }

    const pamisaData = {
      sacrament: "Pamisa",
      intention: req.body.intention,
      names: req.body.names,
      date: req.body.date,
      time: req.body.time,
      massSponsor: req.body.massSponsor || "",
      donation: req.body.donation || "0",
      status: "pending",
      createdAt: new Date(),
      requestNumber: req.body.requestNumber || `MASS-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      lastUpdated: new Date()
    };

    const result = await db.collection("pamisarequests").insertOne(pamisaData);

    console.log('✅ Pamisa request saved:', pamisaData.requestNumber);

    res.status(201).json({ 
      message: "Pamisa request submitted successfully!", 
      id: result.insertedId,
      requestNumber: pamisaData.requestNumber
    });
  } catch (err) {
    console.error("Pamisa request save error:", err);
    res.status(500).json({ message: "Failed to submit Pamisa request." });
  }
});

app.get("/api/pamisa_requests", async (req, res) => {
  if (!db) return res.status(500).json({ message: "Database not connected yet." });

  try {
    const requests = await db
      .collection("pamisarequests")
      .find()
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).json(requests);
  } catch (err) {
    console.error("Fetch Pamisa requests error:", err);
    res.status(500).json({ message: "Failed to fetch Pamisa requests." });
  }
});

// =======================
// BLESSING REQUEST ROUTES
// =======================
app.post("/api/blessing_requests", async (req, res) => {
  if (!db) return res.status(500).json({ message: "Database not connected yet." });

  try {
    console.log('📥 Received Blessing request:', req.body);

    // Basic validation
    if (!req.body.name || !req.body.address || !req.body.contactNumber || !req.body.date || !req.body.time || !req.body.blessingType) {
      return res.status(400).json({ 
        message: "Name, address, contact number, date, time, and blessing type are required." 
      });
    }

    const blessingData = {
      sacrament: "Blessing",
      name: req.body.name,
      blessingType: req.body.blessingType,
      requestForDetails: req.body.requestForDetails || "",
      address: req.body.address,
      contactNumber: req.body.contactNumber,
      date: req.body.date,
      time: req.body.time,
      displayDate: req.body.date,
      displayTime: req.body.time,
      status: "pending",
      createdAt: new Date(),
      requestNumber: req.body.requestNumber || `BLESS-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      lastUpdated: new Date(),
      donationNote: "Cash donation to be given during the blessing ceremony"
    };

    const result = await db.collection("blessingrequests").insertOne(blessingData);

    console.log('✅ Blessing request saved:', blessingData.requestNumber);

    res.status(201).json({ 
      message: "Blessing request submitted successfully!", 
      id: result.insertedId,
      requestNumber: blessingData.requestNumber
    });
  } catch (err) {
    console.error("Blessing request save error:", err);
    res.status(500).json({ message: "Failed to submit blessing request." });
  }
});

app.get("/api/blessing_requests", async (req, res) => {
  if (!db) return res.status(500).json({ message: "Database not connected yet." });

  try {
    const requests = await db
      .collection("blessingrequests")
      .find()
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).json(requests);
  } catch (err) {
    console.error("Fetch Blessing requests error:", err);
    res.status(500).json({ message: "Failed to fetch blessing requests." });
  }
});

app.get("/api/blessing_requests/:contactNumber", async (req, res) => {
  if (!db) return res.status(500).json({ message: "Database not connected yet." });

  try {
    const { contactNumber } = req.params;

    const requests = await db
      .collection("blessingrequests")
      .find({ contactNumber: contactNumber })
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).json(requests);
  } catch (err) {
    console.error("Fetch user Blessing requests error:", err);
    res.status(500).json({ message: "Failed to fetch your blessing requests." });
  }
});

// =======================
// GET USER REQUESTS BY EMAIL FOR EACH SACRAMENT
// =======================

// For Kumpil - Get by user email
app.get("/api/kumpil_requests/:email", async (req, res) => {
  if (!db) return res.status(500).json({ message: "Database not connected yet." });

  try {
    const { email } = req.params;
    const userEmail = email.trim().toLowerCase();

    const requests = await db
      .collection("kumpilrequests")
      .find({ submittedByEmail: userEmail })
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).json(requests);
  } catch (err) {
    console.error("Fetch user Kumpil requests error:", err);
    res.status(500).json({ message: "Failed to fetch Kumpil requests." });
  }
});

// For Marriage - Get by user email
app.get("/api/marriage_requests/:email", async (req, res) => {
  if (!db) return res.status(500).json({ message: "Database not connected yet." });

  try {
    const { email } = req.params;
    const userEmail = email.trim().toLowerCase();

    const requests = await db
      .collection("marriagerequests")
      .find({ submittedByEmail: userEmail })
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).json(requests);
  } catch (err) {
    console.error("Fetch user Marriage requests error:", err);
    res.status(500).json({ message: "Failed to fetch Marriage requests." });
  }
});

// For Pamisa - Get by user email
app.get("/api/pamisa_requests/:email", async (req, res) => {
  if (!db) return res.status(500).json({ message: "Database not connected yet." });

  try {
    const { email } = req.params;
    const userEmail = email.trim().toLowerCase();

    const requests = await db
      .collection("pamisarequests")
      .find({ 
        $or: [
          { submittedByEmail: userEmail },
          { email: userEmail }
        ]
      })
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).json(requests);
  } catch (err) {
    console.error("Fetch user Pamisa requests error:", err);
    res.status(500).json({ message: "Failed to fetch Pamisa requests." });
  }
});

// For Blessing - Get by user email
app.get("/api/blessing_requests/:email", async (req, res) => {
  if (!db) return res.status(500).json({ message: "Database not connected yet." });

  try {
    const { email } = req.params;
    const userEmail = email.trim().toLowerCase();

    const requests = await db
      .collection("blessingrequests")
      .find({ 
        $or: [
          { submittedByEmail: userEmail },
          { email: userEmail }
        ]
      })
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).json(requests);
  } catch (err) {
    console.error("Fetch user Blessing requests error:", err);
    res.status(500).json({ message: "Failed to fetch Blessing requests." });
  }
});

// For Holy Orders - Get by user email
app.get("/api/holy_orders_requests/:email", async (req, res) => {
  if (!db) return res.status(500).json({ message: "Database not connected yet." });

  try {
    const { email } = req.params;
    const userEmail = email.trim().toLowerCase();

    const requests = await db
      .collection("holyordersrequests")
      .find({ submittedByEmail: userEmail })
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).json(requests);
  } catch (err) {
    console.error("Fetch user Holy Orders requests error:", err);
    res.status(500).json({ message: "Failed to fetch Holy Orders requests." });
  }
});

// For First Communion - Get by user email
app.get("/api/first_communion_requests/:email", async (req, res) => {
  if (!db) return res.status(500).json({ message: "Database not connected yet." });

  try {
    const { email } = req.params;
    const userEmail = email.trim().toLowerCase();

    const requests = await db
      .collection("firstcommunionrequests")
      .find({ submittedByEmail: userEmail })
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).json(requests);
  } catch (err) {
    console.error("Fetch user First Communion requests error:", err);
    res.status(500).json({ message: "Failed to fetch First Communion requests." });
  }
});

// =======================
// START SERVER
// =======================
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
});
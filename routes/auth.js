const express = require("express");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const { getDB } = require("../config/database");
const { sendVerificationEmail, sendPasswordResetEmail } = require("../utils/email");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// SIGNUP ROUTE
router.post("/signup", async (req, res) => {
  try {
    const { fullName, email, password, address, contact, role } = req.body;
    const db = getDB();

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Please enter a valid email address." });
    }

    // Check if user already exists
    const existingUser = await db.collection("users").findOne({ email: email.trim().toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ message: "Email already registered." });
    }

    // Password validation
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const newUser = {
      fullName: fullName?.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      address: address?.trim() || null,
      contact: contact?.trim() || null,
      role: role || "Member",
      profileImage: "https://i.ibb.co/L95zB7X/emojiprofile.png",
      isVerified: false,
      verificationToken,
      verificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      createdAt: new Date(),
    };

    const result = await db.collection("users").insertOne(newUser);

    // Send verification email
    try {
      await sendVerificationEmail(email, fullName, verificationToken);
      
      res.status(201).json({ 
        message: "Registration successful! Please check your email to verify your account.",
        requiresVerification: true
      });
    } catch (emailError) {
      console.error('❌ Email sending error:', emailError);
      res.status(201).json({ 
        message: "Registration successful but verification email failed. Please contact support.",
        requiresVerification: true
      });
    }

  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Something went wrong during registration." });
  }
});

// LOGIN ROUTE
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const db = getDB();

    const user = await db.collection("users").findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    if (!user.isVerified) {
      return res.status(401).json({ 
        message: "Please verify your email address before logging in.",
        requiresVerification: true
      });
    }

    const token = jwt.sign(
      { 
        userId: user._id.toString(),
        email: user.email,
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: "Login successful",
      token,
      user: userWithoutPassword,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Something went wrong." });
  }
});

// EMAIL VERIFICATION ROUTE
router.get("/verify-email", async (req, res) => {
  try {
    const { token } = req.query;
    const db = getDB();

    if (!token) {
      return res.status(400).json({ message: "Verification token is required." });
    }

    const user = await db.collection("users").findOne({
      verificationToken: token,
      verificationExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired verification token." });
    }

    await db.collection("users").updateOne(
      { _id: user._id },
      { 
        $set: { 
          isVerified: true,
          updatedAt: new Date()
        },
        $unset: {
          verificationToken: "",
          verificationExpires: ""
        }
      }
    );

    res.json({ 
      success: true,
      message: "Email verified successfully! You can now login to your account." 
    });
    
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ message: "Server error during email verification." });
  }
});

// RESEND VERIFICATION EMAIL
router.post("/resend-verification", async (req, res) => {
  try {
    const { email } = req.body;
    const db = getDB();

    const user = await db.collection("users").findOne({ 
      email: email.trim().toLowerCase(),
      isVerified: false 
    });

    if (!user) {
      return res.status(400).json({ 
        message: "User not found or already verified." 
      });
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    
    await db.collection("users").updateOne(
      { _id: user._id },
      { 
        $set: { 
          verificationToken,
          verificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
          updatedAt: new Date()
        }
      }
    );

    await sendVerificationEmail(email, user.fullName, verificationToken);

    res.json({ 
      message: "Verification email sent successfully! Please check your email." 
    });

  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ message: "Failed to resend verification email." });
  }
});

// FORGOT PASSWORD
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const db = getDB();

    const user = await db.collection("users").findOne({ email: email.trim().toLowerCase() });
    const successMessage = "If a matching account was found, a verification code has been sent to your email.";

    if (!user) {
      return res.status(200).json({ message: successMessage });
    }

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const codeExpiry = new Date(Date.now() + 15 * 60 * 1000);

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

    await sendPasswordResetEmail(user.email, user.fullName, verificationCode);

    res.status(200).json({ 
      message: successMessage,
      email: user.email
    });

  } catch (err) {
    console.error('❌ FORGOT PASSWORD ERROR:', err);
    res.status(500).json({ message: "Error sending verification code. Please try again later." });
  }
});

// VERIFY RESET CODE
router.post("/verify-reset-code", async (req, res) => {
  try {
    const { email, code } = req.body;
    const db = getDB();

    const user = await db.collection("users").findOne({ 
      email: email.trim().toLowerCase(),
      resetCode: code
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid verification code." });
    }

    if (user.codeExpiry && new Date() > user.codeExpiry) {
      return res.status(400).json({ message: "Verification code has expired." });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const tokenExpiry = new Date(Date.now() + 3600000);

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

// RESET PASSWORD
router.post("/reset-password/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;
    const db = getDB();

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

// GOOGLE AUTH
router.post('/auth/google/expo', async (req, res) => {
  try {
    const { accessToken } = req.body;
    const db = getDB();
    
    if (!accessToken) {
      return res.status(400).json({ success: false, message: 'Access token required' });
    }

    const client = new OAuth2Client('630251895833-jgbkmqav3iq67fhf7gg2pl3gmhap62kk.apps.googleusercontent.com');
    const ticket = await client.verifyIdToken({
      idToken: accessToken,
      audience: '630251895833-jgbkmqav3iq67fhf7gg2pl3gmhap62kk.apps.googleusercontent.com'
    });
    
    const payload = ticket.getPayload();
    
    let user = await db.collection("users").findOne({ email: payload.email });
    
    if (!user) {
      const newUser = {
        googleId: payload.sub,
        fullName: payload.name,
        email: payload.email,
        profileImage: payload.picture,
        role: "Member",
        isVerified: true,
        createdAt: new Date(),
        address: null,
        contact: null
      };
      
      const result = await db.collection("users").insertOne(newUser);
      user = { ...newUser, _id: result.insertedId };
    }
    
    const { password, ...userWithoutPassword } = user;
    
    // Generate JWT token for Google auth user
    const token = jwt.sign(
      { 
        userId: user._id.toString(),
        email: user.email,
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
    
    res.json({ 
      success: true, 
      user: userWithoutPassword,
      token: token,
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

module.exports = router;
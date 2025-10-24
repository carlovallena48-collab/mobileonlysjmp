const express = require("express");
const bcrypt = require('bcryptjs');
const { ObjectId } = require("mongodb");
const { getDB } = require("../config/database");
const upload = require("../config/multer");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// GET USER PROFILE
router.get("/profile/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const db = getDB();

    const user = await db.collection("users").findOne(
      { email: email.trim().toLowerCase() },
      {
        projection: {
          password: 0,
          verificationToken: 0,
          resetCode: 0,
          resetToken: 0
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

// UPDATE PROFILE WITH IMAGE UPLOAD
router.put("/profile/:email", upload.single("profileImage"), async (req, res) => {
  try {
    const queryEmail = req.params.email?.trim().toLowerCase();
    const db = getDB();

    const existingUser = await db.collection("users").findOne({ email: queryEmail });
    if (!existingUser) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const updateFields = { 
      updatedAt: new Date(),
      fullName: req.body.fullName || existingUser.fullName,
      address: req.body.address || existingUser.address,
      contact: req.body.contact || existingUser.contact
    };

    if (req.file) {
      const imageUrl = `http://${req.get("host")}/uploads/${req.file.filename}`;
      updateFields.profileImage = imageUrl;
    }

    const updateResult = await db.collection("users").updateOne(
      { email: queryEmail },
      { $set: updateFields }
    );

    if (updateResult.matchedCount === 0) {
      return res.status(404).json({ success: false, message: "User not found for update." });
    }

    const updatedUser = await db.collection("users").findOne(
      { email: queryEmail },
      { projection: { password: 0 } }
    );

    res.status(200).json({
      success: true,
      message: "Profile updated successfully!",
      user: updatedUser
    });

  } catch (err) {
    console.error("❌ PROFILE UPDATE ERROR:", err);
    res.status(500).json({ 
      success: false,
      message: "Failed to update profile. Please try again." 
    });
  }
});

// CHANGE PASSWORD
router.put("/change-password/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const { currentPassword, newPassword } = req.body;
    const db = getDB();

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

// PROTECTED PROFILE ROUTE
router.get("/protected-profile", authMiddleware, async (req, res) => {
  try {
    const db = getDB();
    const user = await db.collection("users").findOne(
      { _id: req.user._id },
      { projection: { password: 0 } }
    );

    res.json({ user });
  } catch (error) {
    console.error('Protected profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
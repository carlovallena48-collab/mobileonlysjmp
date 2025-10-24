const express = require("express");
const { ObjectId } = require("mongodb");
const { getDB } = require("../config/database");

const router = express.Router();

// SUBMIT VOLUNTEER APPLICATION
router.post("/volunteer-applications", async (req, res) => {
  try {
    const db = getDB();

    if (!req.body.ministry || !req.body.fullName || !req.body.email || !req.body.contactNumber) {
      return res.status(400).json({ 
        message: "Ministry, full name, email, and contact number are required." 
      });
    }

    if (!req.body.submittedByEmail) {
      return res.status(400).json({ 
        message: "User authentication required. Please login first." 
      });
    }

    const volunteerData = {
      ministry: req.body.ministry,
      fullName: req.body.fullName,
      email: req.body.email,
      contactNumber: req.body.contactNumber,
      submittedByEmail: req.body.submittedByEmail.trim().toLowerCase(),
      status: "pending",
      applicationDate: new Date(req.body.applicationDate) || new Date(),
      requestNumber: req.body.requestNumber || `VOL-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      createdAt: new Date(),
      lastUpdated: new Date(),
      processedBy: null,
      processedDate: null,
      notes: "",
      requirements: {
        orientation: false,
        training: false,
        documents: false
      }
    };

    const result = await db.collection("volunteerapplications").insertOne(volunteerData);

    res.status(201).json({ 
      message: "Volunteer application submitted successfully!", 
      id: result.insertedId,
      requestNumber: volunteerData.requestNumber
    });
  } catch (err) {
    console.error("Volunteer application save error:", err);
    res.status(500).json({ message: "Failed to submit volunteer application." });
  }
});

// GET ALL VOLUNTEER APPLICATIONS (ADMIN)
router.get("/volunteer-applications", async (req, res) => {
  try {
    const db = getDB();
    const applications = await db
      .collection("volunteerapplications")
      .find()
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).json(applications);
  } catch (err) {
    console.error("Fetch volunteer applications error:", err);
    res.status(500).json({ message: "Failed to fetch volunteer applications." });
  }
});

// GET VOLUNTEER APPLICATIONS BY USER EMAIL
router.get("/volunteer-applications/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const db = getDB();

    const applications = await db
      .collection("volunteerapplications")
      .find({ submittedByEmail: email.trim().toLowerCase() })
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).json(applications);
  } catch (err) {
    console.error("Fetch user volunteer applications error:", err);
    res.status(500).json({ message: "Failed to fetch volunteer applications." });
  }
});

// UPDATE VOLUNTEER APPLICATION STATUS
router.put("/volunteer-applications/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes, processedBy } = req.body;
    const db = getDB();

    const updateData = {
      status: status,
      lastUpdated: new Date()
    };

    if (notes) updateData.notes = notes;
    if (processedBy) updateData.processedBy = processedBy;
    if (status === "approved" || status === "rejected") {
      updateData.processedDate = new Date();
    }

    const result = await db.collection("volunteerapplications").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Volunteer application not found." });
    }

    res.status(200).json({ 
      message: `Volunteer application ${status} successfully!`,
      status: status 
    });
  } catch (err) {
    console.error("Update volunteer application status error:", err);
    res.status(500).json({ message: "Failed to update volunteer application status." });
  }
});

// UPDATE VOLUNTEER REQUIREMENTS STATUS
router.put("/volunteer-applications/:id/requirements", async (req, res) => {
  try {
    const { id } = req.params;
    const { requirements } = req.body;
    const db = getDB();

    const result = await db.collection("volunteerapplications").updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          requirements: requirements,
          lastUpdated: new Date()
        } 
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Volunteer application not found." });
    }

    res.status(200).json({ 
      message: "Requirements status updated successfully!",
      requirements: requirements
    });
  } catch (err) {
    console.error("Update volunteer requirements error:", err);
    res.status(500).json({ message: "Failed to update requirements status." });
  }
});

// GET VOLUNTEER STATISTICS
router.get("/volunteer-stats", async (req, res) => {
  try {
    const db = getDB();

    const totalApplications = await db.collection("volunteerapplications").countDocuments();
    const pendingApplications = await db.collection("volunteerapplications").countDocuments({ status: "pending" });
    const approvedApplications = await db.collection("volunteerapplications").countDocuments({ status: "approved" });
    const rejectedApplications = await db.collection("volunteerapplications").countDocuments({ status: "rejected" });

    const ministryStats = await db.collection("volunteerapplications").aggregate([
      {
        $group: {
          _id: "$ministry",
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]).toArray();

    const stats = {
      total: totalApplications,
      pending: pendingApplications,
      approved: approvedApplications,
      rejected: rejectedApplications,
      byMinistry: ministryStats
    };

    res.status(200).json(stats);
  } catch (err) {
    console.error("Fetch volunteer stats error:", err);
    res.status(500).json({ message: "Failed to fetch volunteer statistics." });
  }
});

// SEARCH VOLUNTEER APPLICATIONS
router.get("/volunteer-applications/search/:query", async (req, res) => {
  try {
    const { query } = req.params;
    const db = getDB();
    
    const applications = await db.collection("volunteerapplications").find({
      $or: [
        { fullName: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
        { ministry: { $regex: query, $options: "i" } },
        { requestNumber: { $regex: query, $options: "i" } },
        { contactNumber: { $regex: query, $options: "i" } },
        { submittedByEmail: { $regex: query, $options: "i" } }
      ]
    }).sort({ createdAt: -1 }).toArray();

    res.status(200).json(applications);
  } catch (err) {
    console.error("Search volunteer applications error:", err);
    res.status(500).json({ message: "Failed to search volunteer applications." });
  }
});

module.exports = router;
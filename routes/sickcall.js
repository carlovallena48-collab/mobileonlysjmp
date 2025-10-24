const express = require("express");
const { ObjectId } = require("mongodb");
const { getDB } = require("../config/database");

const router = express.Router();

// SUBMIT SICKCALL REQUEST
router.post("/sickcall_requests", async (req, res) => {
  try {
    const db = getDB();

    if (!req.body.fullName || !req.body.email || !req.body.contactNumber || 
        !req.body.dateOfVisit || !req.body.timeOfVisit || !req.body.sickness) {
      return res.status(400).json({ 
        message: "All fields are required: full name, email, contact number, date of visit, time of visit, and sickness description." 
      });
    }

    if (!req.body.submittedByEmail) {
      return res.status(400).json({ 
        message: "User email is required. Please login first." 
      });
    }

    const sickCallData = {
      sacrament: "Sick Call",
      fullName: req.body.fullName,
      email: req.body.email,
      contactNumber: req.body.contactNumber,
      dateOfVisit: req.body.dateOfVisit,
      timeOfVisit: req.body.timeOfVisit,
      sickness: req.body.sickness,
      status: "pending",
      submittedByEmail: req.body.submittedByEmail.trim().toLowerCase(),
      createdAt: new Date(),
      requestNumber: `SICK-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      lastUpdated: new Date(),
    };

    const result = await db.collection("sickcallrequests").insertOne(sickCallData);

    res.status(201).json({ 
      message: "Sick Call request submitted successfully! A priest will visit you at the scheduled time.", 
      id: result.insertedId,
      requestNumber: sickCallData.requestNumber
    });
  } catch (err) {
    console.error("SickCall request save error:", err);
    res.status(500).json({ message: "Failed to submit Sick Call request." });
  }
});

// GET ALL SICKCALL REQUESTS (ADMIN)
router.get("/sickcall_requests", async (req, res) => {
  try {
    const db = getDB();
    const requests = await db
      .collection("sickcallrequests")
      .find()
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).json(requests);
  } catch (err) {
    console.error("Fetch SickCall requests error:", err);
    res.status(500).json({ message: "Failed to fetch SickCall requests." });
  }
});

// GET SICKCALL REQUESTS BY USER EMAIL
router.get("/sickcall_requests/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const db = getDB();

    const requests = await db
      .collection("sickcallrequests")
      .find({ submittedByEmail: email.trim().toLowerCase() })
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).json(requests);
  } catch (err) {
    console.error("Fetch user SickCall requests error:", err);
    res.status(500).json({ message: "Failed to fetch SickCall requests." });
  }
});

// UPDATE SICKCALL STATUS
router.put("/sickcall_requests/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason, cancellationReason, adminNotes, remarks, priestAssigned, visitStatus } = req.body;
    const db = getDB();

    const updateData = {
      status: status,
      lastUpdated: new Date()
    };

    if (rejectionReason !== undefined) updateData.rejectionReason = rejectionReason;
    if (cancellationReason !== undefined) updateData.cancellationReason = cancellationReason;
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes;
    if (remarks !== undefined) updateData.remarks = remarks;
    if (priestAssigned !== undefined) updateData.priestAssigned = priestAssigned;
    if (visitStatus !== undefined) updateData.visitStatus = visitStatus;

    const result = await db.collection("sickcallrequests").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "SickCall request not found." });
    }

    res.status(200).json({ 
      message: `SickCall request ${status} successfully!`,
      status: status 
    });
  } catch (err) {
    console.error("Update SickCall status error:", err);
    res.status(500).json({ message: "Failed to update SickCall status." });
  }
});

// GET SICKCALL STATISTICS
router.get("/sickcall-stats", async (req, res) => {
  try {
    const db = getDB();

    const totalRequests = await db.collection("sickcallrequests").countDocuments();
    const pendingRequests = await db.collection("sickcallrequests").countDocuments({ status: "pending" });
    const approvedRequests = await db.collection("sickcallrequests").countDocuments({ status: "approved" });
    const completedVisits = await db.collection("sickcallrequests").countDocuments({ visitStatus: "completed" });
    const urgentRequests = await db.collection("sickcallrequests").countDocuments({ emergencyLevel: "urgent" });

    const stats = {
      total: totalRequests,
      pending: pendingRequests,
      approved: approvedRequests,
      completedVisits: completedVisits,
      urgentRequests: urgentRequests
    };

    res.status(200).json(stats);
  } catch (err) {
    console.error("Fetch SickCall stats error:", err);
    res.status(500).json({ message: "Failed to fetch SickCall statistics." });
  }
});

module.exports = router;
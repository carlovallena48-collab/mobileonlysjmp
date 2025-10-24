const express = require("express");
const { ObjectId } = require("mongodb");
const { getDB } = require("../config/database");

const router = express.Router();

// SUBMIT FIRST COMMUNION REQUEST
router.post("/first_communion_requests", async (req, res) => {
  try {
    const db = getDB();
    const communionData = {
      ...req.body,
      sacrament: "First Communion",
      createdAt: new Date(),
      status: req.body.status || 'pending',
      paymentStatus: req.body.paymentStatus || 'unpaid',
      submittedByEmail: req.body.submittedByEmail?.trim().toLowerCase(),
      requestNumber: `COMMUNION-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      lastUpdated: new Date()
    };

    const result = await db.collection("firstcommunionrequests").insertOne(communionData);

    res.status(201).json({ 
      message: "First Communion request saved!", 
      id: result.insertedId,
      requestNumber: communionData.requestNumber
    });
  } catch (err) {
    console.error("First Communion request save error:", err);
    res.status(500).json({ message: "Failed to save First Communion request." });
  }
});

// GET ALL FIRST COMMUNION REQUESTS (ADMIN)
router.get("/first_communion_requests", async (req, res) => {
  try {
    const db = getDB();
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

// GET FIRST COMMUNION REQUESTS BY USER EMAIL
router.get("/first_communion_requests/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const db = getDB();

    const requests = await db
      .collection("firstcommunionrequests")
      .find({ submittedByEmail: email.trim().toLowerCase() })
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).json(requests);
  } catch (err) {
    console.error("Fetch user First Communion requests error:", err);
    res.status(500).json({ message: "Failed to fetch First Communion requests." });
  }
});

// UPDATE FIRST COMMUNION STATUS
router.put("/first_communion_requests/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason, cancellationReason, adminNotes, remarks } = req.body;
    const db = getDB();

    const updateData = {
      status: status,
      lastUpdated: new Date()
    };

    if (rejectionReason !== undefined) updateData.rejectionReason = rejectionReason;
    if (cancellationReason !== undefined) updateData.cancellationReason = cancellationReason;
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes;
    if (remarks !== undefined) updateData.remarks = remarks;

    const result = await db.collection("firstcommunionrequests").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "First Communion request not found." });
    }

    res.status(200).json({ 
      message: `First Communion request ${status} successfully!`,
      status: status 
    });
  } catch (err) {
    console.error("Update first communion status error:", err);
    res.status(500).json({ message: "Failed to update first communion status." });
  }
});

module.exports = router;
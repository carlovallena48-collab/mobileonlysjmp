const express = require("express");
const { ObjectId } = require("mongodb");
const { getDB } = require("../config/database");

const router = express.Router();

// SUBMIT BLESSING REQUEST
router.post("/blessing_requests", async (req, res) => {
  try {
    const db = getDB();

    if (!req.body.name || !req.body.address || !req.body.contactNumber || !req.body.date || !req.body.time || !req.body.blessingType) {
      return res.status(400).json({ 
        message: "Name, address, contact number, date, time, and blessing type are required." 
      });
    }

    if (!req.body.submittedByEmail) {
      return res.status(400).json({ 
        message: "User email is required. Please login first." 
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
      displayDate: req.body.displayDate || req.body.date,
      displayTime: req.body.displayTime || req.body.time,
      status: "pending",
      submittedByEmail: req.body.submittedByEmail.trim().toLowerCase(),
      createdAt: new Date(),
      requestNumber: `BLESS-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      lastUpdated: new Date()
    };

    const result = await db.collection("blessingrequests").insertOne(blessingData);

    res.status(201).json({ 
      message: "Blessing request submitted successfully!", 
      id: result.insertedId,
      requestNumber: blessingData.requestNumber
    });
  } catch (err) {
    console.error("Blessing request save error:", err);
    res.status(500).json({ message: "Failed to submit Blessing request." });
  }
});

// GET ALL BLESSING REQUESTS (ADMIN)
router.get("/blessing_requests", async (req, res) => {
  try {
    const db = getDB();
    const requests = await db
      .collection("blessingrequests")
      .find()
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).json(requests);
  } catch (err) {
    console.error("Fetch Blessing requests error:", err);
    res.status(500).json({ message: "Failed to fetch Blessing requests." });
  }
});

// GET BLESSING REQUESTS BY USER EMAIL
router.get("/blessing_requests/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const db = getDB();

    const requests = await db
      .collection("blessingrequests")
      .find({ submittedByEmail: email.trim().toLowerCase() })
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).json(requests);
  } catch (err) {
    console.error("Fetch user Blessing requests error:", err);
    res.status(500).json({ message: "Failed to fetch Blessing requests." });
  }
});

// UPDATE BLESSING STATUS
router.put("/blessing_requests/:id/status", async (req, res) => {
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

    const result = await db.collection("blessingrequests").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Blessing request not found." });
    }

    res.status(200).json({ 
      message: `Blessing request ${status} successfully!`,
      status: status 
    });
  } catch (err) {
    console.error("Update blessing status error:", err);
    res.status(500).json({ message: "Failed to update blessing status." });
  }
});

module.exports = router;
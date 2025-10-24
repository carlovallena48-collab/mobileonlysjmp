const express = require("express");
const { ObjectId } = require("mongodb");
const { getDB } = require("../config/database");

const router = express.Router();

// SUBMIT PAMISA REQUEST
router.post("/pamisa_requests", async (req, res) => {
  try {
    const db = getDB();

    if (!req.body.intention || !req.body.names || !req.body.date || !req.body.time) {
      return res.status(400).json({ 
        message: "Intention, names, date, and time are required." 
      });
    }

    if (!req.body.submittedByEmail) {
      return res.status(400).json({ 
        message: "User email is required. Please login first." 
      });
    }

    const pamisaData = {
      sacrament: "Pamisa",
      intention: req.body.intention,
      names: req.body.names,
      date: req.body.date,
      time: req.body.time,
      displayDate: req.body.displayDate || req.body.date,
      displayTime: req.body.displayTime || req.body.time,
      massSponsor: req.body.massSponsor || "",
      donation: req.body.donation || "0",
      status: "pending",
      submittedByEmail: req.body.submittedByEmail.trim().toLowerCase(),
      createdAt: new Date(),
      requestNumber: req.body.requestNumber || `MASS-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      lastUpdated: new Date()
    };

    const result = await db.collection("pamisarequests").insertOne(pamisaData);

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

// GET ALL PAMISA REQUESTS (ADMIN)
router.get("/pamisa_requests", async (req, res) => {
  try {
    const db = getDB();
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

// GET PAMISA REQUESTS BY USER EMAIL
router.get("/pamisa_requests/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const db = getDB();

    const requests = await db
      .collection("pamisarequests")
      .find({ submittedByEmail: email.trim().toLowerCase() })
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).json(requests);
  } catch (err) {
    console.error("Fetch user Pamisa requests error:", err);
    res.status(500).json({ message: "Failed to fetch Pamisa requests." });
  }
});

// UPDATE PAMISA STATUS
router.put("/pamisa_requests/:id/status", async (req, res) => {
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

    const result = await db.collection("pamisarequests").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Pamisa request not found." });
    }

    res.status(200).json({ 
      message: `Pamisa request ${status} successfully!`,
      status: status 
    });
  } catch (err) {
    console.error("Update pamisa status error:", err);
    res.status(500).json({ message: "Failed to update pamisa status." });
  }
});

module.exports = router;
const express = require("express");
const { ObjectId } = require("mongodb");
const { getDB } = require("../config/database");

const router = express.Router();

// SUBMIT KUMPIL REQUEST
router.post("/kumpil_requests", async (req, res) => {
  try {
    const db = getDB();
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
      requestNumber: `KUMPIL-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      lastUpdated: new Date()
    };

    const result = await db.collection("kumpilrequests").insertOne(kumpilData);

    res.status(201).json({ 
      message: "Kumpil request saved!", 
      id: result.insertedId,
      requestNumber: kumpilData.requestNumber
    });
  } catch (err) {
    console.error("Kumpil request save error:", err);
    res.status(500).json({ message: "Failed to save Kumpil request." });
  }
});

// GET ALL KUMPIL REQUESTS (ADMIN)
router.get("/kumpil_requests", async (req, res) => {
  try {
    const db = getDB();
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

// GET KUMPIL REQUESTS BY USER EMAIL
router.get("/kumpil_requests/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const db = getDB();

    const requests = await db
      .collection("kumpilrequests")
      .find({ submittedByEmail: email.trim().toLowerCase() })
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).json(requests);
  } catch (err) {
    console.error("Fetch user Kumpil requests error:", err);
    res.status(500).json({ message: "Failed to fetch Kumpil requests." });
  }
});

// UPDATE KUMPIL STATUS
router.put("/kumpil_requests/:id/status", async (req, res) => {
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

    const result = await db.collection("kumpilrequests").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Kumpil request not found." });
    }

    res.status(200).json({ 
      message: `Kumpil request ${status} successfully!`,
      status: status 
    });
  } catch (err) {
    console.error("Update kumpil status error:", err);
    res.status(500).json({ message: "Failed to update kumpil status." });
  }
});

module.exports = router;
const express = require("express");
const { ObjectId } = require("mongodb");
const { getDB } = require("../config/database");

const router = express.Router();

// SUBMIT FUNERAL REQUEST
router.post("/funeral_requests", async (req, res) => {
  try {
    const db = getDB();

    if (!req.body.nameOfDeceased || !req.body.birthday || !req.body.dateDied || 
        !req.body.causeOfDeath || !req.body.informant || !req.body.relationship || 
        !req.body.residence || !req.body.placeOfBurialCemetery || 
        !req.body.scheduleDate || !req.body.scheduleTime || !req.body.contactNumber) {
      return res.status(400).json({ 
        message: "Please fill in all required fields." 
      });
    }

    if (!req.body.submittedByEmail) {
      return res.status(400).json({ 
        message: "User email is required. Please login first." 
      });
    }

    const funeralData = {
      sacrament: "Funeral Service",
      nameOfDeceased: req.body.nameOfDeceased,
      birthday: req.body.birthday,
      civilStatus: req.body.civilStatus || "",
      nameOfHusbandOrWife: req.body.nameOfHusbandOrWife || "",
      informant: req.body.informant,
      relationship: req.body.relationship,
      residence: req.body.residence,
      dateDied: req.body.dateDied,
      age: req.body.age || "",
      causeOfDeath: req.body.causeOfDeath,
      receivedLastSacrament: req.body.receivedLastSacrament || "No",
      placeOfBurialCemetery: req.body.placeOfBurialCemetery,
      scheduleDate: req.body.scheduleDate,
      scheduleTime: req.body.scheduleTime,
      contactNumber: req.body.contactNumber,
      status: "pending",
      submittedByEmail: req.body.submittedByEmail.trim().toLowerCase(),
      createdAt: new Date(),
      requestNumber: `FUNERAL-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      lastUpdated: new Date()
    };

    const result = await db.collection("funeralrequests").insertOne(funeralData);

    res.status(201).json({ 
      message: "Funeral Service request submitted successfully!", 
      id: result.insertedId,
      requestNumber: funeralData.requestNumber
    });
  } catch (err) {
    console.error("Funeral Service request save error:", err);
    res.status(500).json({ message: "Failed to submit Funeral Service request." });
  }
});

// GET ALL FUNERAL REQUESTS (ADMIN)
router.get("/funeral_requests", async (req, res) => {
  try {
    const db = getDB();
    const requests = await db
      .collection("funeralrequests")
      .find()
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).json(requests);
  } catch (err) {
    console.error("Fetch Funeral Service requests error:", err);
    res.status(500).json({ message: "Failed to fetch Funeral Service requests." });
  }
});

// GET FUNERAL REQUESTS BY USER EMAIL
router.get("/funeral_requests/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const db = getDB();

    const requests = await db
      .collection("funeralrequests")
      .find({ submittedByEmail: email.trim().toLowerCase() })
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).json(requests);
  } catch (err) {
    console.error("Fetch user Funeral Service requests error:", err);
    res.status(500).json({ message: "Failed to fetch Funeral Service requests." });
  }
});

// UPDATE FUNERAL STATUS
router.put("/funeral_requests/:id/status", async (req, res) => {
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

    const result = await db.collection("funeralrequests").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Funeral request not found." });
    }

    res.status(200).json({ 
      message: `Funeral request ${status} successfully!`,
      status: status 
    });
  } catch (err) {
    console.error("Update funeral status error:", err);
    res.status(500).json({ message: "Failed to update funeral status." });
  }
});

module.exports = router;
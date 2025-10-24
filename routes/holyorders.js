const express = require("express");
const { ObjectId } = require("mongodb");
const { getDB } = require("../config/database");

const router = express.Router();

// SUBMIT HOLY ORDERS REQUEST
router.post("/holy_orders_requests", async (req, res) => {
  try {
    const db = getDB();

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
      submittedByEmail: req.body.email.trim().toLowerCase(),
      createdAt: new Date(),
      requestNumber: `HOLY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      lastUpdated: new Date(),
      references: []
    };

    const result = await db.collection("holyordersrequests").insertOne(holyOrdersData);

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

// GET ALL HOLY ORDERS REQUESTS (ADMIN)
router.get("/holy_orders_requests", async (req, res) => {
  try {
    const db = getDB();
    const requests = await db
      .collection("holyordersrequests")
      .find()
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).json(requests);
  } catch (err) {
    console.error("Fetch Holy Orders requests error:", err);
    res.status(500).json({ message: "Failed to fetch Holy Orders requests." });
  }
});

// GET HOLY ORDERS REQUESTS BY USER EMAIL
router.get("/holy_orders_requests/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const db = getDB();

    const requests = await db
      .collection("holyordersrequests")
      .find({ submittedByEmail: email.trim().toLowerCase() })
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).json(requests);
  } catch (err) {
    console.error("Fetch user Holy Orders requests error:", err);
    res.status(500).json({ message: "Failed to fetch Holy Orders requests." });
  }
});

// UPDATE HOLY ORDERS STATUS
router.put("/holy_orders_requests/:id/status", async (req, res) => {
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

    const result = await db.collection("holyordersrequests").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Holy Orders request not found." });
    }

    res.status(200).json({ 
      message: `Holy Orders request ${status} successfully!`,
      status: status 
    });
  } catch (err) {
    console.error("Update holy orders status error:", err);
    res.status(500).json({ message: "Failed to update holy orders status." });
  }
});

module.exports = router;
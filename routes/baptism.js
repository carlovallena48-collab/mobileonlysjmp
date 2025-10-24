const express = require("express");
const { ObjectId } = require("mongodb");
const { getDB } = require("../config/database");

const router = express.Router();

// SUBMIT BAPTISM REQUEST
router.post("/baptismrequests", async (req, res) => {
  try {
    const db = getDB();
    const baptismData = {
      name: req.body.name,
      birthDate: req.body.birthDate ? new Date(req.body.birthDate) : null,
      birthPlace: req.body.birthPlace,
      fatherName: req.body.fatherName,
      fatherBirthPlace: req.body.fatherBirthPlace,
      motherName: req.body.motherName,
      motherBirthPlace: req.body.motherBirthPlace,
      marriage: req.body.marriage,
      address: req.body.address,
      godfather: req.body.godfather,
      godfatherAddress: req.body.godfatherAddress,
      godmother: req.body.godmother,
      godmotherAddress: req.body.godmotherAddress,
      baptismDate: req.body.baptismDate ? new Date(req.body.baptismDate) : null,
      baptismTime: req.body.baptismTime || null,
      contact: req.body.contact,
      sacrament: "Baptism",
      status: "pending",
      submittedByEmail: req.body.submittedByEmail?.trim().toLowerCase(),
      createdAt: new Date(),
      baptismType: req.body.baptismType || "Common Baptism",
      fee: req.body.baptismType === "Solo Baptism" ? "₱1,500.00" : "₱500.00",
      requirementsStatus: {
        birthCertificate: false,
        parentsCatholic: false,
        noRecordCertificate: false,
        seminarAttended: false,
        baptismalClothes: false,
        candle: false
      },
      paymentStatus: "unpaid",
      requestNumber: `BAP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      lastUpdated: new Date()
    };

    if (!baptismData.submittedByEmail) {
      return res.status(400).json({ message: "User email is required." });
    }

    const result = await db.collection("baptismrequests").insertOne(baptismData);

    res.status(201).json({ 
      message: "Baptismal request saved!", 
      id: result.insertedId,
      requestNumber: baptismData.requestNumber,
      baptismType: baptismData.baptismType,
      fee: baptismData.fee
    });
  } catch (err) {
    console.error("Baptism request save error:", err);
    res.status(500).json({ message: "Failed to save baptismal request." });
  }
});

// GET BAPTISM REQUESTS BY USER EMAIL
router.get("/baptismrequests/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const db = getDB();

    const requests = await db
      .collection("baptismrequests")
      .find({ submittedByEmail: email.trim().toLowerCase() })
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).json(requests);
  } catch (err) {
    console.error("Fetch baptism requests error:", err);
    res.status(500).json({ message: "Failed to fetch baptismal requests." });
  }
});

// GET ALL BAPTISM REQUESTS (ADMIN)
router.get("/baptismrequests", async (req, res) => {
  try {
    const db = getDB();
    const requests = await db
      .collection("baptismrequests")
      .find()
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).json(requests);
  } catch (err) {
    console.error("Fetch baptism requests error:", err);
    res.status(500).json({ message: "Failed to fetch baptismal requests." });
  }
});

// UPDATE BAPTISM REQUEST
router.put("/baptismrequests/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const db = getDB();

    updateData.lastUpdated = new Date();

    const result = await db.collection("baptismrequests").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Baptism request not found." });
    }

    res.status(200).json({ 
      message: "Baptism request updated successfully!",
      updatedFields: Object.keys(updateData)
    });
  } catch (err) {
    console.error("Update baptism request error:", err);
    res.status(500).json({ message: "Failed to update baptism request." });
  }
});

// UPDATE BAPTISM STATUS
router.put("/baptismrequests/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;
    const db = getDB();

    const result = await db.collection("baptismrequests").updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          status: status,
          remarks: remarks,
          updatedAt: new Date(),
          lastUpdated: new Date()
        } 
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Baptism request not found." });
    }

    res.status(200).json({ 
      message: `Baptism request ${status} successfully!`,
      status: status 
    });
  } catch (err) {
    console.error("Update baptism status error:", err);
    res.status(500).json({ message: "Failed to update baptism status." });
  }
});

// GET BAPTISM BY ID
router.get("/baptismrequests/id/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDB();

    const request = await db.collection("baptismrequests").findOne({
      _id: new ObjectId(id)
    });

    if (!request) {
      return res.status(404).json({ message: "Baptism request not found." });
    }

    res.status(200).json(request);
  } catch (err) {
    console.error("Fetch baptism by ID error:", err);
    res.status(500).json({ message: "Failed to fetch baptism request." });
  }
});

// UPDATE PAYMENT STATUS
router.put("/baptismrequests/:id/payment", async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus, paymentDate, receiptNumber } = req.body;
    const db = getDB();

    const updateData = {
      paymentStatus: paymentStatus || "paid",
      lastUpdated: new Date()
    };

    if (paymentDate) updateData.paymentDate = new Date(paymentDate);
    if (receiptNumber) updateData.receiptNumber = receiptNumber;

    const result = await db.collection("baptismrequests").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Baptism request not found." });
    }

    res.status(200).json({ 
      message: `Payment status updated to ${updateData.paymentStatus}`,
      paymentStatus: updateData.paymentStatus
    });
  } catch (err) {
    console.error("Update baptism payment error:", err);
    res.status(500).json({ message: "Failed to update payment status." });
  }
});

// UPDATE REQUIREMENTS STATUS
router.put("/baptismrequests/:id/requirements", async (req, res) => {
  try {
    const { id } = req.params;
    const { requirementsStatus } = req.body;
    const db = getDB();

    const result = await db.collection("baptismrequests").updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          requirementsStatus: requirementsStatus,
          lastUpdated: new Date()
        } 
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Baptism request not found." });
    }

    res.status(200).json({ 
      message: "Requirements status updated successfully!",
      requirementsStatus: requirementsStatus
    });
  } catch (err) {
    console.error("Update baptism requirements error:", err);
    res.status(500).json({ message: "Failed to update requirements status." });
  }
});

// GET BAPTISM STATISTICS
router.get("/baptism-stats", async (req, res) => {
  try {
    const db = getDB();

    const totalRequests = await db.collection("baptismrequests").countDocuments();
    const pendingRequests = await db.collection("baptismrequests").countDocuments({ status: "pending" });
    const approvedRequests = await db.collection("baptismrequests").countDocuments({ status: "approved" });
    const soloBaptisms = await db.collection("baptismrequests").countDocuments({ baptismType: "Solo Baptism" });
    const commonBaptisms = await db.collection("baptismrequests").countDocuments({ baptismType: "Common Baptism" });

    const stats = {
      total: totalRequests,
      pending: pendingRequests,
      approved: approvedRequests,
      soloBaptisms: soloBaptisms,
      commonBaptisms: commonBaptisms,
      revenue: {
        solo: soloBaptisms * 1500,
        common: commonBaptisms * 500,
        total: (soloBaptisms * 1500) + (commonBaptisms * 500)
      }
    };

    res.status(200).json(stats);
  } catch (err) {
    console.error("Fetch baptism stats error:", err);
    res.status(500).json({ message: "Failed to fetch baptism statistics." });
  }
});

// SEARCH BAPTISM REQUESTS
router.get("/baptismrequests/search/:query", async (req, res) => {
  try {
    const { query } = req.params;
    const db = getDB();
    
    const requests = await db.collection("baptismrequests").find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { requestNumber: { $regex: query, $options: "i" } },
        { submittedByEmail: { $regex: query, $options: "i" } },
        { baptismType: { $regex: query, $options: "i" } }
      ]
    }).sort({ createdAt: -1 }).toArray();

    res.status(200).json(requests);
  } catch (err) {
    console.error("Search baptism requests error:", err);
    res.status(500).json({ message: "Failed to search baptism requests." });
  }
});

module.exports = router;
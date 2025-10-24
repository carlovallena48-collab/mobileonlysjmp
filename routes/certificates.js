const express = require("express");
const { ObjectId } = require("mongodb");
const { getDB } = require("../config/database");

const router = express.Router();

// SUBMIT CERTIFICATE REQUEST
router.post("/certificate-requests", async (req, res) => {
  try {
    const {
      certificateType,
      fullName,
      dateOfSacrament,
      purpose,
      contactNumber,
      address,
      requestedCopies = 1,
      submittedByEmail
    } = req.body;

    const db = getDB();

    if (!certificateType || !fullName || !purpose) {
      return res.status(400).json({
        success: false,
        message: 'Certificate type, full name, and purpose are required'
      });
    }

    if (!submittedByEmail) {
      return res.status(400).json({
        success: false,
        message: 'User email is required'
      });
    }

    const prefixMap = {
      'Baptismal Certificate': 'BAP',
      'Marriage Certificate': 'MAR', 
      'Confirmation Certificate': 'CON',
      'Birth Certificate': 'BIR',
      'Death Certificate': 'DTH',
      'Kumpil Certificate': 'KMP',
      'Kumpisal Certificate': 'KMS',
      'Other Certificate': 'CER'
    };
    
    const prefix = prefixMap[certificateType] || 'CER';
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const certificateNumber = `${prefix}-${new Date().getFullYear()}-${randomNum}`;

    const scheduledDate = new Date();
    scheduledDate.setDate(scheduledDate.getDate() + 5);

    const certificateData = {
      certificateType,
      fullName,
      dateOfSacrament: dateOfSacrament || null,
      purpose,
      contactNumber: contactNumber || '',
      address: address || '',
      requestedCopies: parseInt(requestedCopies) || 1,
      status: 'Pending',
      certificateNumber,
      submittedByEmail: submittedByEmail.trim().toLowerCase(),
      requestDate: new Date().toISOString().split('T')[0],
      scheduledDate: scheduledDate.toISOString().split('T')[0],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection("certificaterequests").insertOne(certificateData);

    res.status(201).json({
      success: true,
      message: 'Certificate request submitted successfully',
      data: {
        id: result.insertedId,
        ...certificateData
      }
    });
  } catch (error) {
    console.error('❌ Error submitting certificate request:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting certificate request: ' + error.message
    });
  }
});

// GET CERTIFICATE REQUESTS BY USER EMAIL
router.get("/certificate-requests/user/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const db = getDB();

    const requests = await db.collection("certificaterequests")
      .find({ submittedByEmail: email.trim().toLowerCase() })
      .sort({ createdAt: -1 })
      .toArray();

    res.json({
      success: true,
      data: requests
    });
  } catch (error) {
    console.error('❌ Error fetching user certificate requests:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching certificate requests: ' + error.message
    });
  }
});

// GET ALL CERTIFICATE REQUESTS (ADMIN)
router.get("/certificate-requests", async (req, res) => {
  try {
    const db = getDB();
    const requests = await db.collection("certificaterequests")
      .find()
      .sort({ createdAt: -1 })
      .toArray();

    res.json({
      success: true,
      data: requests
    });
  } catch (error) {
    console.error('❌ Error fetching certificate requests:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching certificate requests: ' + error.message
    });
  }
});

// UPDATE CERTIFICATE STATUS
router.put("/certificate-requests/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;
    const db = getDB();

    const updateData = {
      status: status,
      updatedAt: new Date()
    };

    if (adminNotes !== undefined) updateData.adminNotes = adminNotes;

    const result = await db.collection("certificaterequests").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Certificate request not found." });
    }

    res.status(200).json({ 
      message: `Certificate request ${status} successfully!`,
      status: status 
    });
  } catch (err) {
    console.error("Update certificate status error:", err);
    res.status(500).json({ message: "Failed to update certificate status." });
  }
});

module.exports = router;
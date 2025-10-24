const express = require("express");
const { ObjectId } = require("mongodb");
const { getDB } = require("../config/database");

const router = express.Router();

// CHECK WEDDING DATE AVAILABILITY
router.get("/check-wedding-availability", async (req, res) => {
  try {
    const { date, time } = req.query;
    const db = getDB();
    
    if (!date) {
      return res.status(400).json({ 
        success: false,
        message: "Date is required." 
      });
    }

    const existingBooking = await db.collection("marriagerequests").findOne({
      dateOfWedding: date,
      status: { $in: ["pending", "approved"] }
    });

    const isAvailable = !existingBooking;
    
    res.status(200).json({
      success: true,
      available: isAvailable,
      date: date,
      time: time,
      existingBooking: isAvailable ? null : {
        groomName: existingBooking.groomName,
        brideName: existingBooking.brideName,
        time: existingBooking.timeOfWedding
      }
    });
  } catch (err) {
    console.error("Check availability error:", err);
    res.status(500).json({ 
      success: false,
      message: "Failed to check availability." 
    });
  }
});

// GET ALL BOOKED DATES
router.get("/booked-wedding-dates", async (req, res) => {
  try {
    const db = getDB();
    const bookedDates = await db.collection("marriagerequests")
      .find({ 
        status: { $in: ["pending", "approved"] },
        dateOfWedding: { $exists: true, $ne: null }
      })
      .project({ 
        dateOfWedding: 1, 
        timeOfWedding: 1,
        groomName: 1,
        brideName: 1,
        status: 1
      })
      .toArray();

    res.status(200).json({
      success: true,
      data: bookedDates
    });
  } catch (err) {
    console.error("Fetch booked dates error:", err);
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch booked dates." 
    });
  }
});

// SUBMIT MARRIAGE REQUEST - UPDATED WITH BETTER VALIDATION
router.post("/marriage_requests", async (req, res) => {
  try {
    const db = getDB();

    console.log('📥 Received Marriage request:', req.body);

    // ✅ FIX: Better validation with specific field names
    if (!req.body.dateOfWedding || !req.body.timeOfWedding || !req.body.groomName || !req.body.brideName) {
      return res.status(400).json({ 
        success: false,
        message: "Wedding date, time, groom name, and bride name are required." 
      });
    }

    // ✅ FIX: Check if submittedByEmail exists
    if (!req.body.submittedByEmail) {
      return res.status(400).json({ 
        success: false,
        message: "User authentication required. Please login first." 
      });
    }

    // Check if date is already booked
    const existingBooking = await db.collection("marriagerequests").findOne({
      dateOfWedding: req.body.dateOfWedding,
      status: { $in: ["pending", "approved"] }
    });

    if (existingBooking) {
      return res.status(409).json({ 
        success: false,
        message: "This wedding date is already booked. Please choose another date.",
        existingBooking: {
          groomName: existingBooking.groomName,
          brideName: existingBooking.brideName,
          time: existingBooking.timeOfWedding
        }
      });
    }

    const marriageData = {
      // Marriage Arrangement
      dateOfWedding: req.body.dateOfWedding,
      timeOfWedding: req.body.timeOfWedding,
      reservationFee: req.body.reservationFee || "",
      balance: req.body.balance || "",
      
      // Groom's Information
      groomName: req.body.groomName,
      groomMiddleName: req.body.groomMiddleName || "",
      groomSurname: req.body.groomSurname,
      groomDOB: req.body.groomDOB || "",
      groomAge: req.body.groomAge || "",
      groomPOB: req.body.groomPOB || "",
      groomResidence: req.body.groomResidence,
      groomFatherName: req.body.groomFatherName || "",
      groomMotherMaidenName: req.body.groomMotherMaidenName || "",
      groomCP: req.body.groomCP || "",
      
      // Bride's Information
      brideName: req.body.brideName,
      brideMiddleName: req.body.brideMiddleName || "",
      brideSurname: req.body.brideSurname,
      brideDOB: req.body.brideDOB || "",
      brideAge: req.body.brideAge || "",
      bridePOB: req.body.bridePOB || "",
      brideResidence: req.body.brideResidence,
      brideFatherName: req.body.brideFatherName || "",
      brideMotherMaidenName: req.body.brideMotherMaidenName || "",
      brideCP: req.body.brideCP || "",
      
      // Requirements
      groomMarriageLicense: req.body.groomMarriageLicense || "",
      groomBaptismalCert: req.body.groomBaptismalCert || "",
      groomConfirmationCert: req.body.groomConfirmationCert || "",
      groomMarriageBannsPermission: req.body.groomMarriageBannsPermission || "",
      brideMarriageLicense: req.body.brideMarriageLicense || "",
      brideBaptismalCert: req.body.brideBaptismalCert || "",
      brideConfirmationCert: req.body.brideConfirmationCert || "",
      brideMarriageBannsPermission: req.body.brideMarriageBannsPermission || "",
      
      // Schedule
      interviewDate: req.body.interviewDate || "",
      interviewTime: req.body.interviewTime || "",
      seminarDate: req.body.seminarDate || "",
      seminarTime: req.body.seminarTime || "",
      
      // Sponsors
      sponsors: req.body.sponsors || Array(20).fill(''),
      
      // Signatures
      groomSignature: req.body.groomSignature || null,
      brideSignature: req.body.brideSignature || null,
      
      // Metadata
      sacrament: "Marriage",
      status: "pending",
      submittedByEmail: req.body.submittedByEmail.trim().toLowerCase(),
      dateOfApplication: req.body.dateOfApplication || new Date().toLocaleDateString(),
      createdAt: new Date(),
      requestNumber: `MARRIAGE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      lastUpdated: new Date()
    };

    const result = await db.collection("marriagerequests").insertOne(marriageData);

    console.log('✅ Marriage request saved:', marriageData.requestNumber);

    res.status(201).json({ 
      success: true,
      message: "Marriage application submitted successfully!", 
      id: result.insertedId,
      requestNumber: marriageData.requestNumber
    });
  } catch (err) {
    console.error("❌ Marriage request save error:", err);
    res.status(500).json({ 
      success: false,
      message: "Failed to submit marriage application." 
    });
  }
});

// GET MARRIAGE REQUESTS BY USER EMAIL
router.get("/marriage_requests/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const db = getDB();

    const requests = await db
      .collection("marriagerequests")
      .find({ submittedByEmail: email.trim().toLowerCase() })
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).json({
      success: true,
      data: requests
    });
  } catch (err) {
    console.error("Fetch user Marriage requests error:", err);
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch Marriage requests." 
    });
  }
});

// GET ALL MARRIAGE REQUESTS (ADMIN)
router.get("/marriage_requests", async (req, res) => {
  try {
    const db = getDB();
    const requests = await db
      .collection("marriagerequests")
      .find()
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).json({
      success: true,
      data: requests
    });
  } catch (err) {
    console.error("Fetch Marriage requests error:", err);
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch Marriage requests." 
    });
  }
});

// UPDATE MARRIAGE STATUS
router.put("/marriage_requests/:id/status", async (req, res) => {
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

    const result = await db.collection("marriagerequests").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ 
        success: false,
        message: "Marriage request not found." 
      });
    }

    res.status(200).json({ 
      success: true,
      message: `Marriage request ${status} successfully!`,
      status: status 
    });
  } catch (err) {
    console.error("Update marriage status error:", err);
    res.status(500).json({ 
      success: false,
      message: "Failed to update marriage status." 
    });
  }
});

module.exports = router;
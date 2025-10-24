const express = require("express");
const { ObjectId } = require("mongodb");
const { getDB } = require("../config/database");

const router = express.Router();

// GET NOTIFICATIONS FOR SPECIFIC USER
router.get("/notifications/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const db = getDB();

    if (!email) {
      return res.status(400).json({ 
        success: false,
        message: "User email is required." 
      });
    }

    const userEmail = email.trim().toLowerCase();

    // Fetch all sacrament requests for this user with status updates
    const sacramentCollections = [
      "baptismrequests",
      "kumpilrequests", 
      "marriagerequests",
      "pamisarequests",
      "blessingrequests",
      "holyordersrequests",
      "firstcommunionrequests",
      "funeralrequests",
      "sickcallrequests",
      "certificaterequests",
      "volunteerapplications"
    ];

    let allUserRequests = [];

    // Fetch from all sacrament collections
    for (const collection of sacramentCollections) {
      try {
        const requests = await db.collection(collection)
          .find({ 
            submittedByEmail: userEmail,
            status: { $in: ["approved", "rejected", "cancelled"] }
          })
          .project({
            sacrament: 1,
            status: 1,
            requestNumber: 1,
            submittedByEmail: 1,
            createdAt: 1,
            lastUpdated: 1,
            rejectionReason: 1,
            cancellationReason: 1,
            adminNotes: 1,
            remarks: 1,
            name: 1,
            confirmandName: 1,
            nameOfDeceased: 1,
            groomName: 1,
            brideName: 1,
            childName: 1,
            fullName: 1,
            intention: 1,
            blessingType: 1
          })
          .sort({ lastUpdated: -1 })
          .toArray();

        allUserRequests = [...allUserRequests, ...requests];
      } catch (error) {
        console.log(`Collection ${collection} not found, skipping...`);
        continue;
      }
    }

    // Convert to notification format
    const notifications = allUserRequests.map(request => {
      const getName = () => {
        return request.name || request.confirmandName || request.nameOfDeceased || 
               request.childName || request.fullName ||
               (request.groomName && request.brideName ? `${request.groomName} & ${request.brideName}` : null) ||
               'Request';
      };

      const getMessage = () => {
        const name = getName();
        const sacrament = request.sacrament || 'Request';
        
        if (request.status === 'approved') {
          return `Your ${sacrament} request for ${name} has been approved!`;
        } else if (request.status === 'rejected') {
          return `Your ${sacrament} request for ${name} has been rejected.`;
        } else if (request.status === 'cancelled') {
          return `Your ${sacrament} request for ${name} has been cancelled.`;
        }
        return `Update on your ${sacrament} request for ${name}`;
      };

      const getReason = () => {
        return request.rejectionReason || request.cancellationReason || request.adminNotes || request.remarks || null;
      };

      return {
        id: request._id.toString(),
        requestNumber: request.requestNumber,
        type: request.status,
        sacrament: request.sacrament,
        message: getMessage(),
        reason: getReason(),
        timestamp: request.lastUpdated || request.createdAt,
        read: false,
        data: request
      };
    });

    // Sort by timestamp (newest first)
    const sortedNotifications = notifications.sort((a, b) => 
      new Date(b.timestamp) - new Date(a.timestamp)
    );

    res.status(200).json({
      success: true,
      data: sortedNotifications
    });

  } catch (err) {
    console.error("Fetch notifications error:", err);
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch notifications." 
    });
  }
});

// MARK NOTIFICATION AS READ
router.put("/notifications/:id/read", async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.body;
    const db = getDB();

    // In a real app, you'd update this in a notifications collection
    // For now, we'll just return success
    res.status(200).json({
      success: true,
      message: "Notification marked as read"
    });

  } catch (err) {
    console.error("Mark notification as read error:", err);
    res.status(500).json({ 
      success: false,
      message: "Failed to mark notification as read." 
    });
  }
});

// DELETE NOTIFICATION
router.delete("/notifications/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.body;
    const db = getDB();

    // In a real app, you'd delete from a notifications collection
    // For now, we'll just return success
    res.status(200).json({
      success: true,
      message: "Notification deleted successfully"
    });

  } catch (err) {
    console.error("Delete notification error:", err);
    res.status(500).json({ 
      success: false,
      message: "Failed to delete notification." 
    });
  }
});

module.exports = router;
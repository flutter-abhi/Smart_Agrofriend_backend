const admin = require("../config/firebaseAdmin"); // Import Firebase Admin
const User = require("../schema/UserSchema"); // Import User model
const Notification = require("../schema/NotificationSchema"); // Import Notification model

const sendNotification = async (req, res) => {
    try {
        const { userId, title, body } = req.body; // Extract data from request body
        // console.log(userId);
        // console.log(title);
        // console.log(body);

        // Validate input
        if (!userId || !title || !body) {
            return res.status(400).json({ message: "User ID, title, and body are required" });
        }

        // Fetch user FCM Token from Notification schema
        const notification = await Notification.findOne({ userId });
        if (!notification || !notification.fcmToken) {
            return res.status(404).json({ message: "Notification not found or FCM token missing" });
        }

        const message = {
            token: notification.fcmToken, // Target device token
            notification: {
                title,
                body,
            },
            data: { click_action: "FLUTTER_NOTIFICATION_CLICK" }, // Custom data
        };

        // Send notification
        const msgResponse = await admin.messaging().send(message);
        console.log('msg response ', msgResponse);
        console.log(`Notification sent to user ${userId}: ${title} - ${body}`);
        return res.status(200).json({ message: "Notification sent successfully" });
    } catch (error) {
        console.error("Error sending notification:", error);
        return res.status(500).json({ error: "Error sending notification" });
    }
};

const createFCMToken = async (req, res) => {
    try {
        const { userId, fcmToken } = req.body;

        // Create a new notification entry
        const notification = new Notification({ userId, fcmToken });
        await notification.save();

        res.status(201).json({ message: "FCM Token created successfully" });
    } catch (error) {
        res.status(500).json({ error: "Error creating FCM token" });
    }
};

const updateFCMToken = async (req, res) => {
    try {
        const { userId, fcmToken } = req.body;

        // Update the existing notification entry or create a new one if not found
        await Notification.findOneAndUpdate(
            { userId },
            { fcmToken },
            { new: true, upsert: true } // Add upsert option
        );
        res.status(200).json({ message: "FCM Token updated or created" });
    } catch (error) {
        res.status(500).json({ error: "Error updating FCM token" });
    }
};



module.exports = {
    sendNotification,
    createFCMToken,
    updateFCMToken,
};

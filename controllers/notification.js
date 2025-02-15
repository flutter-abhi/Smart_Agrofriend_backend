const admin = require("../config/firebaseAdmin"); // Import Firebase Admin
const User = require("../schema/UserSchema"); // Import User model
const Notification = require("../schema/NotificationSchema"); // Import Notification model

const sendNotification = async (userId, title, body) => {
    try {
        // Validate input
        if (!userId || !title || !body) {
            throw new Error("User ID, title, and body are required");
        }

        // Fetch user FCM Token
        const user = await User.findById(userId);
        if (!user || !user.fcmToken) {
            throw new Error("User not found or FCM token missing");
        }

        const message = {
            token: user.fcmToken, // Target device token
            notification: {
                title,
                body,
            },
            data: { click_action: "FLUTTER_NOTIFICATION_CLICK" }, // Custom data
        };

        // Send notification
        await admin.messaging().send(message);
        console.log(`Notification sent to user ${userId}: ${title} - ${body}`);
        return { message: "Notification sent successfully" };
    } catch (error) {
        console.error("Error sending notification:", error);
        throw new Error("Error sending notification");
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

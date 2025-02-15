const mongoose = require('mongoose');
const User = require('./UserSchema'); // Import the User model

const notificationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' }, // Reference to the User model
    fcmToken: { type: String, required: true } // Firebase Cloud Messaging token
}, {
    timestamps: true // Automatically manage createdAt and updatedAt fields
});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;

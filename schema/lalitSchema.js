const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    mobNumber: { type: String, required: true, unique: true },
    state: { type: String, required: true },
    district: { type: String, required: true },
    taluka: { type: String, required: true },
    village: { type: String, required: true },
    pin: { type: String, required: true },
    createdJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],
    appliedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],
    otp: { type: String }, // OTP for verification (stored as a string)
    otpExpiresAt: { type: Date }, // Expiration time for OTP (5 minutes)
}, { timestamps: true });

const USER = mongoose.model('USER', userSchema);

module.exports = USER;
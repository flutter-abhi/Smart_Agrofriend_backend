const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  googleId: { type: String, unique: true }, // For Google login
  role: { type: String, enum: ['laborer', 'farmer', 'renter', 'admin'], required: true },
  password: { type: String }, // Optional, for non-OAuth login
  fullName: { type: String },
  phoneNumber: { type: String },
  bio: { type: String }, // A short user bio
  profileUrl: { type: String, default: '' }, // URL for the user's profile picture
  location: {
    village: { type: String, required: true }, // Village name
    district: { type: String, required: true }, // District name
    taluka: { type: String, required: true } // Taluka name
  },
  tags: { type: [String] }, // Array of tags
  status: { type: String, default: 'active' },
  createdAt: { type: Date, default: Date.now }

});

const User = mongoose.model('User', userSchema);

module.exports = User;

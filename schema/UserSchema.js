const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({

  role: { type: String, enum: ['labour', 'farmer', 'admin'], required: true },
  password: { type: String }, // Optional, for non-OAuth login
  fullName: { type: String },
  phoneNumber: { type: String, unique: true },
  bio: { type: String }, // A short user bio
  profileUrl: { type: String, default: '' }, // URL for the user's profile picture
  location: {
    village: { type: String, required: true }, // Village name
    district: { type: String, required: true }, // District name
    taluka: { type: String, required: true },
    state: { type: String, required: true },
    lat: { type: Number }, // Latitude
    lon: { type: Number }  // Longitude
  },
  tags: { type: [String] }, // Array of tags
  status: { type: String, default: 'active' },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

module.exports = User;

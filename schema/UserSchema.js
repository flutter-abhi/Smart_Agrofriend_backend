const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  googleId: { type: String, unique: true }, // For Google login
  role: { type: String, enum: ['laborer', 'farmer', 'renter', 'admin'], required: true },
  password: { type: String }, // Optional, for non-OAuth login
  fullName: { type: String },
  phoneNumber: { type: String },
  location: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

module.exports = User;

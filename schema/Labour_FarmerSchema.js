const mongoose = require('mongoose');
const User = require('./UserSchema');
const laborFarmerProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bio: { type: String },
  tags: { type: [String] },
  contactNumber: { type: String },
  location: { type: String },
  role: { type: String, enum: ['laborer', 'farmer'], required: true },
  status: { type: String, default: 'active' }, // To indicate if the profile is active
  createdAt: { type: Date, default: Date.now }
});

const LaborFarmerProfile = mongoose.model('LaborFarmerProfile', laborFarmerProfileSchema);

module.exports = LaborFarmerProfile;

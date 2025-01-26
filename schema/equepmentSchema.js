const mongoose = require('mongoose');

const equipmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Owner of the equipment
  title: { type: String, required: true },
  description: { type: String, required: true },
  tags: { type: [String] },
  type: { type: String, enum: ['rent', 'buy'], required: true },
  price: { type: Number, required: true },
  location: {
    village: { type: String, required: true }, // Village name
    district: { type: String, required: true }, // District name
    taluka: { type: String, required: true },
    state: { type: String, required: true }
  },
  available: { type: Boolean, default: true },
  imageUrls: { type: [String] },
  rentedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // User renting the equipment
  rentStartDate: { type: Date, default: null }, // Start date of rental
  rentEndDate: { type: Date, default: null },   // End date of rental
  createdAt: { type: Date, default: Date.now }
});

const Equipment = mongoose.model('Equipment', equipmentSchema);

module.exports = Equipment;

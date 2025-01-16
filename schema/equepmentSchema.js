const mongoose = require('mongoose');
const User = require('./UserSchema');

const equipmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  tags: { type: [String] },
  type: { type: String, enum: ['rent', 'buy'], required: true },
  price: { type: Number, required: true },
  location: { type: String },
  available: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const Equipment = mongoose.model('Equipment', equipmentSchema);

module.exports = Equipment;

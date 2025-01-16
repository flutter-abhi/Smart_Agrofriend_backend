const mongoose = require('mongoose');
const User = require('./UserSchema');

const animalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  species: { type: String, required: true },
  breed: { type: String, required: true },
  price: { type: Number, required: true },
  location: { type: String },
  status: { type: String, enum: ['for-sale', 'sold'], default: 'for-sale' },
  createdAt: { type: Date, default: Date.now }
});

const Animal = mongoose.model('Animal', animalSchema);

module.exports = Animal;

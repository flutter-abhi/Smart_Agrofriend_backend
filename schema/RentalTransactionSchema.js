const mongoose = require('mongoose');
const Equipment = require('./equepmentSchema');
const User = require('./UserSchema');

const rentalTransactionSchema = new mongoose.Schema({
  equipmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Equipment', required: true },
  renterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rentalDate: { type: Date, required: true },
  returnDate: { type: Date, required: true },
  totalPrice: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'completed', 'cancelled'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

const RentalTransaction = mongoose.model('RentalTransaction', rentalTransactionSchema);

module.exports = RentalTransaction;

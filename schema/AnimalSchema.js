const mongoose = require('mongoose');

const animalSchema = new mongoose.Schema({
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to the seller
  name: { type: String, required: true }, // Animal name/type (e.g., cow, goat)
  age: { type: Number, required: true }, // Age of the animal
  breed: { type: String }, // Breed information
  price: { type: Number, required: true }, // Selling price
  description: { type: String }, // Description of the animal
  tags: { type: [String] }, // Tags for filtering (e.g., healthy, vaccinated)
  images: { type: [String], required: true }, // Array of image URLs (stored in Cloudinary or any similar service)
  location: {
    village: { type: String, required: true },
    district: { type: String, required: true },
    taluka: { type: String, required: true },
    state: { type: String, default: 'Maharashtra' },
    lat: { type: Number }, // Latitude
    lon: { type: Number }  // Longitude
  },
  status: { type: String, enum: ['available', 'sold', 'archived'], default: 'available' }, // Animal status
  postDate: { type: Date, default: Date.now }, // When the post was created
  archiveDate: { type: Date }, // Auto-archive date
});

const Animal = mongoose.model('Animal', animalSchema);

module.exports = Animal;

const mongoose = require('mongoose');
const User = require('./UserSchema');

const jobPostSchema = new mongoose.Schema({
  farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  labours_req:{type:Number},
  description: { type: String, required: true },
  pay: { type: Number, required: true },
  location: {
    village: { type: String, required: true }, // Village name
    district: { type: String, required: true }, // District name
    taluka: { type: String, required: true },
    state: { type: String,default:"maharastra" }
  },
  skillsRequired: { type: [String] }, // Array of skills needed
  status: { type: String, enum: ['open', 'closed'], default: 'open' }, // Default status is 'open'
  createdAt: { type: Date, default: Date.now }
});

const JobPost = mongoose.model('JobPost', jobPostSchema);

module.exports = JobPost;

const mongoose = require('mongoose');

const jobApplicationSchema = new mongoose.Schema({
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'JobPost', required: true },
  applicantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  coverLetter: { type: String },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

// Add cascading delete functionality
jobApplicationSchema.pre('remove', async function (next) {
  await this.model('JobApplication').deleteMany({ jobId: this.jobId });
  await this.model('JobApplication').deleteMany({ applicantId: this.applicantId });
  next();
});

module.exports = mongoose.model('JobApplication', jobApplicationSchema);

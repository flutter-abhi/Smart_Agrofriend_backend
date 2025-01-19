const JobApplication = require('../schema/jobApplication'); // Assuming you have a JobApplication model
const JobPost = require('../schema/Job_PostSchema');

// Apply for a Job
const applyForJob = async (req, res) => {
    try {

        const { jobId, applicantId, coverLetter } = req.body; // Applicant ID and cover letter from request body

        // Check if the job post exists and is open
        const jobPost = await JobPost.findById(jobId);
        if (!jobPost || jobPost.status !== 'open') {
            return res.status(404).json({ message: 'Job post not found or not open for applications' });
        }

        // Create a new job application
        const application = new JobApplication({
            jobId,
            applicantId,
            coverLetter,
            status: 'pending', // Initial status of the application
        });

        await application.save();
        res.status(201).json({ message: 'Job application submitted successfully', application });
    } catch (error) {
        res.status(500).json({ error: 'Error applying for job' });
    }
};

// Get Job Applications
const getApplications = async (req, res) => {
    try {
        const { jobId, applicantId } = req.query; // Query parameters for filtering applications

        // Build the filter dynamically
        const filter = {};
        if (jobId) filter.jobId = jobId;
        if (applicantId) filter.applicantId = applicantId;

        const applications = await JobApplication.find(filter).populate('jobId').populate('applicantId');
        res.json(applications);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching job applications' });
    }
};

// Delete a Job Application
const deleteApplication = async (req, res) => {
    try {
        const { applicationId } = req.params;
        const { userId } = req.user; // Assuming user is authenticated and user ID is available in req.user

        // Find the application
        const application = await JobApplication.findById(applicationId);
        if (!application) {
            return res.status(404).json({ message: 'Job application not found' });
        }

        // Check if the user is the applicant or the job owner
        if (application.applicantId.toString() !== userId && application.jobId.farmerId.toString() !== userId) {
            return res.status(403).json({ message: 'You do not have permission to delete this application' });
        }

        await JobApplication.findByIdAndDelete(applicationId);
        res.json({ message: 'Job application deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting job application' });
    }
};

//
const approveApplication = async (req, res) => {
    try {
        const { applicationId } = req.params; // Get application ID from URL params
        const { userId } = req.user; // Assuming user is authenticated and user ID is available in req.user

        // Find the application
        const application = await JobApplication.findById(applicationId).populate('jobId');
        if (!application) {
            return res.status(404).json({ message: 'Job application not found' });
        }

        // Check if the user is the job owner
        if (application.jobId.farmerId.toString() !== userId) {
            return res.status(403).json({ message: 'You do not have permission to approve this application' });
        }

        // Approve the selected application
        application.status = 'approved';
        await application.save();

        // Reject other applications for the same job
        await JobApplication.updateMany(
            { jobId: application.jobId._id, _id: { $ne: applicationId } },
            { status: 'rejected' }
        );

        res.json({ message: 'Job application approved and others rejected', application });
    } catch (error) {
        res.status(500).json({ error: 'Error approving job application' });
    }
};

module.exports = {
    applyForJob,
    getApplications,
    deleteApplication,
    approveApplication
};

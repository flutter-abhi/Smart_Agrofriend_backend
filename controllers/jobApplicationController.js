const JobApplication = require('../schema/jobApplication'); // Assuming you have a JobApplication model
const JobPost = require('../schema/Job_PostSchema');

// Apply for a Job
// const applyForJob = async (req, res) => {
//     try {

//         const { jobId, applicantId, coverLetter } = req.body; // Applicant ID and cover letter from request body

//         // Check if the job post exists and is open
//         const jobPost = await JobPost.findById(jobId);
//         if (!jobPost || jobPost.status !== 'open') {
//             return res.status(404).json({ message: 'Job post not found or not open for applications' });
//         }

//         // Create a new job application
//         const application = new JobApplication({
//             jobId,
//             applicantId,
//             coverLetter,
//             status: 'pending', // Initial status of the application
//         });

//         await application.save();
//         res.status(201).json({ message: 'Job application submitted successfully', application });
//     } catch (error) {
//         res.status(500).json({ error: 'Error applying for job' });
//     }
// };
const applyForJob = async (req, res) => {
    try {
        const { jobId, applicantId, coverLetter } = req.body; // Applicant ID and cover letter from request body

        // Check if the user has already applied for this job
        const existingApplication = await JobApplication.findOne({ jobId, applicantId });
        if (existingApplication) {
            return res.status(400).json({ message: 'You have already applied for this job' });
        }

        // Check if the job post exists and is open
        const jobPost = await JobPost.findById(jobId);
        if (!jobPost || jobPost.status !== 'open') {
            return res.status(404).json({ message: 'Job post not found or not open for applications' });
        }

        // Ensure the job post's deadline has not passed
        if (jobPost.deadline && new Date() > new Date(jobPost.deadline)) {
            jobPost.status = 'closed'; // Close the job post
            await jobPost.save(); // Save the updated job post
            return res.status(400).json({ message: 'Job application deadline has passed' });
        }

        // Check if the number of applicants has reached the required limit
        if (jobPost.labours_app >= jobPost.labours_req) {
            jobPost.status = 'closed'; // Close the job post
            await jobPost.save(); // Save the updated job post
            return res.status(400).json({ message: 'Job application limit reached for this position' });
        }

        // Increment the labours_app count
        jobPost.labours_app += 1;
        await jobPost.save();

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
        res.status(500).json({
            message: 'Error applying for job',
            error: error
        });
    }
};


// Get Job Applications
const getApplications = async (req, res) => {
    try {
        const { jobId, applicantId, status } = req.query;
        // Query parameters for filtering applications
        if (!jobId) {
            return res.status(400).json({ message: 'jobId is required in query' });
        }

        // Build the filter dynamically
        const filter = {};
        if (jobId) filter.jobId = jobId;
        if (applicantId) filter.applicantId = applicantId;
        if (status) filter.status = status; // Add status filtering

        // // Add filter for farmerId based on jobId
        // const jobPost = await JobPost.findById(jobId); // Find job post by jobId
        // // if (jobPost) {
        // //     filter.farmerId = jobPost.farmerId; // Add farmerId to filter
        // // }

        const applications = await JobApplication.find(filter)
            .populate('jobId')
            .populate('applicantId');
        res.json(applications);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching job applications' });
    }
};



//
const updateApplicationStatus = async (req, res) => {
    try {
        const { applicationId } = req.body; // Get application ID from URL params
        const { status } = req.body; // Get the new status from request body
        const { userId } = req.user.userId; // Get user ID from authenticated request

        console.log(applicationId, status, userId);
        // Validate status
        const validStatuses = ['pending', 'accepted', 'rejected'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status provided' });
        }

        // Find the application
        const application = await JobApplication.findById(applicationId).populate('jobId');
        if (!application) {
            return res.status(404).json({ message: 'Job application not found' });
        }

        // // Check if the user is the job owner
        // if (application.jobId.farmerId.toString() !== userId) {
        //     return res.status(403).json({ message: 'You do not have permission to update this application' });
        // }

        // Update application status
        application.status = status;
        await application.save();

        res.json({ message: `Job application status updated to ${status}`, application });
    } catch (error) {
        res.status(500).json({ error: 'Error updating job application status' });
    }
};


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


module.exports = {
    applyForJob,
    getApplications,
    deleteApplication,
    updateApplicationStatus
};

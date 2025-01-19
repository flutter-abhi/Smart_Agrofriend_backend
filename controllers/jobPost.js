const JobPost = require('../schema/Job_PostSchema');


// Create a new job post
const createJobPost = async (req, res) => {
    const { title, description, pay, location, skillsRequired } = req.body;

    const farmerId = req.user.userId ?? req.user.id; // Assuming the user ID is available in req.user.id after authentication
    console.log(req.user);
    console.log()
    try {
        const newJobPost = new JobPost({
            farmerId,
            title,
            description,
            pay,
            location,
            skillsRequired,
        });

        const savedJobPost = await newJobPost.save();
        res.status(201).json({
            message: 'Job post created successfully',
            jobPost: savedJobPost,
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error creating job post',
            error: error.message,
        });
    }
};

// Get all job posts or filter by criteria
const getJobPosts = async (req, res) => {
    try {
        const { status, location, farmerId } = req.query; // Extracting query parameters

        // Building the filter object dynamically
        const filter = {};
        if (status) {
            filter.status = status; // Add status filter if provided
        }
        if (location) {
            filter.location = location; // Add location filter if provided
        }
        if (farmerId) {
            filter.farmerId = farmerId; // Add farmerId filter if provided
        }

        const jobPosts = await JobPost.find(filter);
        res.json(jobPosts);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching job posts' });
    }
};

// Update an existing job post
const updateJobPost = async (req, res) => {

    const { id, title, description, pay, location, skillsRequired, status } = req.body;

    try {
        const updatedJobPost = await JobPost.findByIdAndUpdate(
            id,
            { title, description, pay, location, skillsRequired, status },
            { new: true, runValidators: true }
        );

        if (!updatedJobPost) {
            return res.status(404).json({ message: 'Job post not found' });
        }

        res.status(200).json({
            message: 'Job post updated successfully',
            jobPost: updatedJobPost,
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error updating job post',
            error: error.message,
        });
    }
};

// Delete a job post
const deleteJobPost = async (req, res) => {
    try {
        const { id } = req.body; // Job post ID from the URL
        const userId = req.user.userId; // Logged-in user's ID from the JWT token
        console.log(id);
        console.log(userId);

        // Find the job post by ID
        const jobPost = await JobPost.findById(id);

        if (!jobPost) {
            return res.status(404).json({ message: 'Job post not found' });
        }

        // Check if the logged-in user is the owner of the job post
        if (jobPost.farmerId.toString() !== userId) {
            return res.status(403).json({ message: 'You are not authorized to delete this job post' });
        }

        // If authorized, delete the job post
        await JobPost.findByIdAndDelete(id);
        res.status(200).json({ message: 'Job post deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting job post', error });
    }
};

module.exports = {
    createJobPost,
    getJobPosts,
    updateJobPost,
    deleteJobPost,
};


// // Retrieve All Job Posts:

// Request: GET /api/job-posts
// filter: {} (empty object)
// Result: All job posts are retrieved.
// Retrieve Job Posts by Farmer ID:

// Request: GET /api/job-posts?farmerId=123
// filter: { farmerId: '123' }
// Result: Only job posts where farmerId is 123 are retrieved.
// Retrieve Job Posts by Status:

// Request: GET /api/job-posts?status=open
// filter: { status: 'open' }
// Result: Only job posts with status set to open are retrieved.
// Retrieve Job Posts by Farmer ID and Status:

// Request: GET /api/job-posts?farmerId=123&status=open
// filter: { farmerId: '123', status: 'open' }
// Result: Only job posts with farmerId 123 and status open are retrieved.
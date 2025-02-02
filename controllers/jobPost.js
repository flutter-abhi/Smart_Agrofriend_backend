const JobPost = require('../schema/Job_PostSchema');


// Create a new job post
const createJobPost = async (req, res) => {

    const {
        title,
        description,
        pay,
        village,
        district,
        taluka,
        state,
        skillsRequired,
        labours_req,
        startDate,
        endDate,
        deadline,
        workType
    } = req.body;

    const farmerId = req.user.userId ?? req.user.id; // Assuming user ID is attached after authentication

    try {
        // Validate required fields
        if (!title || !description || !pay || !village || !district || !taluka || !startDate || !endDate) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Check if the end date is after the start date
        if (new Date(endDate) <= new Date(startDate)) {
            return res.status(400).json({ message: 'End date must be after start date' });
        }

        // Check if the deadline (if provided) is before the start date
        if (deadline && new Date(deadline) >= new Date(startDate)) {
            return res.status(400).json({ message: 'Deadline must be before the start date' });
        }

        // Create a new job post
        const newJobPost = new JobPost({
            farmerId,
            title,
            description,
            pay,
            labours_req,
            labours_app: 0, // Default value for labours applied
            workType,
            location: {
                village,
                district,
                taluka,
                state: state || 'maharastra', // Default state is Maharashtra
            },
            skillsRequired,
            status: 'open', // Default status is 'open'
            startDate,
            endDate,
            deadline,
        });

        // Save the job post to the database
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
        const { status, village, district, taluka, state, farmerId } = req.query; // Extracting query parameters

        // Building the filter object dynamically
        const filter = {};
        if (status) {
            filter.status = status; // Add status filter if provided
        }

        // Add location filters if provided
        const locationFilters = [];
        if (village) {
            locationFilters.push({ 'location.village': village }); // Add village filter if provided
        }
        if (district) {
            locationFilters.push({ 'location.district': district }); // Add district filter if provided
        }
        if (taluka) {
            locationFilters.push({ 'location.taluka': taluka }); // Add taluka filter if provided
        }
        if (state) {
            locationFilters.push({ 'location.state': state }); // Add state filter if provided
        }

        if (locationFilters.length > 0) {
            filter.$or = locationFilters; // Use $or to match any of the location fields
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
    const { id } = req.params; // Use params for ID
    const userId = req.user.userId || req.user.id; // Extract logged-in user's ID
    const updateFields = req.body; // Extract fields to update from the request body

    try {
        // Validate job post ID
        if (!id) {
            return res.status(400).json({ message: 'Job post ID is required' });
        }

        // Find the job post by ID
        const jobPost = await JobPost.findById(id);
        if (!jobPost) {
            return res.status(404).json({ message: 'Job post not found' });
        }

        // Check if the logged-in user is authorized
        if (jobPost.farmerId.toString() !== userId) {
            return res.status(403).json({ message: 'You are not authorized to update this job post' });
        }

        // Dynamically update only provided fields
        Object.keys(updateFields).forEach((key) => {
            if (updateFields[key] !== undefined) {
                jobPost[key] = updateFields[key];
            }
        });

        // Save the updated job post
        const updatedJobPost = await jobPost.save();

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
        consol.log("delete job post");
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



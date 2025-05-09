const JobPost = require('../schema/Job_PostSchema');
const User = require('../schema/UserSchema'); // Add User model import


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
        console.log({
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
        }); // Log all fields before validation

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
        const { status, village, district, taluka, state, farmerId } = req.query;

        // Building the filter object dynamically
        const filter = {};
        if (status) {
            filter.status = status;
        }

        // Add location filters if provided
        const locationFilters = [];
        if (village) {
            locationFilters.push({ 'location.village': village });
        }
        if (district) {
            locationFilters.push({ 'location.district': district });
        }
        if (taluka) {
            locationFilters.push({ 'location.taluka': taluka });
        }
        if (state) {
            locationFilters.push({ 'location.state': state });
        }

        if (locationFilters.length > 0) {
            filter.$or = locationFilters;
        }

        if (farmerId) {
            filter.farmerId = farmerId;
        }

        const jobPosts = await JobPost.find(filter).lean();

        // Function to calculate distance between two points (lat/lon)
        const calculateDistance = (lat1, lon1, lat2, lon2) => {
            const R = 6371; // Radius of the Earth in km
            const dLat = (lat2 - lat1) * (Math.PI / 180);
            const dLon = (lon2 - lon1) * (Math.PI / 180);
            const a =
                Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            return R * c; // Distance in km
        };

        try {
            const userId = req.user?.userId;
            if (!userId) {
                console.log('No user ID found in request');
                return res.status(200).json(jobPosts);
            }

            const user = await User.findById(userId);
            if (!user) {
                console.log('User not found:', userId);
                return res.status(200).json(jobPosts);
            }

            const userLocation = user.location;
            if (!userLocation || !userLocation.lat || !userLocation.lon) {
                console.log('User location not found or incomplete:', userLocation);
                return res.status(200).json(jobPosts);
            }

            // Calculate distance for each job post
            const jobPostsWithDistance = jobPosts.map(post => {
                try {
                    if (!post.location || !post.location.lat || !post.location.lon) {
                        console.log('Job post missing location data:', post._id);
                        return { ...post, distance: null };
                    }

                    const distance = calculateDistance(
                        userLocation.lat,
                        userLocation.lon,
                        post.location.lat,
                        post.location.lon
                    );
                    return { ...post, distance };
                } catch (error) {
                    console.error('Error calculating distance for post:', post._id, error);
                    return { ...post, distance: null };
                }
            });

            // Filter out posts with null distance and sort the rest
            const validPosts = jobPostsWithDistance.filter(post => post.distance !== null);
            const invalidPosts = jobPostsWithDistance.filter(post => post.distance === null);

            // Sort valid posts by distance
            validPosts.sort((a, b) => a.distance - b.distance);

            // Combine sorted valid posts with invalid posts
            const finalPosts = [...validPosts, ...invalidPosts];

            res.status(200).json(finalPosts);
        } catch (locationError) {
            console.error('Error processing location data:', locationError);
            // If there's an error with location processing, return unsorted posts
            res.status(200).json(jobPosts);
        }
    } catch (error) {
        console.error('Error in getJobPosts:', error);
        res.status(500).json({
            error: 'Error fetching job posts',
            details: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
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
        const { id } = req.query; // Job post ID from the URL
        const userId = req.user.userId; // Logged-in user's ID from the JWT token
        console.log("delete job post");
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
        res.status(500).json({ message: 'Error deleting job post', error: error.message });
    }
};

module.exports = {
    createJobPost,
    getJobPosts,
    updateJobPost,
    deleteJobPost,
};



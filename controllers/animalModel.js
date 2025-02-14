const { v2: cloudinary } = require('cloudinary');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const Animal = require('../schema/AnimalSchema'); // Import the Animal model
const { getLatLon } = require('./getlocation');
const User = require('../schema/UserSchema'); // Import the User model

const fileFilter = (req, file, cb) => {
    // Allowed mime types for images
    const allowedTypes = /jpeg|jpg|png|gif|heic/;

    // Check if the file type is valid
    const isValid = allowedTypes.test(file.mimetype);

    if (isValid) {
        return cb(null, true);  // Accept the file
    } else {
        return cb(new Error('Invalid file type. Only JPG, PNG, GIF are allowed.'), false); // Reject the file
    }
};


const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'Animal',  // Specify the folder in Cloudinary
        format: (req, file) => {
            // Automatically set the file format based on file type
            const fileExtension = file.mimetype.split('/')[1];  // jpeg, png, gif, etc.
            return fileExtension;  // Return the file extension as the format
        },
        public_id: (req, file) => {
            // Sanitize the filename by replacing special characters and ensuring uniqueness
            let sanitizedFileName = file.originalname.split('.')[0].replace(/[^\w\s]/gi, '_') + '-' + Date.now();
            return sanitizedFileName; // Return the sanitized public id
        }
    }
});
const uploadanimal = multer({ storage: storage, fileFilter: fileFilter });

const createAnimalPost = async (req, res) => {
    console.log("in create animal post:", req.user);
    console.log("Files received:", req.files);

    try {
        // Validate required fields
        const { name, age, breed, price, description, tags, village, district, taluka, state } = req.body;
        const missingFields = [];
        if (!name) missingFields.push('Name');
        if (!age) missingFields.push('Age');
        if (!breed) missingFields.push('Breed');
        if (!price) missingFields.push('Price');
        if (!description) missingFields.push('Description');
        if (!village) missingFields.push('Village');
        if (!district) missingFields.push('District');
        if (!taluka) missingFields.push('Taluka');

        if (missingFields.length > 0) {
            console.log("Validation failed: Missing required fields:", missingFields);
            return res.status(400).json({ message: `${missingFields.join(', ')} ${missingFields.length > 1 ? 'are' : 'is'} required.` });
        }

        // Handle images if uploaded
        let imageUrls = [];
        if (req.files && req.files.length > 0) {
            imageUrls = req.files.map(file => file.path);
            console.log("Uploaded image URLs:", imageUrls);
        } else {
            console.log("No files uploaded.");
            return res.status(400).json({ message: 'At least one image must be uploaded.' });
        }

        const sellerId = req.user.userId; // Logged-in user's ID
        const { latitude, longitude } = await getLatLon(village, taluka, district, state) || {};

        const archiveDate = new Date(); // Set the archive date to now or calculate a future date
        archiveDate.setDate(archiveDate.getDate() + 10); // Example: set to 30 days from now

        const newAnimalPost = new Animal({
            sellerId,
            name,
            age,
            breed,
            price,
            description,
            tags,
            images: imageUrls, // Use the uploaded image URLs
            location: {
                village,
                district,
                taluka,
                state,
                lat: latitude, // Add latitude
                lon: longitude, // Add longitude


            },
            archiveDate,
        });

        const savedAnimalPost = await newAnimalPost.save();

        res.status(201).json({
            message: 'Animal post created successfully',
            animalPost: savedAnimalPost,
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error creating animal post',
            error: error.message,
        });
    }
};

const getAnimalPosts = async (req, res) => {
    try {
        const { status, village, district, taluka, state, tags, sellerId } = req.query;

        const filter = {};
        if (status) filter.status = status;
        if (sellerId) filter.sellerId = sellerId;

        // // Location filtering
        // if (village) filter['location.village'] = village;
        // if (district) filter['location.district'] = district;
        // if (taluka) filter['location.taluka'] = taluka;
        // if (state) filter['location.state'] = state;

        // Tag filtering
        if (tags) filter.tags = { $in: tags.split(',') }; // Supports multiple tags

        const animalPosts = await Animal.find(filter).lean();

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

        const userId = req.user.userId; // Get the logged-in user's ID
        const user = await User.findById(userId); // Find the user by ID
        const userLocation = user.location;

        if (userLocation && userLocation.lat && userLocation.lon) {
            // Calculate distance for each animal post
            const animalPostsWithDistance = animalPosts.map(post => {
                const distance = calculateDistance(userLocation.lat, userLocation.lon, post.location.lat, post.location.lon);
                return { ...post, distance };
            });

            // Sort by distance (closest first)
            animalPostsWithDistance.sort((a, b) => a.distance - b.distance);

            res.status(200).json(animalPostsWithDistance);
        } else {
            // If user location is not provided, return the posts without sorting
            res.status(200).json(animalPosts);
        }
    } catch (error) {
        res.status(500).json({
            message: 'Error fetching animal posts',
            error: error.message,
        });
    }
};

const updateAnimalPost = async (req, res) => {
    const { id } = req.body; // Animal post ID
    const updates = req.body; // Dynamic updates

    try {
        const animalPost = await Animal.findById(id);

        if (!animalPost) {
            return res.status(404).json({ message: 'Animal post not found' });
        }

        // Check if the logged-in user is the owner
        const userId = req.user.userId;
        if (animalPost.sellerId.toString() !== userId) {
            return res.status(403).json({ message: 'You are not authorized to update this post' });
        }

        // Update fields only if provided
        const updatedAnimalPost = await Animal.findByIdAndUpdate(id, updates, {
            new: true,
            runValidators: true,
        });

        res.status(200).json({
            message: 'Animal post updated successfully',
            animalPost: updatedAnimalPost,
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error updating animal post',
            error: error.message,
        });
    }
};


const deleteAnimalPost = async (req, res) => {
    const { id } = req.body;

    try {
        const animalPost = await Animal.findById(id);

        if (!animalPost) {
            return res.status(404).json({ message: 'Animal post not found' });
        }

        // Check if the logged-in user is the owner
        const userId = req.user.userId;
        if (animalPost.sellerId.toString() !== userId) {
            return res.status(403).json({ message: 'You are not authorized to delete this post' });
        }

        await Animal.findByIdAndDelete(id);

        res.status(200).json({ message: 'Animal post deleted successfully' });
    } catch (error) {
        res.status(500).json({
            message: 'Error deleting animal post',
            error: error.message,
        });
    }
};

const autoArchiveExpiredPosts = async () => {
    try {
        const now = new Date();
        const expiredPosts = await Animal.updateMany(
            { archiveDate: { $lt: now }, status: 'available' },
            { status: 'archived' }
        );

        console.log(`${expiredPosts.nModified} posts archived successfully`);
    } catch (error) {
        console.error('Error archiving expired posts:', error.message);
    }
};

// Schedule the function using a job scheduler (e.g., node-cron)

// Export the functions
module.exports = {
    createAnimalPost,
    getAnimalPosts,
    updateAnimalPost,
    deleteAnimalPost,
    autoArchiveExpiredPosts,
    uploadanimal
};        
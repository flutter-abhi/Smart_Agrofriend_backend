const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const User = require('../schema/UserSchema');
const multer = require('multer');
const axios = require('axios');


const getProfile = async (req, res) => {
    try {
        console.log(req.user);
        const user = await User.findById(req.user.userId);
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};



const deleteProfile = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.user.id);
        res.json({ message: 'Profile deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

// **Update User Controller**
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
        folder: 'user_profile',  // Specify the folder in Cloudinary
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
const uploadprof = multer({ storage: storage, fileFilter: fileFilter });

const updateUserController = async (req, res) => {
    const userId = req.user.userId; // User ID from authentication middleware
    let updates = req.body; // User-provided updates

    try {
        // Check if req.body is parsed as an object
        if (typeof updates !== 'object' || updates === null || Array.isArray(updates)) {
            return res.status(400).json({ message: 'Invalid updates format. Must be an object.' });
        }

        // Find the user by ID
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Handle profile image upload
        if (req.file) {
            try {
                // Get the Cloudinary URL
                const imageUrl = req.file.path;
                updates.profileUrl = imageUrl; // Add image URL to updates
                console.log(imageUrl);
            } catch (error) {
                return res.status(500).json({ message: 'Error uploading profile image', error: error.message });
            }
        }

        // Update user fields
        Object.keys(updates).forEach((key) => {
            user[key] = updates[key]; // Update fields dynamically
        });

        // Save the updated user
        const updatedUser = await user.save();

        res.status(200).json({
            message: 'User updated successfully',
            user: updatedUser,
        });
    } catch (error) {
        res.status(500).json({ message: 'Error updating user', error: error.message });
    }
};

//haversineDistance



const getAllUsers = async (req, res) => {
    try {
        console.log(req.user);

        const userId = req.user.userId;
        // Get user ID from request
        if (!userId) {
            return res.status(400).json({ message: "User ID is required." });
        }

        // Find the requesting user's location
        const requestUser = await User.findById(userId);
        if (!requestUser) {
            return res.status(404).json({ message: "User not found." });
        }

        // Fetch all users
        const users = await User.find({ _id: { $ne: userId } }).lean();

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

        // Calculate distance for each user
        const usersWithMetrics = users.map(user => {
            // Check if both users have latitude and longitude
            if (requestUser.location.lat && requestUser.location.lon && user.location.lat && user.location.lon) {
                const distance = calculateDistance(requestUser.location.lat, requestUser.location.lon, user.location.lat, user.location.lon);
                return { ...user, distance };
            } else {
                // If lat/lon is missing, set distance to null or a large number
                return { ...user, distance: null }; // or use Infinity for sorting
            }
        });

        // Sort by distance (closest first), placing users without distance at the end
        usersWithMetrics.sort((a, b) => {
            if (a.distance === null) return 1; // Move users without distance to the end
            if (b.distance === null) return -1; // Move users without distance to the end
            return a.distance - b.distance; // Sort by distance
        });

        res.json(usersWithMetrics);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};




module.exports = { getProfile, updateUserController, deleteProfile, uploadprof, getAllUsers };

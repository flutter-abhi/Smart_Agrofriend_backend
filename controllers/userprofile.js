const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const User = require('../schema/UserSchema');
const multer = require('multer');


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


module.exports = { getProfile, updateUserController, deleteProfile, uploadprof };

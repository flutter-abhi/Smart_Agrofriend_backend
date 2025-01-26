const { v2: cloudinary } = require('cloudinary');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const Animal = require('../schema/AnimalSchema'); // Import the Animal model

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
const uploadanimal = multer({ storage: storage, fileFilter: fileFilter });

const createAnimalPost = async (req, res) => {
    const {
        name,
        age,
        breed,
        price,
        description,
        tags,
        images,
        village,
        district,
        taluka,
        state,
        archiveDate,
    } = req.body;

    const sellerId = req.user.userId; // Logged-in user's ID

    try {
        const newAnimalPost = new Animal({
            sellerId,
            name,
            age,
            breed,
            price,
            description,
            tags,
            images,
            location: {
                village,
                district,
                taluka,
                state,
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

        // Location filtering
        if (village) filter['location.village'] = village;
        if (district) filter['location.district'] = district;
        if (taluka) filter['location.taluka'] = taluka;
        if (state) filter['location.state'] = state;

        // Tag filtering
        if (tags) filter.tags = { $in: tags.split(',') }; // Supports multiple tags

        const animalPosts = await Animal.find(filter);

        res.status(200).json(animalPosts);
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
const cloudinary = require('../config/cloudinnery');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const Equipment = require('../schema/equepmentSchema');



const fileFilter = (req, file, cb) => {
    // Allowed mime types for images
    // const allowedTypes = /jpeg|jpg|png|gif|heic/;

    // // Check if the file type is valid
    // const isValid = allowedTypes.test(file.mimetype);

    // if (isValid) {
    //     return cb(null, true);  // Accept the file
    // } else {
    //     return cb(new Error('Invalid file type. Only JPG, PNG, GIF are allowed.'), false); // Reject the file
    // }
    return cb(null, true);
};
exports.fileFilter = fileFilter;


const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'equipment_uploads',  // Specify the folder in Cloudinary
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
exports.storage = storage;


const upload = multer({ storage: storage, fileFilter: fileFilter });

// Controller to handle equipment creation
const addEquipment = async (req, res) => {
    console.log("in add equepment:", req.user);
    console.log("Files received:", req.files);

    try {
        // Validate required fields
        const { title, description, type, price, tags, village, district, taluka, state } = req.body;
        console.log("Received data:", req.body); // Log received data

        const missingFields = [];
        if (!title) missingFields.push('Title');
        if (!description) missingFields.push('Description');
        if (!type) missingFields.push('Type');
        if (!price) missingFields.push('Price');
        if (!village) missingFields.push('Village');
        if (!district) missingFields.push('District');
        if (!taluka) missingFields.push('Taluka');

        if (missingFields.length > 0) {
            console.log("Validation failed: Missing required fields:", missingFields); // Log validation failure
            return res.status(400).json({ message: `${missingFields.join(', ')} ${missingFields.length > 1 ? 'are' : 'is'} required.` });
        }

        // Parse tags if provided as a string
        const parsedTags = Array.isArray(tags) ? tags : tags?.split(',') || [];
        console.log("Parsed tags:", parsedTags); // Log parsed tags

        let imageUrls = [];

        // Check if files are uploaded
        if (req.files && req.files.length > 0) {
            try {
                // Collect Cloudinary URLs
                imageUrls = req.files.map(file => file.path);
                console.log("Uploaded image URLs:", imageUrls); // Log uploaded image URLs
            } catch (error) {
                console.error("Error uploading images to Cloudinary:", error); // Log error
                return res.status(500).json({ message: 'Error uploading images to Cloudinary', error });
            }
        } else {
            console.log("No files uploaded."); // Log if no files are uploaded
            return res.status(400).json({ message: 'At least one image must be uploaded.' });
        }

        console.log("User ID:", req.user.userId); // Log user ID
        // Create a new equipment object
        const equipment = new Equipment({
            userId: req.user.userId,
            title,
            description,
            tags: parsedTags,
            type,
            price,
            location: {
                village,
                district,
                taluka,
                state: state || 'maharastra', // Default state is Maharashtra
            },
            imageUrls
        });

        // Save to the database
        await equipment.save();
        console.log("Equipment added successfully:", equipment); // Log success
        res.status(201).json({ message: 'Equipment added successfully', equipment });
    } catch (error) {
        console.error("Failed to add equipment:", error.message); // Log error
        res.status(500).json({ message: 'Failed to add equipment', error: error.message });
    }
};


const getEquipmentByUser = async (req, res) => {
    try {
        const { userId, available, type, location } = req.query;

        // Build the query object dynamically
        const query = {};

        if (userId) {
            query.userId = mongoose.Types.ObjectId(userId); // Ensure userId is an ObjectId
        }
        if (available !== undefined) {
            query.available = available === 'true'; // Convert available to a boolean
        }
        if (type) {
            query.type = type; // Filter by type (e.g., 'rent' or 'buy')
        }
        if (location) {
            query.location = location; // Filter by location
        }

        console.log('Query Object:', query); // Debugging: Log the query object

        // Fetch equipment from the database based on the query and populate userId
        const equipment = await Equipment.find(query).populate('userId');

        // Return the results
        res.status(200).json({
            success: true,
            data: equipment,
        });
    } catch (error) {
        console.error('Error fetching equipment:', error.message); // Log the error
        res.status(500).json({
            success: false,
            message: 'Error fetching equipment',
            error: error.message,
        });
    }
};



const rentEquipment = async (req, res) => {
    try {

        const { equipmentId, userId, rentStartDate, rentEndDate } = req.body; // User renting and rental period

        // Validate inputs
        if (!userId || !rentStartDate || !rentEndDate) {
            return res.status(400).json({ success: false, message: 'All fields are required.' });
        }

        // Find the equipment
        const equipment = await Equipment.findById(equipmentId);

        if (!equipment) {
            return res.status(404).json({ success: false, message: 'Equipment not found.' });
        }

        // Check if the equipment is available
        if (!equipment.available) {
            return res.status(400).json({ success: false, message: 'Equipment is not available for rent.' });
        }

        // Update the equipment rental details
        equipment.rentedBy = userId;
        equipment.rentStartDate = new Date(rentStartDate);
        equipment.rentEndDate = new Date(rentEndDate);
        equipment.available = false; // Mark as unavailable

        await equipment.save();

        // Respond with success
        res.status(200).json({
            success: true,
            message: 'Equipment rented successfully.',
            data: equipment
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error renting equipment.', error: error.message });
    }
};

const unrentEquipment = async (req, res) => {
    try {
        const { equipmentId } = req.body;

        // Find the equipment
        const equipment = await Equipment.findById(equipmentId);

        if (!equipment) {
            return res.status(404).json({ success: false, message: 'Equipment not found.' });
        }

        // Update the equipment to mark it as available
        equipment.rentedBy = null;
        equipment.rentStartDate = null;
        equipment.rentEndDate = null;
        equipment.available = true;

        await equipment.save();

        res.status(200).json({ success: true, message: 'Equipment is now available for rent.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error updating equipment.', error: error.message });
    }
};

const deleteEquipment = async (req, res) => {
    console.log("in delete equepment", req.user);
    try {

        const { equipmentId } = req.body;

        // Check if equipmentId is provided
        if (!equipmentId) {
            return res.status(400).json({ message: 'Equipment ID is required.' });
        }

        // Find the equipment by ID
        const equipment = await Equipment.findById(equipmentId);

        // Check if the equipment exists
        if (!equipment) {
            return res.status(404).json({ message: 'Equipment not found.' });
        }

        // Verify that the equipment belongs to the logged-in user
        if (equipment.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Unauthorized to delete this equipment.' });
        }

        // Delete the equipment
        await Equipment.findByIdAndDelete(equipmentId);

        res.status(200).json({ message: 'Equipment deleted successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete equipment', error: error.message });
    }
};

//optional if i want 
const searchEquipment = async (req, res) => {
    try {
        const { tags, type, location } = req.query;

        const query = {};
        if (tags) query.tags = { $in: tags.split(',') }; // Find equipment with matching tags
        if (type) query.type = type; // Match type ('rent' or 'buy')
        if (location) query.location = location; // Match location

        const equipment = await Equipment.find(query);

        res.status(200).json({ message: 'Search results retrieved successfully.', equipment });
    } catch (error) {
        res.status(500).json({ message: 'Failed to search equipment', error: error.message });
    }
};

const toggleEquipmentAvailability = async (req, res) => {
    try {
        const { equipmentId, available } = req.body; // Get equipment ID and availability status

        // Find the equipment
        const equipment = await Equipment.findById(equipmentId);

        if (!equipment) {
            return res.status(404).json({ success: false, message: 'Equipment not found.' });
        }

        // Update the equipment availability
        if (available) {
            equipment.rentedBy = null;
            equipment.rentStartDate = null;
            equipment.rentEndDate = null;
            equipment.available = true; // Mark as available
        } else {
            equipment.available = false; // Mark as unavailable
        }

        await equipment.save();

        res.status(200).json({
            success: true,
            message: `Equipment is now ${available ? 'available' : 'unavailable'}.`,
            data: equipment
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error updating equipment availability.', error: error.message });
    }
};

module.exports = {
    upload,
    addEquipment,
    getEquipmentByUser,
    rentEquipment,
    unrentEquipment,
    deleteEquipment,
    toggleEquipmentAvailability
};

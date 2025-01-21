const cloudinary = require('../config/cloudinnery');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const Equipment = require('../schema/equepmentSchema');



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

// Configure Cloudinary storage for Multer
// const storage = new CloudinaryStorage({
//     cloudinary: cloudinary,
//     params: {
//         folder: 'equipment_uploads', // Specify the folder in Cloudinary
//         format: async (req, file) => 'png', // Optional: file format
//         public_id: (req, file) => file.originalname.split('.')[0] + '-' + Date.now() // Unique filename
//     }
// });
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


const upload = multer({ storage: storage, fileFilter: fileFilter });

// Controller to handle equipment creation
const addEquipment = async (req, res) => {
    try {
        let imageUrls = [];
        
        if (req.files && req.files.length > 0) { // Check if files are uploaded
            for (const file of req.files) {
                imageUrls.push(file.path); // Cloudinary provides the URL in the 'path' attribute
            }
        } else {
            return res.status(400).json({ message: 'At least one image must be uploaded.' }); // Respond with an error if no images
        }

        const equipment = new Equipment({
            userId: req.user.id,
            title: req.body.title,
            description: req.body.description,
            tags: req.body.tags,
            type: req.body.type,
            price: req.body.price,
            location: req.body.location,
            imageUrls: imageUrls
        });

        await equipment.save();
        res.status(201).json({ message: 'Equipment added successfully', equipment });
    } catch (error) {
        res.status(500).json({ message: 'Failed to add equipment', error });
    }
};

module.exports = {
    upload,
    addEquipment
};

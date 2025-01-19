//  const cloudinary = require('../config/cloudinary');
// const multer = require('multer');
// const { CloudinaryStorage } = require('multer-storage-cloudinary');
// const Equipment = require('../schema/equepmentSchema');

// // Multer configuration
// const storage = new CloudinaryStorage({
//     cloudinary: cloudinary,
//     params: {
//         folder: 'equipment', // Folder name in Cloudinary
//         allowedFormats: ['jpg', 'jpeg', 'png']
//     }
// });

// const upload = multer({ storage });

// // Controller to handle equipment creation
// const addEquipment = async (req, res) => {
//     try {
//         let imageUrls = [];
//         if (req.files) {
//             for (const file of req.files) {
//                 imageUrls.push(file.path); // Cloudinary returns the URL in the 'path' attribute
//             }
//         } else {
//             imageUrls.push('https://via.placeholder.com/150'); // Default image URL
//         }

//         const equipment = new Equipment({
//             userId: req.body.userId,
//             title: req.body.title,
//             description: req.body.description,
//             tags: req.body.tags,
//             type: req.body.type,
//             price: req.body.price,
//             location: req.body.location,
//             imageUrls: imageUrls
//         });

//         await equipment.save();
//         res.status(201).json({ message: 'Equipment added successfully', equipment });
//     } catch (error) {
//         res.status(500).json({ message: 'Failed to add equipment', error });
//     }
// };

// module.exports = {
//     upload,
//     addEquipment
// };

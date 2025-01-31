const express = require('express');
const router = express.Router();
const { signupController, loginController } = require('../controllers/createUser');
const { getProfile, updateUserController, deleteProfile, uploadprof } = require('../controllers/userprofile');
const authenticateJWT = require('../middelware/authenticateJWT');
const { createJobPost, getJobPosts, updateJobPost, deleteJobPost } = require('../controllers/jobPost');
const { applyForJob, getApplications, deleteApplication, updateApplicationStatus} = require("../controllers/jobApplicationController")
const { upload, addEquipment, getEquipmentByUser, rentEquipment, unrentEquipment, deleteEquipment } = require("../controllers/addEqupment");
const { createAnimalPost, getAnimalPosts, updateAnimalPost, deleteAnimalPost, autoArchiveExpiredPosts, uploadanimal } = require("../controllers/animalModel")
///user authenticated

router.post('/signup', signupController);
router.post('/login', loginController);

///user profile
router.get('/profile', authenticateJWT, getProfile);
router.put('/profile', authenticateJWT, uploadprof.single('profileImage'), updateUserController);
router.delete('/profile', authenticateJWT, deleteProfile);

///job post
router.post('/job-posts/create', authenticateJWT, createJobPost);
router.get('/job-posts/get', getJobPosts);
router.put('/job-posts/update', authenticateJWT, updateJobPost);
router.delete('/job-posts/delete', authenticateJWT, deleteJobPost);

//job application route

router.post('/applyForJob', applyForJob);
router.get('/getApplications', authenticateJWT, getApplications);
router.delete('/deleteApplication', authenticateJWT, deleteApplication);
router.put('/updateApplicationStatus', authenticateJWT, updateApplicationStatus);


///
//equpment 

//
router.post('/equipment/addEquipment', authenticateJWT, upload.array('images', 3), addEquipment)
router.get('/equipment/getEquipment', getEquipmentByUser);
router.post('/equipment/rentEquipment', rentEquipment);
router.put('/equipment/unrentEquipment', unrentEquipment);
router.delete('/equipment/deleteEquepment', authenticateJWT, deleteEquipment)
module.exports = router;

///animalmodel




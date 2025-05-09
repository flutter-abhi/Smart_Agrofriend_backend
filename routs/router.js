const express = require('express');
const router = express.Router();
const { signupController, loginController } = require('../controllers/createUser');
const { getProfile, updateUserController, deleteProfile, uploadprof, getAllUsers } = require('../controllers/userprofile');
const authenticateJWT = require('../middelware/authenticateJWT');
const { createJobPost, getJobPosts, updateJobPost, deleteJobPost } = require('../controllers/jobPost');
const { applyForJob, getApplications, deleteApplication, updateApplicationStatus } = require("../controllers/jobApplicationController")
const { upload, addEquipment, getEquipmentByUser, rentEquipment, unrentEquipment, deleteEquipment, toggleEquipmentAvailability } = require("../controllers/addEqupment");
const animalControllers = require('../controllers/animalModel');
const { createFCMToken, updateFCMToken } = require('../controllers/notification');
const { sendNotification } = require('../controllers/notification');
///user authenticated
const { signupcontroller } = require('../controllers/lalitcontroller');

router.post('/signup', signupController);
router.post('/login', loginController);

///user profile
router.get('/profile', authenticateJWT, getProfile);
router.put('/profile', authenticateJWT, uploadprof.single('profileImage'), updateUserController);
router.delete('/profile', authenticateJWT, deleteProfile);
router.get('/getAllUser', authenticateJWT, getAllUsers);

///job post
router.post('/job-posts/create', authenticateJWT, createJobPost);
router.get('/job-posts/get', authenticateJWT, getJobPosts);
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
router.put('/equipment/avalibility', authenticateJWT, toggleEquipmentAvailability)

// Animal routes
router.post('/animal/create', authenticateJWT, animalControllers.uploadanimal.array('images', 3), animalControllers.createAnimalPost);
router.get('/animal/get', authenticateJWT, animalControllers.getAnimalPosts);
router.put('/animal/update', authenticateJWT, animalControllers.updateAnimalPost);
router.delete('/animal/delete', authenticateJWT, animalControllers.deleteAnimalPost);



/// FCM Token routes
router.post('/fcm/create', createFCMToken);
router.put('/fcm/update', updateFCMToken);
router.post('/fcm/send', sendNotification);

router.post('/lsignup', signupcontroller);

module.exports = router;
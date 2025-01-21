const express = require('express');
const router = express.Router();
const { signupController, loginController } = require('../controllers/createUser');
const { getProfile, updateProfile, deleteProfile } = require('../controllers/userprofile');
const authenticateJWT = require('../middelware/authenticateJWT');
const { createJobPost, getJobPosts, updateJobPost, deleteJobPost } = require('../controllers/jobPost');
const { applyForJob, getApplications, deleteApplication, approveApplication } = require("../controllers/jobApplicationController")
const { upload, addEquipment } = require("../controllers/addEqupment");

///user authenticated

router.post('/signup', signupController);
router.post('/login', loginController);

///user profile
router.get('/profile', authenticateJWT, getProfile);
router.put('/profile', authenticateJWT, updateProfile);
router.delete('/profile', authenticateJWT, deleteProfile);

///job post
router.post('/job-posts/create', authenticateJWT, createJobPost);
router.get('/job-posts/get', authenticateJWT, getJobPosts);
router.put('/job-posts/update', authenticateJWT, updateJobPost);
router.delete('/job-posts/delete', authenticateJWT, deleteJobPost);

//job application route

router.post('/applyForJob', applyForJob);
router.get('/getApplications', getApplications);
router.delete('/deleteApplication', deleteApplication);
router.delete('/approveApplication', approveApplication);


///
//equpment 

//
router.post('/addEquipment', authenticateJWT, upload.array('images', 3), addEquipment)

module.exports = router;

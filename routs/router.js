const express = require('express');
const router = express.Router();
const { signupController, loginController } = require('../controllers/createUser');
const { getProfile, updateProfile, deleteProfile } = require('../controllers/userprofile');
const authenticateJWT = require('../middelware/authenticateJWT');
const { createJobPost, getJobPosts, updateJobPost, deleteJobPost } = require('../controllers/jobPost');

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

module.exports = router;

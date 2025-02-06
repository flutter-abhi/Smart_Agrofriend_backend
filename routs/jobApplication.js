const express = require('express');
const router = express.Router();
const { applyForJob, getApplications, deleteApplication, updateApplicationStatus } = require("../controllers/jobApplicationController");
const authenticateJWT = require('../middelware/authenticateJWT');

router.post('/applyForJob', applyForJob);
router.get('/getApplications', authenticateJWT, getApplications);
router.delete('/deleteApplication', authenticateJWT, deleteApplication);
router.put('/updateApplicationStatus', authenticateJWT, updateApplicationStatus);

module.exports = router; 
const express = require('express');
const router = express.Router();
const { getProfile, updateUserController, deleteProfile, uploadprof } = require('../controllers/userprofile');
const authenticateJWT = require('../middelware/authenticateJWT');

router.get('/profile', authenticateJWT, getProfile);
router.put('/profile', authenticateJWT, uploadprof.single('profileImage'), updateUserController);
router.delete('/profile', authenticateJWT, deleteProfile);

module.exports = router; 
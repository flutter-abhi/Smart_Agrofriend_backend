const express = require('express');
const router = express.Router();
const animalControllers = require('../controllers/animalModel');
const authenticateJWT = require('../middelware/authenticateJWT');

router.post('/create', authenticateJWT, animalControllers.uploadanimal.array('images', 3), animalControllers.createAnimalPost);
router.get('/get', animalControllers.getAnimalPosts);
router.put('/update', authenticateJWT, animalControllers.updateAnimalPost);
router.delete('/delete', authenticateJWT, animalControllers.deleteAnimalPost);

module.exports = router; 
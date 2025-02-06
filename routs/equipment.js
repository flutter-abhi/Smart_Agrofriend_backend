const express = require('express');
const router = express.Router();
const { upload, addEquipment, getEquipmentByUser, rentEquipment, unrentEquipment, deleteEquipment, toggleEquipmentAvailability } = require("../controllers/addEqupment");
const authenticateJWT = require('../middelware/authenticateJWT');

router.post('/addEquipment', authenticateJWT, upload.array('images', 3), addEquipment);
router.get('/getEquipment', getEquipmentByUser);
router.post('/rentEquipment', rentEquipment);
router.put('/unrentEquipment', unrentEquipment);
router.delete('/deleteEquepment', authenticateJWT, deleteEquipment);
router.put('/avalibility', authenticateJWT, toggleEquipmentAvailability);

module.exports = router; 
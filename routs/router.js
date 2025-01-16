const express = require('express');
const router = express.Router();
const { signupController } = require('../controllers/createUser');

router.post('/signup', signupController);

module.exports = router;

const express = require('express');
const router = express.Router();
const userController = require('../controllers/UserC');
const authMiddleware = require('../middlewares/AuthM');

router.get('/profile', authMiddleware, userController.getUser);

router.post('/register', userController.registerUser);

router.post('/login', userController.loginUser);

router.post('/logout', authMiddleware, userController.logoutUser);

module.exports = router;
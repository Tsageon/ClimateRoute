const express = require('express');
const router = express.Router();
const userController = require('../controllers/UserC');
const authMiddleware = require('../middlewares/AuthM');

router.get('/profile', authMiddleware, userController.getUser);

router.get('/search', userController.search);

router.get('/forecast', userController.forecast);

router.post('/reset-password/:token', userController.resetPassword);

router.post('/register', userController.registerUser);

router.post('/login', userController.loginUser);

router.post('/logout', authMiddleware, userController.logoutUser);

router.put('/edit', authMiddleware, userController.updateUser);

module.exports = router;
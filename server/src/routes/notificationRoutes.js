const express = require('express');
const notificationController = require('../controllers/notificationController');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authenticateToken);

router.get('/', notificationController.listNotifications);
router.post('/read', notificationController.markRead);

module.exports = router;

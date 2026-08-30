const express = require('express');
const executionController = require('../controllers/executionController');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authenticateToken);

router.get('/', executionController.listExecutions);
router.get('/:id', executionController.getExecutionById);
router.get('/:id/timeline', executionController.getExecutionTimeline);
router.post('/:id/pause', executionController.pauseExecution);
router.post('/:id/resume', executionController.resumeExecution);
router.post('/:id/cancel', executionController.cancelExecution);

module.exports = router;

const express = require('express');
const workflowController = require('../controllers/workflowController');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authenticateToken);

router.get('/dashboard', workflowController.getDashboard);
router.get('/', workflowController.listWorkflows);
router.post('/', workflowController.createWorkflow);
router.post('/generate', workflowController.generateFromPrompt);
router.get('/:id', workflowController.getWorkflowById);
router.put('/:id', workflowController.updateWorkflow);
router.post('/:id/duplicate', workflowController.duplicateWorkflow);
router.post('/:id/execute', workflowController.executeWorkflow);
router.delete('/:id', workflowController.deleteWorkflow);

module.exports = router;

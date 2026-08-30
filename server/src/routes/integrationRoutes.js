const express = require('express');
const integrationController = require('../controllers/integrationController');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/oauth/error', integrationController.handleOAuthError);
router.get('/oauth/:provider/callback', integrationController.handleOAuthCallback);

router.use(authenticateToken);

router.get('/', integrationController.listIntegrations);
router.get('/status', integrationController.getStatus);
router.get('/oauth/:provider/start', integrationController.startOAuth);
router.post('/', integrationController.manualConnect);

module.exports = router;

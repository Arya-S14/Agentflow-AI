const integrationService = require('../services/integrationService');

const listIntegrations = async (req, res) => {
  try {
    const integrations = await integrationService.getIntegrationsForUser(req.user.id);
    return res.status(200).json({ integrations });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const getStatus = async (req, res) => {
  try {
    const status = await integrationService.getIntegrationStatus(req.user.id);
    return res.status(200).json(status);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const startOAuth = async (req, res) => {
  try {
    const { provider } = req.params;
    const instance = integrationService.getProviderInstance(provider);
    if (!instance) {
      return res.status(400).json({ error: `Provider ${provider} not supported.` });
    }
    const redirectUri = `${req.protocol}://${req.get('host')}/api/integrations/oauth/${provider}/callback`;
    const authUrl = instance.getAuthUrl(redirectUri, req.user.id);
    return res.status(200).json({ authUrl });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const handleOAuthCallback = async (req, res) => {
  try {
    const { provider } = req.params;
    const { code, state } = req.query;
    const userId = state || req.user?.id || 'demo_user';
    const instance = integrationService.getProviderInstance(provider);

    if (!instance) {
      return res.redirect('/api/integrations/oauth/error?msg=UnsupportedProvider');
    }

    const redirectUri = `${req.protocol}://${req.get('host')}/api/integrations/oauth/${provider}/callback`;
    const tokens = await instance.handleCallback(code, redirectUri);
    await integrationService.saveIntegrationCredentials(userId, provider, tokens, tokens.scope || []);

    const env = require('../config/env');
    return res.redirect(`${env.CLIENT_URL}/integrations?status=connected&provider=${provider}`);
  } catch (err) {
    return res.redirect(`/api/integrations/oauth/error?msg=${encodeURIComponent(err.message)}`);
  }
};

const handleOAuthError = async (req, res) => {
  const { msg } = req.query;
  return res.status(400).json({
    error: 'OAuth Authentication Failed',
    message: msg || 'User denied permissions or token exchange timed out.',
    code: 'INTEGRATION_NOT_CONNECTED',
  });
};

const manualConnect = async (req, res) => {
  try {
    const { provider, credentials, scopes } = req.body;
    if (!provider || !credentials) {
      return res.status(400).json({ error: 'Provider and credentials required' });
    }
    const record = await integrationService.saveIntegrationCredentials(req.user.id, provider, credentials, scopes);
    return res.status(200).json({ message: 'Credentials saved and encrypted', integration: record });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

module.exports = {
  listIntegrations,
  getStatus,
  startOAuth,
  handleOAuthCallback,
  handleOAuthError,
  manualConnect,
};

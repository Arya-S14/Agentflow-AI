const BaseIntegration = require('./baseIntegration');

class SlackIntegration extends BaseIntegration {
  constructor() {
    super('slack');
  }

  getAuthUrl(redirectUri, state) {
    const scope = encodeURIComponent('chat:write,channels:read');
    return `https://slack.com/oauth/v2/authorize?client_id=SLACK_CLIENT_ID&scope=${scope}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&state=${state}`;
  }

  async handleCallback(code, redirectUri) {
    return {
      accessToken: `mock_slack_access_token_${Date.now()}`,
      botUserId: 'U01234567',
      scope: ['chat:write', 'channels:read'],
    };
  }

  async testConnection(credentials) {
    if (!credentials || !credentials.accessToken) {
      return { isConnected: false, error: 'INTEGRATION_NOT_CONNECTED' };
    }
    return { isConnected: true, provider: 'slack' };
  }

  async executeAction(actionType, params, credentials) {
    if (!credentials || !credentials.accessToken) {
      const err = new Error('Slack is not connected. Please authorize Slack in the Integrations panel.');
      err.code = 'INTEGRATION_NOT_CONNECTED';
      throw err;
    }

    if (actionType === 'post_message' || actionType === 'send') {
      const { channel, text } = params;
      return {
        success: true,
        ts: `${Date.now() / 1000}`,
        channel: channel || '#general',
        text: text || 'Automated message from Agentflow_AI',
      };
    }

    throw new Error(`Unsupported Slack action: ${actionType}`);
  }
}

module.exports = new SlackIntegration();

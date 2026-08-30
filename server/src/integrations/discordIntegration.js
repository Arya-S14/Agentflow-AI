const BaseIntegration = require('./baseIntegration');

class DiscordIntegration extends BaseIntegration {
  constructor() {
    super('discord');
  }

  getAuthUrl(redirectUri, state) {
    return `https://discord.com/api/oauth2/authorize?client_id=DISCORD_CLIENT_ID&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&response_type=code&scope=bot&state=${state}`;
  }

  async handleCallback(code, redirectUri) {
    return {
      accessToken: `mock_discord_bot_token_${Date.now()}`,
      guildId: '1234567890',
    };
  }

  async testConnection(credentials) {
    if (!credentials || !credentials.accessToken) {
      return { isConnected: false, error: 'INTEGRATION_NOT_CONNECTED' };
    }
    return { isConnected: true, provider: 'discord' };
  }

  async executeAction(actionType, params, credentials) {
    if (!credentials || !credentials.accessToken) {
      const err = new Error('Discord Bot is not connected. Please authorize Discord in Integrations.');
      err.code = 'INTEGRATION_NOT_CONNECTED';
      throw err;
    }

    if (actionType === 'post_message' || actionType === 'send') {
      const { channelId, content } = params;
      return {
        success: true,
        id: `discord_msg_${Date.now()}`,
        channelId: channelId || 'general-announcements',
        content: content || 'Agentflow_AI automation bot trigger update.',
      };
    }

    throw new Error(`Unsupported Discord action: ${actionType}`);
  }
}

module.exports = new DiscordIntegration();

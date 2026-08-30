const axios = require('axios');
const BaseIntegration = require('./baseIntegration');
const env = require('../config/env');

class DiscordIntegration extends BaseIntegration {
  constructor() {
    super('discord');
  }

  getAuthUrl(redirectUri, state) {
    const clientId = env.DISCORD_CLIENT_ID || 'CONFIG_REQUIRED';
    const scopes = encodeURIComponent('bot messages.read identify');

    return `https://discord.com/api/oauth2/authorize?client_id=${encodeURIComponent(
      clientId
    )}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&response_type=code&scope=${scopes}&state=${encodeURIComponent(state)}`;
  }

  async handleCallback(code, redirectUri) {
    const clientId = env.DISCORD_CLIENT_ID;
    const clientSecret = env.DISCORD_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error('Discord Client ID & Secret are not configured in environment variables.');
    }

    const tokenRes = await axios.post(
      'https://discord.com/api/v10/oauth2/token',
      new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }).toString(),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    const { access_token, refresh_token, expires_in, guild } = tokenRes.data;

    let botName = guild?.name ? `Guild: ${guild.name}` : 'Discord Bot';
    try {
      const meRes = await axios.get('https://discord.com/api/v10/users/@me', {
        headers: { Authorization: `Bearer ${access_token}` },
      });
      if (meRes.data?.username) {
        botName = `${meRes.data.username}#${meRes.data.discriminator || '0'}`;
      }
    } catch (e) {
      // Continue if user fetch fails
    }

    return {
      accessToken: access_token,
      refreshToken: refresh_token,
      expiresIn: expires_in,
      expiresAt: Date.now() + (expires_in * 1000),
      guildId: guild?.id || 'discord_guild',
      connectedAccount: botName,
    };
  }

  async testConnection(credentials) {
    if (!credentials || (!credentials.accessToken && !credentials.botToken && !env.DISCORD_BOT_TOKEN)) {
      return { isConnected: false, error: 'INTEGRATION_NOT_CONNECTED' };
    }

    const authHeader = this._getAuthHeader(credentials);

    try {
      const meRes = await axios.get('https://discord.com/api/v10/users/@me', {
        headers: { Authorization: authHeader },
      });

      return {
        isConnected: true,
        provider: 'discord',
        account: `${meRes.data.username}#${meRes.data.discriminator || '0'}`,
      };
    } catch (err) {
      return { isConnected: false, error: err.response?.data?.message || err.message };
    }
  }

  _getAuthHeader(credentials) {
    if (credentials?.botToken) {
      return credentials.botToken.startsWith('Bot ') ? credentials.botToken : `Bot ${credentials.botToken}`;
    }
    if (env.DISCORD_BOT_TOKEN) {
      return env.DISCORD_BOT_TOKEN.startsWith('Bot ') ? env.DISCORD_BOT_TOKEN : `Bot ${env.DISCORD_BOT_TOKEN}`;
    }
    if (credentials?.accessToken) {
      return credentials.accessToken.startsWith('Bot ') ? credentials.accessToken : `Bearer ${credentials.accessToken}`;
    }
    throw new Error('No valid Discord Bot Token or Access Token provided.');
  }

  async executeAction(actionType, params = {}, credentials) {
    if (!credentials || (!credentials.accessToken && !credentials.botToken && !env.DISCORD_BOT_TOKEN)) {
      const err = new Error('Discord is not connected. Please authorize Discord in the Integrations panel.');
      err.code = 'INTEGRATION_NOT_CONNECTED';
      throw err;
    }

    const authHeader = this._getAuthHeader(credentials);

    if (actionType === 'post_message' || actionType === 'send') {
      const channelId = params.channelId || params.channel || 'general';
      const content = params.content || params.text || params.message || 'Automated update from Agentflow_AI workflow.';

      try {
        const res = await axios.post(
          `https://discord.com/api/v10/channels/${encodeURIComponent(channelId)}/messages`,
          { content },
          { headers: { Authorization: authHeader, 'Content-Type': 'application/json' } }
        );

        return {
          success: true,
          action: 'post_message',
          messageId: res.data.id,
          channelId: res.data.channel_id || channelId,
          content: res.data.content,
          sentAt: res.data.timestamp || new Date().toISOString(),
        };
      } catch (err) {
        throw new Error(`Discord API post failed: ${err.response?.data?.message || err.message}`);
      }
    }

    if (actionType === 'read_messages' || actionType === 'read' || actionType === 'trigger') {
      const channelId = params.channelId || params.channel || 'general';
      const limit = parseInt(params.limit || '10', 10);

      try {
        const res = await axios.get(
          `https://discord.com/api/v10/channels/${encodeURIComponent(channelId)}/messages`,
          {
            headers: { Authorization: authHeader },
            params: { limit },
          }
        );

        const messages = (res.data || []).map((msg) => ({
          id: msg.id,
          author: msg.author?.username || 'Unknown',
          content: msg.content,
          timestamp: msg.timestamp,
        }));

        return {
          success: true,
          action: 'read_messages',
          channelId,
          messages,
          totalRead: messages.length,
        };
      } catch (err) {
        throw new Error(`Discord API read failed: ${err.response?.data?.message || err.message}`);
      }
    }

    throw new Error(`Unsupported Discord action: ${actionType}`);
  }
}

module.exports = new DiscordIntegration();

const axios = require('axios');
const BaseIntegration = require('./baseIntegration');
const env = require('../config/env');

class SlackIntegration extends BaseIntegration {
  constructor() {
    super('slack');
  }

  getAuthUrl(redirectUri, state) {
    const clientId = env.SLACK_CLIENT_ID || 'CONFIG_REQUIRED';
    const scope = encodeURIComponent('chat:write,channels:read,chat:write.public,channels:history');

    return `https://slack.com/oauth/v2/authorize?client_id=${encodeURIComponent(
      clientId
    )}&scope=${scope}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${encodeURIComponent(state)}`;
  }

  async handleCallback(code, redirectUri) {
    const clientId = env.SLACK_CLIENT_ID;
    const clientSecret = env.SLACK_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error('Slack Client ID & Secret are not configured in environment variables.');
    }

    const res = await axios.post(
      'https://slack.com/api/oauth.v2.access',
      new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
      }).toString(),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    if (!res.data || !res.data.ok) {
      throw new Error(`Slack OAuth failed: ${res.data?.error || 'Unknown error'}`);
    }

    const token = res.data.access_token || res.data.authed_user?.access_token;
    const botUserId = res.data.bot_user_id || 'bot_connected';
    const teamName = res.data.team?.name || 'Slack Workspace';

    return {
      accessToken: token,
      botUserId,
      teamName,
      scope: ['chat:write', 'channels:read', 'channels:history'],
      connectedAccount: `${teamName} (${botUserId})`,
    };
  }

  async testConnection(credentials) {
    if (!credentials || !credentials.accessToken) {
      return { isConnected: false, error: 'INTEGRATION_NOT_CONNECTED' };
    }

    try {
      const res = await axios.post(
        'https://slack.com/api/auth.test',
        {},
        { headers: { Authorization: `Bearer ${credentials.accessToken}` } }
      );

      if (res.data && res.data.ok) {
        return {
          isConnected: true,
          provider: 'slack',
          account: `${res.data.team} (@${res.data.user})`,
        };
      }
      return { isConnected: false, error: res.data?.error || 'Slack Auth Test Failed' };
    } catch (err) {
      return { isConnected: false, error: err.response?.data?.error || err.message };
    }
  }

  async executeAction(actionType, params = {}, credentials) {
    if (!credentials || !credentials.accessToken) {
      const err = new Error('Slack is not connected. Please authorize Slack in the Integrations panel.');
      err.code = 'INTEGRATION_NOT_CONNECTED';
      throw err;
    }

    const token = credentials.accessToken;

    if (actionType === 'post_message' || actionType === 'send') {
      const channel = params.channel || params.channelId || '#general';
      const text = params.text || params.message || params.body || 'Automated message from Agentflow_AI workflow.';

      try {
        const res = await axios.post(
          'https://slack.com/api/chat.postMessage',
          {
            channel,
            text,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json; charset=utf-8',
            },
          }
        );

        if (!res.data || !res.data.ok) {
          throw new Error(res.data?.error || 'Failed to post message to Slack channel');
        }

        return {
          success: true,
          action: 'post_message',
          ts: res.data.ts,
          channel: res.data.channel || channel,
          text,
          sentAt: new Date().toISOString(),
        };
      } catch (err) {
        throw new Error(`Slack API error: ${err.message}`);
      }
    }

    if (actionType === 'read_messages' || actionType === 'read' || actionType === 'trigger') {
      const channel = params.channel || params.channelId || 'C01234567';
      const limit = parseInt(params.limit || '10', 10);

      try {
        const res = await axios.get('https://slack.com/api/conversations.history', {
          headers: { Authorization: `Bearer ${token}` },
          params: { channel, limit },
        });

        if (!res.data || !res.data.ok) {
          throw new Error(res.data?.error || 'Failed to read Slack conversation history');
        }

        return {
          success: true,
          action: 'read_messages',
          channel,
          messages: res.data.messages || [],
          totalRead: (res.data.messages || []).length,
        };
      } catch (err) {
        throw new Error(`Slack API read error: ${err.message}`);
      }
    }

    throw new Error(`Unsupported Slack action: ${actionType}`);
  }
}

module.exports = new SlackIntegration();

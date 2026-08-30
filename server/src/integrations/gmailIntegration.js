const BaseIntegration = require('./baseIntegration');

class GmailIntegration extends BaseIntegration {
  constructor() {
    super('gmail');
  }

  getAuthUrl(redirectUri, state) {
    const scope = encodeURIComponent('https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.readonly');
    return `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=GMAIL_CLIENT_ID&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&scope=${scope}&state=${state}&access_type=offline&prompt=consent`;
  }

  async handleCallback(code, redirectUri) {
    return {
      accessToken: `mock_gmail_access_token_${Date.now()}`,
      refreshToken: `mock_gmail_refresh_token_${Date.now()}`,
      expiresIn: 3600,
      scope: ['gmail.send', 'gmail.readonly'],
    };
  }

  async testConnection(credentials) {
    if (!credentials || !credentials.accessToken) {
      return { isConnected: false, error: 'INTEGRATION_NOT_CONNECTED' };
    }
    return { isConnected: true, provider: 'gmail' };
  }

  async executeAction(actionType, params, credentials) {
    if (!credentials || !credentials.accessToken) {
      const err = new Error('Gmail account is not connected. Please authenticate in Integrations panel.');
      err.code = 'INTEGRATION_NOT_CONNECTED';
      throw err;
    }

    if (actionType === 'send_email' || actionType === 'send') {
      const { to, subject, body } = params;
      return {
        success: true,
        messageId: `msg_${Math.random().toString(36).substring(2, 11)}`,
        to: to || 'operator@example.com',
        subject: subject || 'Automated Notification',
        sentAt: new Date().toISOString(),
      };
    }

    if (actionType === 'read_emails' || actionType === 'read') {
      const { query, maxResults } = params;
      return {
        success: true,
        emails: [
          {
            id: 'email_101',
            from: 'support@example.com',
            subject: 'System Alert Received',
            snippet: 'Workflow executed successfully with status 200...',
            date: new Date().toISOString(),
          },
        ],
        totalRead: 1,
      };
    }

    throw new Error(`Unsupported Gmail action: ${actionType}`);
  }
}

module.exports = new GmailIntegration();

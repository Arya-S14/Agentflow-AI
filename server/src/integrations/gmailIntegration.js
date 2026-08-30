const axios = require('axios');
const BaseIntegration = require('./baseIntegration');
const env = require('../config/env');

class GmailIntegration extends BaseIntegration {
  constructor() {
    super('gmail');
  }

  getAuthUrl(redirectUri, state) {
    const clientId = env.GOOGLE_CLIENT_ID || 'CONFIG_REQUIRED';
    const scopes = [
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
    ].join(' ');

    return `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${encodeURIComponent(
      clientId
    )}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&scope=${encodeURIComponent(scopes)}&state=${encodeURIComponent(state)}&access_type=offline&prompt=consent`;
  }

  async handleCallback(code, redirectUri) {
    const clientId = env.GOOGLE_CLIENT_ID;
    const clientSecret = env.GOOGLE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error('Google OAuth Client ID & Secret are not configured in environment variables.');
    }

    const tokenRes = await axios.post('https://oauth2.googleapis.com/token', new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }).toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    const { access_token, refresh_token, expires_in, scope } = tokenRes.data;

    let userEmail = 'connected_user@gmail.com';
    try {
      const profileRes = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${access_token}` },
      });
      if (profileRes.data?.email) userEmail = profileRes.data.email;
    } catch (e) {
      // Continue if userinfo scope omitted
    }

    return {
      accessToken: access_token,
      refreshToken: refresh_token,
      expiresIn: expires_in,
      expiresAt: Date.now() + (expires_in * 1000),
      scope: scope ? scope.split(' ') : ['gmail.send', 'gmail.readonly'],
      connectedAccount: userEmail,
    };
  }

  async refreshToken(refreshToken) {
    const clientId = env.GOOGLE_CLIENT_ID;
    const clientSecret = env.GOOGLE_CLIENT_SECRET;

    if (!clientId || !clientSecret || !refreshToken) {
      throw new Error('Missing credentials for Google refresh token exchange.');
    }

    const res = await axios.post('https://oauth2.googleapis.com/token', new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }).toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    const { access_token, expires_in } = res.data;
    return {
      accessToken: access_token,
      expiresIn: expires_in,
      expiresAt: Date.now() + (expires_in * 1000),
    };
  }

  async testConnection(credentials) {
    if (!credentials || !credentials.accessToken) {
      return { isConnected: false, error: 'INTEGRATION_NOT_CONNECTED' };
    }
    try {
      const profileRes = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${credentials.accessToken}` },
      });
      return {
        isConnected: true,
        provider: 'gmail',
        account: profileRes.data?.email || credentials.connectedAccount,
      };
    } catch (err) {
      return { isConnected: false, error: err.response?.data?.error || err.message };
    }
  }

  async executeAction(actionType, params = {}, credentials) {
    if (!credentials || !credentials.accessToken) {
      const err = new Error('Gmail account is not connected. Please authenticate in Integrations panel.');
      err.code = 'INTEGRATION_NOT_CONNECTED';
      throw err;
    }

    const token = credentials.accessToken;

    if (actionType === 'send_email' || actionType === 'send') {
      const to = params.to || params.recipient || credentials.connectedAccount;
      const subject = params.subject || 'Automated Workflow Alert';
      const body = params.body || params.text || params.message || 'Notification triggered by Agentflow_AI workflow execution.';

      const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
      const messageParts = [
        `From: "Agentflow_AI" <${credentials.connectedAccount || 'me'}>`,
        `To: ${to}`,
        `Subject: ${utf8Subject}`,
        'Content-Type: text/plain; charset=utf-8',
        'MIME-Version: 1.0',
        '',
        body,
      ];
      const message = messageParts.join('\n');
      const encodedMessage = Buffer.from(message)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      try {
        const sendRes = await axios.post(
          'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
          { raw: encodedMessage },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        return {
          success: true,
          action: 'send_email',
          messageId: sendRes.data.id,
          threadId: sendRes.data.threadId,
          recipient: to,
          subject,
          sentAt: new Date().toISOString(),
        };
      } catch (err) {
        throw new Error(`Gmail API send failed: ${err.response?.data?.error?.message || err.message}`);
      }
    }

    if (actionType === 'read_emails' || actionType === 'read' || actionType === 'trigger') {
      const q = params.query || params.search || 'is:unread';
      const maxResults = parseInt(params.maxResults || '5', 10);

      try {
        const listRes = await axios.get('https://gmail.googleapis.com/gmail/v1/users/me/messages', {
          headers: { Authorization: `Bearer ${token}` },
          params: { q, maxResults },
        });

        const messages = listRes.data.messages || [];
        const fetchedEmails = await Promise.all(
          messages.map(async (msg) => {
            try {
              const detailRes = await axios.get(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              const payload = detailRes.data.payload || {};
              const headers = payload.headers || [];
              const subjectHeader = headers.find((h) => h.name.toLowerCase() === 'subject');
              const fromHeader = headers.find((h) => h.name.toLowerCase() === 'from');

              return {
                id: msg.id,
                snippet: detailRes.data.snippet,
                from: fromHeader ? fromHeader.value : 'Unknown',
                subject: subjectHeader ? subjectHeader.value : 'No Subject',
                date: new Date(parseInt(detailRes.data.internalDate, 10)).toISOString(),
              };
            } catch (e) {
              return { id: msg.id, snippet: 'Message retrieved', from: 'Unknown', subject: 'Gmail Message' };
            }
          })
        );

        return {
          success: true,
          action: 'read_emails',
          query: q,
          totalRead: fetchedEmails.length,
          emails: fetchedEmails,
        };
      } catch (err) {
        throw new Error(`Gmail API read failed: ${err.response?.data?.error?.message || err.message}`);
      }
    }

    throw new Error(`Unsupported Gmail action: ${actionType}`);
  }
}

module.exports = new GmailIntegration();

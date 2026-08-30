const axios = require('axios');
const BaseIntegration = require('./baseIntegration');
const env = require('../config/env');

class GoogleSheetsIntegration extends BaseIntegration {
  constructor() {
    super('google-sheets');
  }

  getAuthUrl(redirectUri, state) {
    const clientId = env.GOOGLE_CLIENT_ID || 'CONFIG_REQUIRED';
    const scopes = [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/userinfo.email',
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

    let userEmail = 'connected_user@google.com';
    try {
      const profileRes = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${access_token}` },
      });
      if (profileRes.data?.email) userEmail = profileRes.data.email;
    } catch (e) {
      // Continue if userinfo is omitted
    }

    return {
      accessToken: access_token,
      refreshToken: refresh_token,
      expiresIn: expires_in,
      expiresAt: Date.now() + (expires_in * 1000),
      scope: scope ? scope.split(' ') : ['spreadsheets'],
      connectedAccount: userEmail,
    };
  }

  async refreshToken(refreshToken) {
    const clientId = env.GOOGLE_CLIENT_ID;
    const clientSecret = env.GOOGLE_CLIENT_SECRET;

    if (!clientId || !clientSecret || !refreshToken) {
      throw new Error('Missing credentials for Google Sheets refresh token exchange.');
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
        provider: 'google-sheets',
        account: profileRes.data?.email || credentials.connectedAccount,
      };
    } catch (err) {
      return { isConnected: false, error: err.response?.data?.error || err.message };
    }
  }

  async executeAction(actionType, params = {}, credentials) {
    if (!credentials || !credentials.accessToken) {
      const err = new Error('Google Sheets is not connected. Please authenticate in Integrations panel.');
      err.code = 'INTEGRATION_NOT_CONNECTED';
      throw err;
    }

    const token = credentials.accessToken;
    const spreadsheetId = params.spreadsheetId || params.sheetId;

    if (!spreadsheetId) {
      throw new Error('Google Sheets Action error: spreadsheetId parameter is required.');
    }

    if (actionType === 'append_row' || actionType === 'append') {
      const range = params.range || 'Sheet1!A1';
      let rowValues = params.values || params.row || [new Date().toISOString(), 'Workflow Trigger', 'Success'];

      if (!Array.isArray(rowValues)) {
        rowValues = [rowValues];
      }
      const valuesArray = Array.isArray(rowValues[0]) ? rowValues : [rowValues];

      try {
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED`;

        const appendRes = await axios.post(
          url,
          { values: valuesArray },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        return {
          success: true,
          action: 'append_row',
          spreadsheetId,
          updatedRange: appendRes.data.updates?.updatedRange || range,
          updatedRows: appendRes.data.updates?.updatedRows || 1,
          appendedValues: valuesArray,
        };
      } catch (err) {
        throw new Error(`Google Sheets API append failed: ${err.response?.data?.error?.message || err.message}`);
      }
    }

    if (actionType === 'read_range' || actionType === 'read' || actionType === 'trigger') {
      const range = params.range || 'Sheet1!A1:Z100';

      try {
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}/values/${encodeURIComponent(range)}`;

        const readRes = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        return {
          success: true,
          action: 'read_range',
          spreadsheetId,
          range: readRes.data.range || range,
          values: readRes.data.values || [],
          rowCount: (readRes.data.values || []).length,
        };
      } catch (err) {
        throw new Error(`Google Sheets API read failed: ${err.response?.data?.error?.message || err.message}`);
      }
    }

    throw new Error(`Unsupported Google Sheets action: ${actionType}`);
  }
}

module.exports = new GoogleSheetsIntegration();

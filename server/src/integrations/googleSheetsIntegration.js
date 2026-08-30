const BaseIntegration = require('./baseIntegration');

class GoogleSheetsIntegration extends BaseIntegration {
  constructor() {
    super('google-sheets');
  }

  getAuthUrl(redirectUri, state) {
    const scope = encodeURIComponent('https://www.googleapis.com/auth/spreadsheets');
    return `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=GOOGLE_SHEETS_CLIENT_ID&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&scope=${scope}&state=${state}&access_type=offline&prompt=consent`;
  }

  async handleCallback(code, redirectUri) {
    return {
      accessToken: `mock_sheets_access_token_${Date.now()}`,
      refreshToken: `mock_sheets_refresh_token_${Date.now()}`,
      expiresIn: 3600,
    };
  }

  async testConnection(credentials) {
    if (!credentials || !credentials.accessToken) {
      return { isConnected: false, error: 'INTEGRATION_NOT_CONNECTED' };
    }
    return { isConnected: true, provider: 'google-sheets' };
  }

  async executeAction(actionType, params, credentials) {
    if (!credentials || !credentials.accessToken) {
      const err = new Error('Google Sheets is not connected. Please authenticate Google Sheets.');
      err.code = 'INTEGRATION_NOT_CONNECTED';
      throw err;
    }

    if (actionType === 'append_row' || actionType === 'append') {
      const { spreadsheetId, range, values } = params;
      return {
        success: true,
        spreadsheetId: spreadsheetId || 'sheet_abc_123',
        updatedRange: range || 'Sheet1!A1:D1',
        updatedRows: 1,
        appendedValues: values || ['2026-08-30', 'Workflow Executed', 'Success', 'Agentflow_AI'],
      };
    }

    if (actionType === 'read_range' || actionType === 'read') {
      const { spreadsheetId, range } = params;
      return {
        success: true,
        spreadsheetId: spreadsheetId || 'sheet_abc_123',
        range: range || 'Sheet1!A1:D10',
        values: [
          ['Timestamp', 'Event', 'Status', 'Operator'],
          ['2026-08-30', 'System Health Check', 'Active', 'Admin'],
        ],
      };
    }

    throw new Error(`Unsupported Google Sheets action: ${actionType}`);
  }
}

module.exports = new GoogleSheetsIntegration();

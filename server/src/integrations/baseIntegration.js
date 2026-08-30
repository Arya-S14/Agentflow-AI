class BaseIntegration {
  constructor(providerName) {
    this.provider = providerName;
  }

  /**
   * Returns OAuth authorization URL for initiating OAuth consent.
   */
  getAuthUrl(redirectUri, state) {
    throw new Error(`getAuthUrl not implemented for provider ${this.provider}`);
  }

  /**
   * Exchanges code for tokens.
   */
  async handleCallback(code, redirectUri) {
    throw new Error(`handleCallback not implemented for provider ${this.provider}`);
  }

  /**
   * Tests provider connection health.
   */
  async testConnection(credentials) {
    throw new Error(`testConnection not implemented for provider ${this.provider}`);
  }

  /**
   * Executes a provider specific action (e.g. send email, post message).
   */
  async executeAction(actionType, params, credentials) {
    throw new Error(`executeAction not implemented for provider ${this.provider}`);
  }
}

module.exports = BaseIntegration;

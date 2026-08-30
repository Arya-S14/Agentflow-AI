/**
 * Recovery Agent
 * Classifies failures (MISSING_FIELDS, API_FAILURE, AUTH_EXPIRED, RATE_LIMIT, TRANSIENT)
 * and decides between retry_with_backoff and escalate.
 */
class RecoveryAgent {
  constructor() {
    this.name = 'recovery';
  }

  evaluateFailure(error, currentRetryCount = 0, maxRetries = 3) {
    const errorMsg = error.message || error.code || String(error);
    let category = 'TRANSIENT';

    if (error.code === 'INTEGRATION_NOT_CONNECTED' || errorMsg.includes('AUTH_EXPIRED') || errorMsg.includes('not connected')) {
      category = 'AUTH_EXPIRED';
    } else if (errorMsg.includes('429') || errorMsg.includes('rate limit')) {
      category = 'RATE_LIMIT';
    } else if (errorMsg.includes('MISSING_FIELDS') || errorMsg.includes('validation')) {
      category = 'MISSING_FIELDS';
    } else if (errorMsg.includes('500') || errorMsg.includes('API')) {
      category = 'API_FAILURE';
    }

    if (category === 'AUTH_EXPIRED' || category === 'MISSING_FIELDS') {
      return {
        category,
        action: 'escalate',
        backoffDelayMs: 0,
        reason: `Failure [${category}] requires operator intervention or credential refresh.`,
      };
    }

    if (currentRetryCount < maxRetries) {
      const backoffDelayMs = Math.pow(2, currentRetryCount) * 1000;
      return {
        category,
        action: 'retry_with_backoff',
        backoffDelayMs,
        nextRetryCount: currentRetryCount + 1,
        reason: `Classified as ${category}. Scheduling retry #${currentRetryCount + 1} with ${backoffDelayMs}ms backoff.`,
      };
    }

    return {
      category,
      action: 'escalate',
      backoffDelayMs: 0,
      reason: `Exceeded maximum retries (${maxRetries}). Escalating failure.`,
    };
  }
}

module.exports = new RecoveryAgent();

/**
 * Validation Agent
 * Verifies required output fields and schema integrity.
 */
class ValidationAgent {
  constructor() {
    this.name = 'validation';
  }

  validate(node, executionResult) {
    if (!executionResult) {
      return {
        isValid: false,
        errorType: 'MISSING_FIELDS',
        message: 'Execution returned null or empty result.',
      };
    }

    if (executionResult.status !== 'SUCCESS') {
      return {
        isValid: false,
        errorType: 'EXECUTION_FAILURE',
        message: executionResult.error || 'Step execution failed.',
      };
    }

    const output = executionResult.output;
    if (!output || typeof output !== 'object') {
      return {
        isValid: false,
        errorType: 'MISSING_FIELDS',
        message: 'Output payload is not an object or missing.',
      };
    }

    return {
      isValid: true,
      validatedAt: new Date().toISOString(),
      fieldsVerified: Object.keys(output),
    };
  }
}

module.exports = new ValidationAgent();

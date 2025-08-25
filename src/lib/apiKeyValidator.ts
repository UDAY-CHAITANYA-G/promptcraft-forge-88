import { apiConfigService } from './apiConfigService';

/**
 * Utility class for validating API keys with detailed feedback
 */
export class ApiKeyValidator {
  /**
   * Validate an OpenAI API key format
   * @param apiKey - The API key to validate
   * @returns Validation result with detailed information
   */
  static validateOpenAIKey(apiKey: string) {
    return apiConfigService.getApiKeyValidationDetails('openai', apiKey);
  }

  /**
   * Quick validation check for OpenAI API key
   * @param apiKey - The API key to validate
   * @returns true if valid, false otherwise
   */
  static isValidOpenAIKey(apiKey: string): boolean {
    return apiConfigService.validateApiKeyFormat('openai', apiKey);
  }

  /**
   * Validate any supported API key
   * @param provider - The API provider
   * @param apiKey - The API key to validate
   * @returns Validation result with detailed information
   */
  static validateApiKey(provider: 'openai' | 'gemini' | 'anthropic', apiKey: string) {
    return apiConfigService.getApiKeyValidationDetails(provider, apiKey);
  }

  /**
   * Get a summary of validation results
   * @param validationResult - The validation result from getApiKeyValidationDetails
   * @returns A formatted summary string
   */
  static getValidationSummary(validationResult: {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }): string {
    if (validationResult.isValid) {
      let summary = '✅ API key is valid';
      if (validationResult.warnings.length > 0) {
        summary += `\n⚠️  Warnings:\n${validationResult.warnings.map(w => `  - ${w}`).join('\n')}`;
      }
      return summary;
    } else {
      return `❌ API key is invalid:\n${validationResult.errors.map(e => `  - ${e}`).join('\n')}`;
    }
  }
}



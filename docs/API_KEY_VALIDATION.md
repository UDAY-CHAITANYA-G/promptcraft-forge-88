# API Key Validation System

This document describes the API key validation system implemented in the PromptCraft Forge application.

## Overview

The system validates API keys for multiple AI service providers with comprehensive error checking and detailed feedback.

## Supported Providers

- **OpenAI** - Supports both standard and project-level API keys
- **Gemini** - Google's AI service
- **Anthropic** - Claude AI service

## OpenAI API Key Validation

### Supported Formats

1. **Standard API Key**: `sk-` + at least 32 characters
   - Example: `sk-1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef`

2. **Project-Level API Key**: `sk-proj-` + at least 32 characters
   - Example: `sk-proj-example1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef`

### Validation Rules

- Must start with `sk-` or `sk-proj-`
- Must contain at least 32 characters after the prefix
- Only allows letters (a-z, A-Z), numbers (0-9), hyphens (-), and underscores (_)
- Project keys will show a warning but are still considered valid

## Usage

### Basic Validation

```typescript
import { ApiKeyValidator } from '@/lib/apiKeyValidator';

// Quick validation
const isValid = ApiKeyValidator.isValidOpenAIKey(apiKey);

// Detailed validation
const validation = ApiKeyValidator.validateOpenAIKey(apiKey);
```

### Validation Result Structure

```typescript
interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}
```

### Example Output

For a valid project-level API key:
```typescript
{
  isValid: true,
  errors: [],
  warnings: ['This appears to be a project-level API key']
}
```

For an invalid API key:
```typescript
{
  isValid: false,
  errors: [
    'OpenAI API key must start with "sk-"',
    'API key part must be at least 32 characters long'
  ],
  warnings: []
}
```

## Integration with API Config Service

The validation is integrated with the main `ApiConfigService` class:

```typescript
import { apiConfigService } from '@/lib/apiConfigService';

// Validate before saving
if (apiConfigService.validateApiKeyFormat('openai', apiKey)) {
  await apiConfigService.saveApiConfig('openai', apiKey);
}
```

## Demo Component

A demo component is available at `src/components/ApiKeyValidatorDemo.tsx` that showcases the validation functionality with a user interface.

## Security Notes

- API keys are encrypted before storage using base64 encoding (demo purposes)
- In production, use proper encryption libraries like AES-256
- Never log or expose API keys in client-side code
- Consider implementing rate limiting for validation attempts

## Testing

The validation system has been tested with various API key formats:

✅ **Valid Keys:**
- Standard OpenAI keys starting with `sk-`
- Project-level keys starting with `sk-proj-`
- Keys with hyphens and underscores

❌ **Invalid Keys:**
- Keys not starting with `sk-`
- Keys shorter than 32 characters
- Keys with invalid characters
- Empty or whitespace-only keys

## Future Enhancements

- Real-time API testing by making actual API calls
- Support for additional AI service providers
- Enhanced encryption for stored keys
- Rate limiting and abuse prevention
- Audit logging for validation attempts

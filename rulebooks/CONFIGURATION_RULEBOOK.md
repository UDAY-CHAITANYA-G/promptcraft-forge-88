# PromptCraft Forge - Configuration Rulebook

## 📋 **Overview**
This rulebook defines the configuration architecture, patterns, and standards for the PromptCraft Forge application. It ensures consistent configuration management, eliminates hardcoded values, and provides a scalable, maintainable configuration system.

---

## 🏗️ **Configuration Architecture**

### **Directory Structure**
```
src/config/
├── index.ts                    # Centralized configuration exports
├── app.config.ts              # Application-wide configuration
└── environment.config.ts      # Environment-specific settings
```

### **Configuration Categories**
- **Application Configuration**: App-wide settings, providers, frameworks, UI features
- **Environment Configuration**: Environment variables, external service configs
- **Security Configuration**: Encryption, validation, authentication settings
- **Feature Configuration**: Feature flags, provider enablement, framework settings

---

## 🎯 **Configuration Implementation Standards**

### **Configuration File Pattern**
```typescript
// ✅ Good: Configuration File Structure
export interface ConfigType {
  // Define configuration structure
  section: {
    property: string;
    nested: {
      value: number;
    };
  };
}

// Default configuration
const defaultConfig: ConfigType = {
  // Default values
};

// Environment-based loader
export const loadConfig = (): ConfigType => {
  const config = { ...defaultConfig };
  
  // Load from environment variables
  if (import.meta.env.VITE_PROPERTY) {
    config.section.property = import.meta.env.VITE_PROPERTY;
  }
  
  return config;
};

// Export loaded configuration
export const config = loadConfig();
```

### **Environment Variable Pattern**
```typescript
// ✅ Good: Environment Variable Handling
const validateRequiredEnvVar = (name: string, value: string | undefined): string => {
  if (!value) {
    throw new Error(`Required environment variable ${name} is not set`);
  }
  return value;
};

const validateOptionalEnvVar = (name: string, value: string | undefined, defaultValue: string): string => {
  return value || defaultValue;
};

// Usage
const config = {
  required: validateRequiredEnvVar('VITE_REQUIRED_VAR', import.meta.env.VITE_REQUIRED_VAR),
  optional: validateOptionalEnvVar('VITE_OPTIONAL_VAR', import.meta.env.VITE_OPTIONAL_VAR, 'default'),
};
```

---

## 🔧 **Application Configuration**

### **Provider Configuration**
- **Purpose**: Define AI provider settings, validation rules, and enablement
- **Pattern**: Configurable providers with validation patterns
- **Features**: Dynamic enablement, custom validation, base URL configuration

```typescript
// ✅ Good: Provider Configuration Pattern
providers: {
  openai: {
    name: 'openai',
    displayName: 'OpenAI',
    apiKeyPattern: /^sk-(proj-)?[a-zA-Z0-9_-]{32,}$/,
    baseUrl: 'https://api.openai.com/v1',
    enabled: true,
    validationRules: {
      minLength: 35,
      maxLength: 100,
      requiredPrefix: 'sk-',
      customValidator: (key: string) => {
        const keyPart = key.replace(/^sk-(proj-)?/, '');
        return /^[a-zA-Z0-9_-]+$/.test(keyPart);
      },
    },
  },
  // Add new providers easily
  newProvider: {
    name: 'newProvider',
    displayName: 'New AI Provider',
    apiKeyPattern: /^new-[a-zA-Z0-9]{32,}$/,
    baseUrl: 'https://api.newprovider.com/v1',
    enabled: true,
    validationRules: {
      minLength: 35,
      requiredPrefix: 'new-',
    },
  },
}
```

### **Framework Configuration**
- **Purpose**: Define prompt frameworks with components and enablement
- **Pattern**: Configurable frameworks with dynamic components
- **Features**: Component mapping, enablement flags, descriptions

```typescript
// ✅ Good: Framework Configuration Pattern
frameworks: {
  roses: {
    id: 'roses',
    name: 'R.O.S.E.S Framework',
    description: 'Role, Objective, Steps, Expected Solution, Scenario',
    components: ['role', 'objective', 'steps', 'expected_solution', 'scenario'],
    enabled: true,
  },
  customFramework: {
    id: 'customFramework',
    name: 'Custom Framework',
    description: 'Custom prompt framework',
    components: ['component1', 'component2'],
    enabled: true,
  },
}
```

### **Feature Flags**
- **Purpose**: Enable/disable application features via configuration
- **Pattern**: Boolean flags with environment variable override
- **Features**: Runtime feature toggling, environment-specific settings

```typescript
// ✅ Good: Feature Flag Pattern
ui: {
  features: {
    history: true,
    feedback: true,
    analytics: false,
    export: true,
    import: false,
  },
}

// Environment override
Object.keys(config.ui.features).forEach(feature => {
  const envKey = `VITE_FEATURE_${feature.toUpperCase()}`;
  if (import.meta.env[envKey] !== undefined) {
    config.ui.features[feature] = import.meta.env[envKey] === 'true';
  }
});
```

---

## 🌍 **Environment Configuration**

### **Environment Variable Management**
- **Purpose**: Handle environment-specific settings with validation
- **Pattern**: Type-safe environment variable access with fallbacks
- **Features**: Required/optional validation, secure defaults, configuration validation

### **Database Configuration**
- **Purpose**: Configure restructured database connection and comprehensive settings
- **Pattern**: Environment-based database configuration with modular schema support
- **Features**: Connection strings, RLS settings, migration configuration, analytics, monitoring, maintenance

```typescript
// ✅ Good: Environment Configuration Pattern
export interface EnvironmentConfig {
  supabase: {
    url: string;
    anonKey: string;
  };
  emailjs: {
    serviceId: string;
    templateId: string;
    publicKey: string;
    recipientEmail: string;
  };
  security: {
    encryptionKey: string;
    jwtSecret?: string;
  };
  api: {
    timeout: number;
    retryAttempts: number;
    baseUrls: {
      [provider: string]: string;
    };
  };
  development: {
    enableLogging: boolean;
    enableDebugMode: boolean;
    mockApiResponses: boolean;
  };
}
```

### **Configuration Validation**
- **Purpose**: Validate configuration completeness and security
- **Pattern**: Comprehensive validation with error reporting
- **Features**: Required field validation, security checks, environment-specific validation

```typescript
// ✅ Good: Configuration Validation Pattern
export const validateConfiguration = (): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Check Supabase configuration
  if (!isSupabaseConfigured()) {
    errors.push('Supabase configuration is incomplete or missing');
  }
  
  // Check EmailJS configuration (optional)
  if (!isEmailJsConfigured()) {
    console.warn('EmailJS configuration is incomplete - feedback feature will be disabled');
  }
  
  // Check security configuration
  if (envConfig.security.encryptionKey === 'promptforge-secure-key-2024' && isProduction()) {
    errors.push('Default encryption key is being used in production - this is not secure');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};
```

---

## 🔒 **Security Configuration**

### **Encryption Configuration**
- **Purpose**: Configure encryption settings for sensitive data
- **Pattern**: Environment-based encryption key management
- **Features**: Configurable algorithms, key length, secure defaults

```typescript
// ✅ Good: Security Configuration Pattern
security: {
  encryption: {
    algorithm: 'AES-256-GCM',
    keyLength: 32,
  },
  validation: {
    strictMode: true,
    timeout: 5000,
  },
}

// Environment-based encryption key
security: {
  encryptionKey: validateOptionalEnvVar(
    'VITE_ENCRYPTION_KEY',
    import.meta.env.VITE_ENCRYPTION_KEY,
    'promptforge-secure-key-2024'
  ),
}
```

### **API Security**
- **Purpose**: Configure API security settings and validation
- **Pattern**: Provider-specific security configurations
- **Features**: Timeout settings, retry attempts, base URL configuration

```typescript
// ✅ Good: API Security Configuration
api: {
  timeout: parseInt(validateOptionalEnvVar('VITE_API_TIMEOUT', import.meta.env.VITE_API_TIMEOUT, '30000')),
  retryAttempts: parseInt(validateOptionalEnvVar('VITE_API_RETRY_ATTEMPTS', import.meta.env.VITE_API_RETRY_ATTEMPTS, '3')),
  baseUrls: {
    openai: validateOptionalEnvVar('VITE_OPENAI_BASE_URL', import.meta.env.VITE_OPENAI_BASE_URL, 'https://api.openai.com/v1'),
    gemini: validateOptionalEnvVar('VITE_GEMINI_BASE_URL', import.meta.env.VITE_GEMINI_BASE_URL, 'https://generativelanguage.googleapis.com/v1'),
  },
}
```

---

## 🚀 **Configuration Usage Patterns**

### **Centralized Configuration Access**
```typescript
// ✅ Good: Centralized Configuration Import
import { appConfig, envConfig, getEnabledProviders, isFeatureEnabled } from '@/config';

// Use configuration
const providers = getEnabledProviders();
const isHistoryEnabled = isFeatureEnabled('history');
const supabaseUrl = envConfig.supabase.url;
```

### **Feature Flag Usage**
```typescript
// ✅ Good: Feature Flag Pattern
import { features } from '@/config';

// Conditional feature rendering
{features.history && (
  <HistoryComponent />
)}

// Conditional service initialization
if (features.feedback) {
  initializeFeedbackService();
}
```

### **Provider Configuration Usage**
```typescript
// ✅ Good: Provider Configuration Pattern
import { providers, getProviderConfig } from '@/config';

// Get specific provider config
const openaiConfig = getProviderConfig('openai');
const isOpenaiEnabled = openaiConfig?.enabled;

// Validate API key using provider config
const isValid = openaiConfig?.apiKeyPattern.test(apiKey);
```

### **Environment-Specific Configuration**
```typescript
// ✅ Good: Environment-Specific Pattern
import { isDevelopment, isProduction, isStaging } from '@/config';

// Environment-specific behavior
if (isDevelopment()) {
  console.log('Development mode enabled');
}

if (isProduction()) {
  // Production-specific configuration
  enableErrorReporting();
}
```

---

## 📦 **Configuration Export Patterns**

### **Centralized Exports**
```typescript
// ✅ Good: Centralized Configuration Export
export const config = {
  app: appConfig,
  env: envConfig,
} as const;

// Feature flags
export const features = {
  history: isFeatureEnabled('history'),
  feedback: isFeatureEnabled('feedback'),
  analytics: isFeatureEnabled('analytics'),
} as const;

// Provider configurations
export const providers = {
  openai: getProviderConfig('openai'),
  gemini: getProviderConfig('gemini'),
  anthropic: getProviderConfig('anthropic'),
} as const;
```

### **Helper Functions**
```typescript
// ✅ Good: Configuration Helper Functions
export const getConfig = () => config;

export const isConfigured = () => {
  const validation = validateConfiguration();
  return validation.isValid;
};

export const getConfigurationErrors = () => {
  const validation = validateConfiguration();
  return validation.errors;
};
```

---

## 🔄 **Dynamic Configuration Patterns**

### **Dynamic Provider Addition**
```typescript
// ✅ Good: Dynamic Provider Addition
const addNewProvider = (providerConfig: ProviderConfig) => {
  appConfig.providers[providerConfig.name] = {
    ...providerConfig,
    enabled: true,
  };
};

// Usage
addNewProvider({
  name: 'cohere',
  displayName: 'Cohere',
  apiKeyPattern: /^co-[a-zA-Z0-9]{32,}$/,
  baseUrl: 'https://api.cohere.ai/v1',
  validationRules: {
    minLength: 35,
    requiredPrefix: 'co-',
  },
});
```

### **Dynamic Framework Addition**
```typescript
// ✅ Good: Dynamic Framework Addition
const addNewFramework = (frameworkConfig: FrameworkConfig) => {
  appConfig.frameworks[frameworkConfig.id] = {
    ...frameworkConfig,
    enabled: true,
  };
};

// Usage
addNewFramework({
  id: 'customFramework',
  name: 'Custom Framework',
  description: 'Custom prompt framework',
  components: ['component1', 'component2'],
});
```

---

## 🧪 **Configuration Testing**

### **Configuration Validation Testing**
```typescript
// ✅ Good: Configuration Test Pattern
describe('Configuration', () => {
  it('should validate required environment variables', () => {
    const validation = validateConfiguration();
    expect(validation.isValid).toBe(true);
    expect(validation.errors).toHaveLength(0);
  });
  
  it('should load provider configurations', () => {
    const providers = getEnabledProviders();
    expect(providers.length).toBeGreaterThan(0);
  });
  
  it('should respect feature flags', () => {
    const isHistoryEnabled = isFeatureEnabled('history');
    expect(typeof isHistoryEnabled).toBe('boolean');
  });
});
```

### **Environment Configuration Testing**
```typescript
// ✅ Good: Environment Configuration Test
describe('Environment Configuration', () => {
  it('should load Supabase configuration', () => {
    expect(envConfig.supabase.url).toBeDefined();
    expect(envConfig.supabase.anonKey).toBeDefined();
  });
  
  it('should validate EmailJS configuration', () => {
    const isConfigured = isEmailJsConfigured();
    expect(typeof isConfigured).toBe('boolean');
  });
  
  it('should load database configuration', () => {
    expect(envConfig.api.timeout).toBeDefined();
    expect(envConfig.api.retryAttempts).toBeDefined();
    expect(envConfig.security.encryptionKey).toBeDefined();
  });
});
```

### **Database Configuration Usage**
```typescript
// ✅ Good: Enhanced Database Configuration Pattern
import { envConfig } from '@/config';

// Database connection settings
const supabaseUrl = envConfig.supabase.url;
const supabaseKey = envConfig.supabase.anonKey;

// Database operation settings
const dbTimeout = envConfig.api.timeout;
const retryAttempts = envConfig.api.retryAttempts;

// Security settings
const encryptionKey = envConfig.security.encryptionKey;

// Analytics and monitoring settings
const enableAnalytics = envConfig.features.analytics;
const enableMaintenance = envConfig.features.maintenance;

// Usage in enhanced database service
class DatabaseService {
  private timeout = envConfig.api.timeout;
  private retryAttempts = envConfig.api.retryAttempts;
  private analyticsEnabled = envConfig.features.analytics;
  private maintenanceEnabled = envConfig.features.maintenance;

  async performDatabaseOperation() {
    // Use configured timeout and retry settings
    // Include analytics tracking if enabled
    // Include maintenance monitoring if enabled
  }

  async performMaintenance() {
    if (this.maintenanceEnabled) {
      // Execute automated maintenance tasks
    }
  }

  async trackAnalytics(operation: string, metrics: any) {
    if (this.analyticsEnabled) {
      // Track operation metrics
    }
  }
}
```

---

## 📋 **Configuration Standards**

### **Environment Variable Naming**
- [ ] **Prefix**: All environment variables must start with `VITE_`
- [ ] **Naming Convention**: Use `UPPER_SNAKE_CASE` for environment variables
- [ ] **Descriptive Names**: Use descriptive names that indicate purpose
- [ ] **Grouping**: Group related variables with common prefixes

```bash
# ✅ Good: Environment Variable Naming
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID=your_template_id
VITE_FEATURE_HISTORY=true
VITE_FEATURE_FEEDBACK=true
VITE_ENABLED_PROVIDERS=openai,gemini,anthropic
```

### **Configuration Validation**
- [ ] **Required Variables**: Validate all required environment variables
- [ ] **Optional Variables**: Provide sensible defaults for optional variables
- [ ] **Type Validation**: Ensure correct data types for configuration values
- [ ] **Security Validation**: Check for insecure default values in production

### **Configuration Documentation**
- [ ] **Interface Documentation**: Document all configuration interfaces
- [ ] **Environment Variables**: Document all required and optional environment variables
- [ ] **Default Values**: Document all default configuration values
- [ ] **Usage Examples**: Provide examples of configuration usage

---

## 🚨 **Configuration Anti-Patterns**

### **❌ Don't Do This**
```typescript
// ❌ Bad: Hardcoded Configuration
const SUPABASE_URL = "https://hardcoded-url.supabase.co";
const API_KEY = "sk-hardcoded-key";

// ❌ Bad: No Validation
const config = {
  apiKey: import.meta.env.VITE_API_KEY, // No validation
};

// ❌ Bad: Scattered Configuration
// Configuration spread across multiple files without centralization

// ❌ Bad: No Environment Separation
const isProduction = window.location.hostname === 'production.com';
```

### **✅ Do This Instead**
```typescript
// ✅ Good: Environment-Based Configuration
const SUPABASE_URL = validateRequiredEnvVar('VITE_SUPABASE_URL', import.meta.env.VITE_SUPABASE_URL);

// ✅ Good: Validated Configuration
const config = {
  apiKey: validateRequiredEnvVar('VITE_API_KEY', import.meta.env.VITE_API_KEY),
};

// ✅ Good: Centralized Configuration
import { appConfig, envConfig } from '@/config';

// ✅ Good: Environment Detection
import { isProduction } from '@/config';
```

---

## 📚 **Configuration Migration Guide**

### **From Hardcoded to Environment Variables**
```typescript
// Old: Hardcoded values
const config = {
  supabaseUrl: "https://hardcoded.supabase.co",
  apiKey: "sk-hardcoded-key",
};

// New: Environment-based configuration
import { envConfig } from '@/config';
const config = {
  supabaseUrl: envConfig.supabase.url,
  apiKey: envConfig.api.key,
};
```

### **From Static to Dynamic Configuration**
```typescript
// Old: Static provider list
const providers = ['openai', 'gemini', 'anthropic'];

// New: Dynamic provider configuration
import { getEnabledProviders } from '@/config';
const providers = getEnabledProviders().map(p => p.name);
```

### **From Scattered to Centralized Configuration**
```typescript
// Old: Scattered configuration
// In multiple files
const API_TIMEOUT = 30000;
const RETRY_ATTEMPTS = 3;

// New: Centralized configuration
import { envConfig } from '@/config';
const { timeout, retryAttempts } = envConfig.api;
```

---

## 🔧 **Configuration Development Workflow**

### **Adding New Configuration**
1. **Define Interface**: Add configuration interface to appropriate config file
2. **Add Default Values**: Provide sensible default values
3. **Environment Integration**: Add environment variable loading
4. **Validation**: Add validation for new configuration
5. **Documentation**: Document the new configuration option
6. **Testing**: Add tests for new configuration

### **Modifying Existing Configuration**
1. **Backward Compatibility**: Ensure changes are backward compatible
2. **Migration Path**: Provide migration path for existing configurations
3. **Validation Updates**: Update validation rules if needed
4. **Documentation**: Update documentation for changes
5. **Testing**: Update tests for modified configuration

---

## 📊 **Configuration Monitoring**

### **Configuration Health Checks**
```typescript
// ✅ Good: Configuration Health Check
export const checkConfigurationHealth = () => {
  const validation = validateConfiguration();
  const health = {
    isValid: validation.isValid,
    errors: validation.errors,
    warnings: validation.warnings,
    timestamp: new Date(),
  };
  
  if (!health.isValid) {
    console.error('Configuration health check failed:', health.errors);
  }
  
  return health;
};
```

### **Configuration Logging**
```typescript
// ✅ Good: Configuration Logging
export const logConfiguration = () => {
  if (isDevelopment()) {
    console.log('Application Configuration:', {
      providers: getEnabledProviders().map(p => p.name),
      features: Object.keys(features).filter(f => features[f]),
      environment: envConfig.app.environment,
    });
  }
};
```

---

## 📚 **Resources & References**

### **Configuration Management**
- [Environment Variables Best Practices](https://12factor.net/config)
- [Configuration Management Patterns](https://martinfowler.com/articles/configuration.html)
- [TypeScript Configuration](https://www.typescriptlang.org/docs/handbook/2/modules.html)

### **Security**
- [Environment Variable Security](https://owasp.org/www-community/vulnerabilities/Use_of_hard-coded_credentials)
- [Configuration Security](https://cheatsheetseries.owasp.org/cheatsheets/Configuration_Cheat_Sheet.html)

---

**Last Updated**: January 2025  
**Version**: 1.0  
**Maintainer**: Development Team

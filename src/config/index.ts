/**
 * Configuration Index
 * 
 * This file provides a centralized export for all configuration modules.
 * Import configuration from here to ensure consistency across the application.
 */

// Export all configuration modules
export { appConfig, loadAppConfig, getEnabledProviders, getEnabledFrameworks, isFeatureEnabled, getProviderConfig, getFrameworkConfig } from './app.config';
export type { AppConfig } from './app.config';

export { envConfig, loadEnvironmentConfig, isDevelopment, isProduction, isStaging, getApiBaseUrl, isEmailJsConfigured, isSupabaseConfigured, validateConfiguration } from './environment.config';
export type { EnvironmentConfig } from './environment.config';

// Import for local use
import { appConfig, getEnabledProviders, getEnabledFrameworks, isFeatureEnabled, getProviderConfig, getFrameworkConfig } from './app.config';
import { envConfig, validateConfiguration } from './environment.config';

// Re-export commonly used configurations
export const config = {
  app: appConfig,
  env: envConfig,
} as const;

// Configuration utilities
export const getConfig = () => config;

export const isConfigured = () => {
  const validation = validateConfiguration();
  return validation.isValid;
};

export const getConfigurationErrors = () => {
  const validation = validateConfiguration();
  return validation.errors;
};

// Feature flags
export const features = {
  history: isFeatureEnabled('history'),
  feedback: isFeatureEnabled('feedback'),
  analytics: isFeatureEnabled('analytics'),
  export: isFeatureEnabled('export'),
  import: isFeatureEnabled('import'),
} as const;

// Provider configurations
export const providers = {
  openai: getProviderConfig('openai'),
  gemini: getProviderConfig('gemini'),
  anthropic: getProviderConfig('anthropic'),
} as const;

// Framework configurations
export const frameworks = {
  roses: getFrameworkConfig('roses'),
  ape: getFrameworkConfig('ape'),
  tag: getFrameworkConfig('tag'),
  era: getFrameworkConfig('era'),
  race: getFrameworkConfig('race'),
  rise: getFrameworkConfig('rise'),
  care: getFrameworkConfig('care'),
  coast: getFrameworkConfig('coast'),
  trace: getFrameworkConfig('trace'),
} as const;

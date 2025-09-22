/**
 * Environment Configuration
 * 
 * This file handles environment-specific configuration and validation.
 * It provides type-safe access to environment variables with proper fallbacks.
 */

export interface EnvironmentConfig {
  // Supabase Configuration
  supabase: {
    url: string;
    anonKey: string;
  };
  
  // EmailJS Configuration
  emailjs: {
    serviceId: string;
    templateId: string;
    publicKey: string;
    recipientEmail: string;
  };
  
  // Security Configuration
  security: {
    encryptionKey: string;
    jwtSecret?: string;
  };
  
  // API Configuration
  api: {
    timeout: number;
    retryAttempts: number;
    baseUrls: {
      [provider: string]: string;
    };
  };
  
  // Development Configuration
  development: {
    enableLogging: boolean;
    enableDebugMode: boolean;
    mockApiResponses: boolean;
  };
}

// Environment variable validation
const validateRequiredEnvVar = (name: string, value: string | undefined): string => {
  if (!value) {
    throw new Error(`Required environment variable ${name} is not set`);
  }
  return value;
};

const validateOptionalEnvVar = (name: string, value: string | undefined, defaultValue: string): string => {
  return value || defaultValue;
};

// Load and validate environment configuration
export const loadEnvironmentConfig = (): EnvironmentConfig => {
  try {
    return {
      supabase: {
        url: validateRequiredEnvVar(
          'VITE_SUPABASE_URL',
          import.meta.env.VITE_SUPABASE_URL
        ),
        anonKey: validateRequiredEnvVar(
          'VITE_SUPABASE_ANON_KEY',
          import.meta.env.VITE_SUPABASE_ANON_KEY
        ),
      },
      
      emailjs: {
        serviceId: validateOptionalEnvVar(
          'VITE_EMAILJS_SERVICE_ID',
          import.meta.env.VITE_EMAILJS_SERVICE_ID,
          'YOUR_SERVICE_ID'
        ),
        templateId: validateOptionalEnvVar(
          'VITE_EMAILJS_TEMPLATE_ID',
          import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
          'YOUR_TEMPLATE_ID'
        ),
        publicKey: validateOptionalEnvVar(
          'VITE_EMAILJS_PUBLIC_KEY',
          import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
          'YOUR_PUBLIC_KEY'
        ),
        recipientEmail: validateOptionalEnvVar(
          'VITE_EMAILJS_RECIPIENT_EMAIL',
          import.meta.env.VITE_EMAILJS_RECIPIENT_EMAIL,
          'zeroxchaitanya@gmail.com'
        ),
      },
      
      security: {
        encryptionKey: validateOptionalEnvVar(
          'VITE_ENCRYPTION_KEY',
          import.meta.env.VITE_ENCRYPTION_KEY,
          'promptforge-secure-key-2024'
        ),
        jwtSecret: import.meta.env.VITE_JWT_SECRET,
      },
      
      api: {
        timeout: parseInt(
          validateOptionalEnvVar(
            'VITE_API_TIMEOUT',
            import.meta.env.VITE_API_TIMEOUT,
            '30000'
          )
        ),
        retryAttempts: parseInt(
          validateOptionalEnvVar(
            'VITE_API_RETRY_ATTEMPTS',
            import.meta.env.VITE_API_RETRY_ATTEMPTS,
            '3'
          )
        ),
        baseUrls: {
          openai: validateOptionalEnvVar(
            'VITE_OPENAI_BASE_URL',
            import.meta.env.VITE_OPENAI_BASE_URL,
            'https://api.openai.com/v1'
          ),
          gemini: validateOptionalEnvVar(
            'VITE_GEMINI_BASE_URL',
            import.meta.env.VITE_GEMINI_BASE_URL,
            'https://generativelanguage.googleapis.com/v1'
          ),
          anthropic: validateOptionalEnvVar(
            'VITE_ANTHROPIC_BASE_URL',
            import.meta.env.VITE_ANTHROPIC_BASE_URL,
            'https://api.anthropic.com/v1'
          ),
        },
      },
      
      development: {
        enableLogging: import.meta.env.VITE_ENABLE_LOGGING === 'true',
        enableDebugMode: import.meta.env.VITE_DEBUG_MODE === 'true',
        mockApiResponses: import.meta.env.VITE_MOCK_API_RESPONSES === 'true',
      },
    };
  } catch (error) {
    console.error('Failed to load environment configuration:', error);
    throw error;
  }
};

// Export the loaded configuration
export const envConfig = loadEnvironmentConfig();

// Helper functions
export const isDevelopment = (): boolean => {
  return import.meta.env.MODE === 'development';
};

export const isProduction = (): boolean => {
  return import.meta.env.MODE === 'production';
};

export const isStaging = (): boolean => {
  return import.meta.env.MODE === 'staging';
};

export const getApiBaseUrl = (provider: string): string => {
  return envConfig.api.baseUrls[provider] || '';
};

export const isEmailJsConfigured = (): boolean => {
  const { serviceId, templateId, publicKey } = envConfig.emailjs;
  return !(
    serviceId === 'YOUR_SERVICE_ID' ||
    templateId === 'YOUR_TEMPLATE_ID' ||
    publicKey === 'YOUR_PUBLIC_KEY'
  );
};

export const isSupabaseConfigured = (): boolean => {
  const { url, anonKey } = envConfig.supabase;
  return !!(url && anonKey && url !== 'your_supabase_url_here' && anonKey !== 'your_supabase_anon_key_here');
};

// Configuration validation
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


/**
 * Application Configuration
 * 
 * This file contains all application-wide configuration settings.
 * Values are loaded from environment variables with fallbacks.
 */

export interface AppConfig {
  // Application Info
  app: {
    name: string;
    version: string;
    environment: 'development' | 'staging' | 'production';
    debug: boolean;
  };
  
  // API Providers Configuration
  providers: {
    [key: string]: {
      name: string;
      displayName: string;
      apiKeyPattern: RegExp;
      baseUrl?: string;
      enabled: boolean;
      validationRules: {
        minLength?: number;
        maxLength?: number;
        requiredPrefix?: string;
        customValidator?: (key: string) => boolean;
      };
    };
  };
  
  // Framework Configuration
  frameworks: {
    [key: string]: {
      id: string;
      name: string;
      description: string;
      components: string[];
      enabled: boolean;
    };
  };
  
  // UI Configuration
  ui: {
    theme: {
      default: string;
      available: string[];
    };
    features: {
      [key: string]: boolean;
    };
  };
  
  // Security Configuration
  security: {
    encryption: {
      algorithm: string;
      keyLength: number;
    };
    validation: {
      strictMode: boolean;
      timeout: number;
    };
  };
}

// Default configuration
const defaultConfig: AppConfig = {
  app: {
    name: 'PromptForge',
    version: '1.0.0',
    environment: 'development',
    debug: true,
  },
  
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
    gemini: {
      name: 'gemini',
      displayName: 'Google Gemini',
      apiKeyPattern: /^AIza[a-zA-Z0-9_-]{35}$/,
      baseUrl: 'https://generativelanguage.googleapis.com/v1',
      enabled: true,
      validationRules: {
        minLength: 39,
        maxLength: 39,
        requiredPrefix: 'AIza',
      },
    },
    anthropic: {
      name: 'anthropic',
      displayName: 'Anthropic Claude',
      apiKeyPattern: /^sk-ant-[a-zA-Z0-9]{32,}$/,
      baseUrl: 'https://api.anthropic.com/v1',
      enabled: true,
      validationRules: {
        minLength: 40,
        maxLength: 100,
        requiredPrefix: 'sk-ant-',
      },
    },
  },
  
  frameworks: {
    roses: {
      id: 'roses',
      name: 'R.O.S.E.S Framework',
      description: 'Role, Objective, Steps, Expected Solution, Scenario',
      components: ['role', 'objective', 'steps', 'expected_solution', 'scenario'],
      enabled: true,
    },
    ape: {
      id: 'ape',
      name: 'A.P.E Framework',
      description: 'Action, Purpose, Expectation',
      components: ['action', 'purpose', 'expectation'],
      enabled: true,
    },
    tag: {
      id: 'tag',
      name: 'T.A.G Framework',
      description: 'Task, Action, Goal',
      components: ['task', 'action', 'goal'],
      enabled: true,
    },
    era: {
      id: 'era',
      name: 'E.R.A Framework',
      description: 'Expectation, Role, Action',
      components: ['expectation', 'role', 'action'],
      enabled: true,
    },
    race: {
      id: 'race',
      name: 'R.A.C.E Framework',
      description: 'Role, Action, Context, Expectation',
      components: ['role', 'action', 'context', 'expectation'],
      enabled: true,
    },
    rise: {
      id: 'rise',
      name: 'R.I.S.E Framework',
      description: 'Request, Input, Scenario, Expectation',
      components: ['request', 'input', 'scenario', 'expectation'],
      enabled: true,
    },
    care: {
      id: 'care',
      name: 'C.A.R.E Framework',
      description: 'Context, Action, Result, Example',
      components: ['context', 'action', 'result', 'example'],
      enabled: true,
    },
    coast: {
      id: 'coast',
      name: 'C.O.A.S.T Framework',
      description: 'Context, Objective, Actions, Steps, Task',
      components: ['context', 'objective', 'actions', 'steps', 'task'],
      enabled: true,
    },
    trace: {
      id: 'trace',
      name: 'T.R.A.C.E Framework',
      description: 'Task, Role, Action, Context, Expectation',
      components: ['task', 'role', 'action', 'context', 'expectation'],
      enabled: true,
    },
  },
  
  ui: {
    theme: {
      default: 'light',
      available: ['light', 'dark', 'system'],
    },
    features: {
      history: true,
      feedback: true,
      analytics: false,
      export: true,
      import: false,
    },
  },
  
  security: {
    encryption: {
      algorithm: 'AES-256-GCM',
      keyLength: 32,
    },
    validation: {
      strictMode: true,
      timeout: 5000,
    },
  },
};

// Environment-based configuration loader
export const loadAppConfig = (): AppConfig => {
  const config = { ...defaultConfig };
  
  // Load from environment variables
  if (import.meta.env.VITE_APP_NAME) {
    config.app.name = import.meta.env.VITE_APP_NAME;
  }
  
  if (import.meta.env.VITE_APP_VERSION) {
    config.app.version = import.meta.env.VITE_APP_VERSION;
  }
  
  if (import.meta.env.VITE_APP_ENVIRONMENT) {
    config.app.environment = import.meta.env.VITE_APP_ENVIRONMENT as AppConfig['app']['environment'];
  }
  
  if (import.meta.env.VITE_APP_DEBUG) {
    config.app.debug = import.meta.env.VITE_APP_DEBUG === 'true';
  }
  
  // Load provider configurations
  const enabledProviders = import.meta.env.VITE_ENABLED_PROVIDERS?.split(',') || [];
  if (enabledProviders.length > 0) {
    Object.keys(config.providers).forEach(provider => {
      config.providers[provider].enabled = enabledProviders.includes(provider);
    });
  }
  
  // Load framework configurations
  const enabledFrameworks = import.meta.env.VITE_ENABLED_FRAMEWORKS?.split(',') || [];
  if (enabledFrameworks.length > 0) {
    Object.keys(config.frameworks).forEach(framework => {
      config.frameworks[framework].enabled = enabledFrameworks.includes(framework);
    });
  }
  
  // Load UI feature flags
  Object.keys(config.ui.features).forEach(feature => {
    const envKey = `VITE_FEATURE_${feature.toUpperCase()}`;
    if (import.meta.env[envKey] !== undefined) {
      config.ui.features[feature] = import.meta.env[envKey] === 'true';
    }
  });
  
  return config;
};

// Export the loaded configuration
export const appConfig = loadAppConfig();

// Helper functions
export const getEnabledProviders = () => {
  return Object.values(appConfig.providers).filter(provider => provider.enabled);
};

export const getEnabledFrameworks = () => {
  return Object.values(appConfig.frameworks).filter(framework => framework.enabled);
};

export const isFeatureEnabled = (feature: string): boolean => {
  return appConfig.ui.features[feature] ?? false;
};

export const getProviderConfig = (providerName: string) => {
  return appConfig.providers[providerName];
};

export const getFrameworkConfig = (frameworkId: string) => {
  return appConfig.frameworks[frameworkId];
};


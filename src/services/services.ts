/**
 * Centralized Services Index
 * 
 * This file provides a single entry point for all application services.
 * Import services from here to maintain clean imports and easy service management.
 * 
 * @author PromptCraft Forge Team
 * @version 1.0.0
 */

// ============================================================================
// CORE SERVICES
// ============================================================================

// API Configuration Service - Manages AI provider API keys
export { apiConfigService } from './lib/apiConfigService';
export type { ApiKeyData, ApiKeyValidation } from './lib/apiConfigService';

// API Key Validator - Validates API key formats
export { ApiKeyValidator } from './lib/apiKeyValidator';

// MCP Service - Master Control Prompt service for AI interactions
export { mcpService } from './lib/mcpService';
export type { MCPRequest, MCPResponse } from './lib/mcpService';

// ============================================================================
// USER MANAGEMENT SERVICES
// ============================================================================

// User Preferences Service - Manages user settings and preferences
export { userPreferencesService, frameworks } from './lib/userPreferencesService';
export type { 
  UserPreferences, 
  FrameworkInfo 
} from './lib/userPreferencesService';

// ============================================================================
// DATA SERVICES
// ============================================================================

// Prompt History Service - Tracks and manages prompt generation history
export { promptHistoryService } from './lib/promptHistoryService';
export type { 
  PromptHistoryEntry, 
  PromptHistoryStats,
  SavePromptHistoryParams,
  SavePromptHistoryInputParams,
  SavePromptHistoryInputResult
} from './lib/promptHistoryService';

// Feedback Service - Manages user feedback system
export { feedbackService } from './lib/feedbackService';
export type { 
  FeedbackData, 
  StoredFeedback 
} from './lib/feedbackService';

// ============================================================================
// COMMUNICATION SERVICES
// ============================================================================

// Email Service - Handles email communications via EmailJS
export { emailService } from './lib/emailService';
export type { FeedbackData as EmailFeedbackData } from './lib/emailService';

// ============================================================================
// CONFIGURATION SERVICES
// ============================================================================

// Master Prompt Configuration - Prompt templates and configurations
export { 
  getMasterPrompt, 
  buildMasterPrompt, 
  masterPrompts 
} from './lib/masterPromptConfig';
export type { 
  MasterPromptConfig, 
  ModelSpecificPrompt 
} from './lib/masterPromptConfig';

// Email Configuration - EmailJS configuration
export { emailConfig } from './lib/emailConfig';

// ============================================================================
// UTILITY SERVICES
// ============================================================================

// Utility functions
export { cn } from './lib/utils';

// ============================================================================
// SERVICE CATEGORIES FOR EASY ACCESS
// ============================================================================

/**
 * Core Services - Essential application services
 */
export const coreServices = {
  apiConfig: () => import('./lib/apiConfigService').then(m => m.apiConfigService),
  apiValidator: () => import('./lib/apiKeyValidator').then(m => m.ApiKeyValidator),
  mcp: () => import('./lib/mcpService').then(m => m.mcpService),
} as const;

/**
 * User Services - User-related functionality
 */
export const userServices = {
  preferences: () => import('./lib/userPreferencesService').then(m => m.userPreferencesService),
  history: () => import('./lib/promptHistoryService').then(m => m.promptHistoryService),
  feedback: () => import('./lib/feedbackService').then(m => m.feedbackService),
} as const;

/**
 * Communication Services - External communication
 */
export const communicationServices = {
  email: () => import('./lib/emailService').then(m => m.emailService),
} as const;

/**
 * Configuration Services - App configuration
 */
export const configServices = {
  masterPrompt: () => import('./lib/masterPromptConfig').then(m => m),
  email: () => import('./lib/emailConfig').then(m => m.emailConfig),
} as const;

// ============================================================================
// SERVICE INITIALIZATION
// ============================================================================

/**
 * Initialize all services
 * Call this function during app startup to ensure all services are ready
 */
export const initializeServices = async (): Promise<void> => {
  try {
    console.log('🚀 Initializing services...');
    
    // Initialize core services
    await Promise.all([
      // Add any async initialization logic here
      // For example: await apiConfigService.initialize(),
    ]);
    
    console.log('✅ All services initialized successfully');
  } catch (error) {
    console.error('❌ Service initialization failed:', error);
    throw error;
  }
};

/**
 * Get service health status
 * Returns the health status of all services
 */
export const getServicesHealth = async (): Promise<{
  [key: string]: { status: 'healthy' | 'unhealthy'; error?: string };
}> => {
  const health: { [key: string]: { status: 'healthy' | 'unhealthy'; error?: string } } = {};
  
  try {
    // Import services dynamically to avoid circular dependencies
    const { apiConfigService } = await import('./lib/apiConfigService');
    const { emailService } = await import('./lib/emailService');
    
    // Test API Config Service
    try {
      await apiConfigService.testDatabaseConnection();
      health.apiConfig = { status: 'healthy' };
    } catch (error) {
      health.apiConfig = { 
        status: 'unhealthy', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
    
    // Test Email Service
    health.email = { 
      status: emailService.isConfigured() ? 'healthy' : 'unhealthy',
      error: emailService.isConfigured() ? undefined : 'EmailJS not configured'
    };
    
    // Add more service health checks as needed
    
  } catch (error) {
    console.error('Error checking service health:', error);
  }
  
  return health;
};

// ============================================================================
// SERVICE REGISTRY
// ============================================================================

/**
 * Service Registry - Central registry of all available services
 * Useful for dynamic service loading and dependency injection
 */
export const serviceRegistry = {
  // Core Services
  'apiConfig': () => import('./lib/apiConfigService').then(m => m.apiConfigService),
  'apiValidator': () => import('./lib/apiKeyValidator').then(m => m.ApiKeyValidator),
  'mcp': () => import('./lib/mcpService').then(m => m.mcpService),
  
  // User Services
  'userPreferences': () => import('./lib/userPreferencesService').then(m => m.userPreferencesService),
  'promptHistory': () => import('./lib/promptHistoryService').then(m => m.promptHistoryService),
  'feedback': () => import('./lib/feedbackService').then(m => m.feedbackService),
  
  // Communication Services
  'email': () => import('./lib/emailService').then(m => m.emailService),
  
  // Configuration Services
  'masterPrompt': () => import('./lib/masterPromptConfig').then(m => m),
  'emailConfig': () => import('./lib/emailConfig').then(m => m.emailConfig),
} as const;

/**
 * Get service by name
 * @param serviceName - Name of the service to retrieve
 * @returns The requested service instance
 */
export const getService = async <T extends keyof typeof serviceRegistry>(
  serviceName: T
) => {
  const service = serviceRegistry[serviceName];
  if (!service) {
    throw new Error(`Service '${serviceName}' not found in registry`);
  }
  return await service();
};

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

/**
 * Default export containing all services
 * Use this for destructuring imports: import services from '@/services/services'
 */
export default {
  // Service Management
  initialize: initializeServices,
  getHealth: getServicesHealth,
  getService,
  
  // Service Categories
  coreServices,
  userServices,
  communicationServices,
  configServices,
  serviceRegistry,
} as const;
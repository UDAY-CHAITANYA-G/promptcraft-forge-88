/**
 * Dynamic API Configuration Service
 * 
 * This service provides dynamic API configuration management using the new configuration system.
 * It replaces hardcoded values with configurable settings.
 */

import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { appConfig, envConfig, getProviderConfig } from '@/config';
import { createEncryptionService } from './encryptionService';

type ApiConfiguration = Database['public']['Tables']['api_configurations']['Row'];
type ApiConfigurationInsert = Database['public']['Tables']['api_configurations']['Insert'];
type ApiConfigurationUpdate = Database['public']['Tables']['api_configurations']['Update'];

export interface ApiKeyData {
  [key: string]: string | undefined;
}

export interface ApiKeyValidation {
  [key: string]: boolean | undefined;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  provider?: string;
}

class DynamicApiConfigService {
  private encryptionService = createEncryptionService();

  // Get API configurations for the current user
  async getUserApiConfigs(): Promise<ApiKeyData> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('api_configurations')
        .select('provider, api_key_encrypted, is_active')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (error) {
        console.error('Error fetching API configs:', error);
        throw error;
      }

      const configs: ApiKeyData = {};
      data?.forEach(config => {
        if (config.is_active) {
          const decryptedKey = this.encryptionService.decrypt(config.api_key_encrypted);
          if (decryptedKey) {
            configs[config.provider] = decryptedKey;
          }
        }
      });

      return configs;
    } catch (error) {
      console.error('Error in getUserApiConfigs:', error);
      return {};
    }
  }

  // Save or update API configuration for the current user
  async saveApiConfig(provider: string, apiKey: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Validate provider exists in configuration
      const providerConfig = getProviderConfig(provider);
      if (!providerConfig) {
        throw new Error(`Provider ${provider} is not configured`);
      }

      if (!providerConfig.enabled) {
        throw new Error(`Provider ${provider} is disabled`);
      }

      const encryptedKey = this.encryptionService.encrypt(apiKey);
      
      // Check if config already exists
      const { data: existingConfig, error: checkError } = await supabase
        .from('api_configurations')
        .select('id')
        .eq('user_id', user.id)
        .eq('provider', provider as 'openai' | 'gemini' | 'anthropic')
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking existing config:', checkError);
        throw checkError;
      }

      if (existingConfig) {
        // Update existing config
        const { error } = await supabase
          .from('api_configurations')
          .update({
            api_key_encrypted: encryptedKey,
            is_active: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingConfig.id);

        if (error) {
          console.error('Error updating API config:', error);
          return false;
        }
      } else {
        // Insert new config
        const { error } = await supabase
          .from('api_configurations')
          .insert({
            user_id: user.id,
            provider: provider as 'openai' | 'gemini' | 'anthropic',
            api_key_encrypted: encryptedKey,
            is_active: true
          });

        if (error) {
          console.error('Error inserting API config:', error);
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Error in saveApiConfig:', error);
      return false;
    }
  }

  // Delete API configuration for the current user
  async deleteApiConfig(provider: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('api_configurations')
        .update({ is_active: false })
        .eq('user_id', user.id)
        .eq('provider', provider as 'openai' | 'gemini' | 'anthropic');

      if (error) {
        console.error('Error deleting API config:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteApiConfig:', error);
      return false;
    }
  }

  // Validate API key format using dynamic configuration
  validateApiKeyFormat(provider: string, apiKey: string): boolean {
    if (!apiKey.trim()) return false;
    
    const providerConfig = getProviderConfig(provider);
    if (!providerConfig) {
      return false;
    }

    return providerConfig.apiKeyPattern.test(apiKey);
  }

  // Get detailed validation information for an API key
  getApiKeyValidationDetails(provider: string, apiKey: string): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: []
    };

    if (!apiKey.trim()) {
      result.isValid = false;
      result.errors.push('API key cannot be empty');
      return result;
    }

    const providerConfig = getProviderConfig(provider);
    if (!providerConfig) {
      result.isValid = false;
      result.errors.push(`Provider ${provider} is not configured`);
      return result;
    }

    if (!providerConfig.enabled) {
      result.isValid = false;
      result.errors.push(`Provider ${provider} is disabled`);
      return result;
    }

    const trimmedKey = apiKey.trim();
    const rules = providerConfig.validationRules;

    // Check required prefix
    if (rules.requiredPrefix && !trimmedKey.startsWith(rules.requiredPrefix)) {
      result.isValid = false;
      result.errors.push(`${providerConfig.displayName} API key must start with "${rules.requiredPrefix}"`);
    }

    // Check length constraints
    if (rules.minLength && trimmedKey.length < rules.minLength) {
      result.isValid = false;
      result.errors.push(`API key must be at least ${rules.minLength} characters long`);
    }

    if (rules.maxLength && trimmedKey.length > rules.maxLength) {
      result.isValid = false;
      result.errors.push(`API key must be no more than ${rules.maxLength} characters long`);
    }

    // Check pattern
    if (!providerConfig.apiKeyPattern.test(trimmedKey)) {
      result.isValid = false;
      result.errors.push(`API key format is invalid for ${providerConfig.displayName}`);
    }

    // Custom validation
    if (rules.customValidator && !rules.customValidator(trimmedKey)) {
      result.isValid = false;
      result.errors.push(`API key failed custom validation for ${providerConfig.displayName}`);
    }

    // Add warnings for specific providers
    if (provider === 'openai' && trimmedKey.startsWith('sk-proj-')) {
      result.warnings.push('This appears to be a project-level API key');
    }

    result.provider = provider;
    return result;
  }

  // Test API key by making a simple request (optional)
  async testApiKey(provider: string, apiKey: string): Promise<boolean> {
    // This is a placeholder for actual API testing
    // In production, you might want to make a real API call to validate the key
    return this.validateApiKeyFormat(provider, apiKey);
  }

  // Get all API configurations for the current user
  async getAllUserConfigs(): Promise<ApiConfiguration[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('api_configurations')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (error) {
        console.error('Error fetching all API configs:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getAllUserConfigs:', error);
      return [];
    }
  }

  // Test database connection and table existence
  async testDatabaseConnection(): Promise<{ connected: boolean; tableExists: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { connected: false, tableExists: false, error: 'User not authenticated' };
      }

      const { data, error } = await supabase
        .from('api_configurations')
        .select('id')
        .limit(1);

      if (error) {
        if (error.code === '42P01') {
          return { connected: true, tableExists: false, error: 'Table api_configurations does not exist' };
        }
        return { connected: true, tableExists: false, error: error.message };
      }

      return { connected: true, tableExists: true };
    } catch (error) {
      return { 
        connected: false, 
        tableExists: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Get available providers
  getAvailableProviders() {
    return Object.values(appConfig.providers).filter(provider => provider.enabled);
  }

  // Get provider display name
  getProviderDisplayName(provider: string): string {
    const providerConfig = getProviderConfig(provider);
    return providerConfig?.displayName || provider;
  }
}

export const dynamicApiConfigService = new DynamicApiConfigService();

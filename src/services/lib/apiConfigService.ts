import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type ApiConfiguration = Database['public']['Tables']['api_configurations']['Row'];
type ApiConfigurationInsert = Database['public']['Tables']['api_configurations']['Insert'];
type ApiConfigurationUpdate = Database['public']['Tables']['api_configurations']['Update'];

export interface ApiKeyData {
  openai?: string;
  gemini?: string;
  anthropic?: string;
}

export interface ApiKeyValidation {
  openai?: boolean;
  gemini?: boolean;
  anthropic?: boolean;
}

class ApiConfigService {
  // Simple encryption key (in production, use environment variables)
  private readonly ENCRYPTION_KEY = 'promptforge-secure-key-2024';

  // Simple encryption/decryption (in production, use proper encryption libraries)
  private encrypt(text: string): string {
    // This is a simple base64 encoding for demo purposes
    // In production, use proper encryption like AES-256
    return btoa(text);
  }

  private decrypt(encryptedText: string): string {
    // This is a simple base64 decoding for demo purposes
    // In production, use proper decryption
    try {
      return atob(encryptedText);
    } catch {
      return '';
    }
  }

  // Get API configurations for the current user
  async getUserApiConfigs(): Promise<ApiKeyData> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Fetching API configs for user

      const { data, error } = await supabase
        .from('api_configurations')
        .select('provider, api_key_encrypted, is_active')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (error) {
        console.error('Error fetching API configs:', error);
        throw error;
      }

      // Configs fetched successfully

      const configs: ApiKeyData = {};
      data?.forEach(config => {
        if (config.is_active) {
          const decryptedKey = this.decrypt(config.api_key_encrypted);
          if (decryptedKey) {
            configs[config.provider as keyof ApiKeyData] = decryptedKey;
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
  async saveApiConfig(provider: keyof ApiKeyData, apiKey: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Saving API key for user

      const encryptedKey = this.encrypt(apiKey);
      
      // Check if config already exists
      const { data: existingConfig, error: checkError } = await supabase
        .from('api_configurations')
        .select('id')
        .eq('user_id', user.id)
        .eq('provider', provider)
        .single();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        console.error('Error checking existing config:', checkError);
        throw checkError;
      }

      if (existingConfig) {
        // Updating existing config
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
        // Inserting new config for provider
        // Insert new config
        const { error } = await supabase
          .from('api_configurations')
          .insert({
            user_id: user.id,
            provider,
            api_key_encrypted: encryptedKey,
            is_active: true
          });

        if (error) {
          console.error('Error inserting API config:', error);
          console.error('Error details:', {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint
          });
          return false;
        }
      }

      // API key saved successfully
      return true;
    } catch (error) {
      console.error('Error in saveApiConfig:', error);
      return false;
    }
  }

  // Delete API configuration for the current user
  async deleteApiConfig(provider: keyof ApiKeyData): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('api_configurations')
        .update({ is_active: false })
        .eq('user_id', user.id)
        .eq('provider', provider);

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

  // Validate API key format
  validateApiKeyFormat(provider: keyof ApiKeyData, apiKey: string): boolean {
    if (!apiKey.trim()) return false;
    
    const keyPatterns = {
      openai: /^sk-(proj-)?[a-zA-Z0-9_-]{32,}$/,
      gemini: /^AIza[a-zA-Z0-9_-]{35}$/,
      anthropic: /^sk-ant-[a-zA-Z0-9]{32,}$/
    };
    
    return keyPatterns[provider].test(apiKey);
  }

  // Test API key by making a simple request (optional)
  async testApiKey(provider: keyof ApiKeyData, apiKey: string): Promise<boolean> {
    // This is a placeholder for actual API testing
    // In production, you might want to make a real API call to validate the key
    return this.validateApiKeyFormat(provider, apiKey);
  }

  // Get detailed validation information for an API key
  getApiKeyValidationDetails(provider: keyof ApiKeyData, apiKey: string): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const result = {
      isValid: true,
      errors: [] as string[],
      warnings: [] as string[]
    };

    if (!apiKey.trim()) {
      result.isValid = false;
      result.errors.push('API key cannot be empty');
      return result;
    }

    const trimmedKey = apiKey.trim();
    
    switch (provider) {
      case 'openai': {
        // Check if it starts with sk-
        if (!trimmedKey.startsWith('sk-')) {
          result.isValid = false;
          result.errors.push('OpenAI API key must start with "sk-"');
        }
        
        // Check if it's a project key (sk-proj-)
        if (trimmedKey.startsWith('sk-proj-')) {
          result.warnings.push('This appears to be a project-level API key');
        }
        
        // Check length (minimum 32 chars after sk-)
        const keyPart = trimmedKey.replace(/^sk-(proj-)?/, '');
        if (keyPart.length < 32) {
          result.isValid = false;
          result.errors.push('API key part must be at least 32 characters long');
        }
        
        // Check for valid characters
        if (!/^[a-zA-Z0-9_-]+$/.test(keyPart)) {
          result.isValid = false;
          result.errors.push('API key contains invalid characters (only letters, numbers, hyphens, and underscores allowed)');
        }
        break;
      }

      case 'gemini':
        if (!trimmedKey.startsWith('AIza')) {
          result.isValid = false;
          result.errors.push('Gemini API key must start with "AIza"');
        }
        if (trimmedKey.length !== 39) {
          result.isValid = false;
          result.errors.push('Gemini API key must be exactly 39 characters long');
        }
        break;

      case 'anthropic': {
        if (!trimmedKey.startsWith('sk-ant-')) {
          result.isValid = false;
          result.errors.push('Anthropic API key must start with "sk-ant-"');
        }
        const antKeyPart = trimmedKey.replace(/^sk-ant-/, '');
        if (antKeyPart.length < 32) {
          result.isValid = false;
          result.errors.push('Anthropic API key part must be at least 32 characters long');
        }
        break;
      }
    }

    return result;
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
      // Test basic connection
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { connected: false, tableExists: false, error: 'User not authenticated' };
      }

      // Test if table exists by trying to select from it
      const { data, error } = await supabase
        .from('api_configurations')
        .select('id')
        .limit(1);

      if (error) {
        if (error.code === '42P01') { // Table doesn't exist
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
}

export const apiConfigService = new ApiConfigService();

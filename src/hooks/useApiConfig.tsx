import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { apiConfigService, type ApiKeyData } from '@/lib/apiConfigService';
import { useToast } from './use-toast';

export function useApiConfig() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [configs, setConfigs] = useState<ApiKeyData>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load user's API configurations
  const loadConfigs = useCallback(async () => {
    if (!user) {
      setConfigs({});
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const userConfigs = await apiConfigService.getUserApiConfigs();
      setConfigs(userConfigs);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load API configurations';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  // Save API configuration
  const saveConfig = useCallback(async (provider: keyof ApiKeyData, apiKey: string) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to save API configurations",
        variant: "destructive",
      });
      return false;
    }

    try {
      const success = await apiConfigService.saveApiConfig(provider, apiKey);
      if (success) {
        // Reload configs to get the updated state
        await loadConfigs();
        toast({
          title: "Success",
          description: `${provider} API key saved successfully`,
        });
        return true;
      } else {
        toast({
          title: "Error",
          description: `Failed to save ${provider} API key`,
          variant: "destructive",
        });
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save API configuration';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    }
  }, [user, loadConfigs, toast]);

  // Remove API configuration
  const removeConfig = useCallback(async (provider: keyof ApiKeyData) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to remove API configurations",
        variant: "destructive",
      });
      return false;
    }

    try {
      const success = await apiConfigService.deleteApiConfig(provider);
      if (success) {
        // Reload configs to get the updated state
        await loadConfigs();
        toast({
          title: "Success",
          description: `${provider} API key removed successfully`,
        });
        return true;
      } else {
        toast({
          title: "Error",
          description: `Failed to remove ${provider} API key`,
          variant: "destructive",
        });
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove API configuration';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    }
  }, [user, loadConfigs, toast]);

  // Check if user has any API keys configured
  const hasAnyConfig = useCallback(() => {
    return Object.values(configs).some(key => key);
  }, [configs]);

  // Check if a specific provider is configured
  const hasConfig = useCallback((provider: keyof ApiKeyData) => {
    return !!configs[provider];
  }, [configs]);

  // Validate API key format
  const validateKey = useCallback((provider: keyof ApiKeyData, apiKey: string) => {
    return apiConfigService.validateApiKeyFormat(provider, apiKey);
  }, []);

  // Load configs when user changes
  useEffect(() => {
    loadConfigs();
  }, [loadConfigs]);

  return {
    configs,
    loading,
    error,
    hasAnyConfig: hasAnyConfig(),
    hasConfig,
    validateKey,
    saveConfig,
    removeConfig,
    loadConfigs,
    refresh: loadConfigs,
  };
}

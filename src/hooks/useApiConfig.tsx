import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './useAuth';
import { apiConfigService, type ApiKeyData, ApiKeyValidator } from '@/services/services';
import { useToast } from './use-toast';

interface ApiConfigState {
  configs: ApiKeyData;
  loading: boolean;
  error: string | null;
  lastUpdated: number | null;
}

export function useApiConfig() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [state, setState] = useState<ApiConfigState>({
    configs: {},
    loading: true,
    error: null,
    lastUpdated: null,
  });
  const abortControllerRef = useRef<AbortController | null>(null);
  const cacheTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load user's API configurations with caching and abort support
  const loadConfigs = useCallback(async (forceRefresh = false) => {
    if (!user) {
      setState(prev => ({
        ...prev,
        configs: {},
        loading: false,
        error: null,
      }));
      return;
    }

    // Check cache validity (5 minutes)
    const now = Date.now();
    const cacheValid = state.lastUpdated && (now - state.lastUpdated) < 5 * 60 * 1000;
    
    if (!forceRefresh && cacheValid && state.configs && Object.keys(state.configs).length > 0) {
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    try {
      setState(prev => ({
        ...prev,
        loading: true,
        error: null,
      }));

      const userConfigs = await apiConfigService.getUserApiConfigs();
      
      // Check if request was aborted
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }

      setState(prev => ({
        ...prev,
        configs: userConfigs,
        loading: false,
        lastUpdated: now,
        error: null,
      }));

      // Clear any existing cache timeout
      if (cacheTimeoutRef.current) {
        clearTimeout(cacheTimeoutRef.current);
      }

      // Set cache invalidation timeout
      cacheTimeoutRef.current = setTimeout(() => {
        setState(prev => ({
          ...prev,
          lastUpdated: null,
        }));
      }, 5 * 60 * 1000); // 5 minutes

    } catch (err) {
      // Don't update state if request was aborted
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }

      const errorMessage = err instanceof Error ? err.message : 'Failed to load API configurations';
      setState(prev => ({
        ...prev,
        error: errorMessage,
        loading: false,
      }));

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [user, toast, state.lastUpdated, state.configs]);

  // Save API configuration with validation
  const saveConfig = useCallback(async (provider: keyof ApiKeyData, apiKey: string) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to save API configurations",
        variant: "destructive",
      });
      return false;
    }

    // Validate API key format before saving
    const isValid = ApiKeyValidator.validateApiKey(provider, apiKey);
    if (!isValid.isValid) {
      toast({
        title: "Invalid API Key",
        description: `The ${provider} API key format is invalid. ${isValid.errors.join(', ')}`,
        variant: "destructive",
      });
      return false;
    }

    // Show warnings if any
    if (isValid.warnings.length > 0) {
      toast({
        title: "API Key Warning",
        description: `The ${provider} API key has warnings: ${isValid.warnings.join(', ')}`,
        variant: "default",
      });
    }

    try {
      setState(prev => ({ ...prev, loading: true }));
      
      const success = await apiConfigService.saveApiConfig(provider, apiKey);
      if (success) {
        // Force refresh to get the updated state
        await loadConfigs(true);
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
    } finally {
      setState(prev => ({ ...prev, loading: false }));
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
      setState(prev => ({ ...prev, loading: true }));
      
      const success = await apiConfigService.deleteApiConfig(provider);
      if (success) {
        // Force refresh to get the updated state
        await loadConfigs(true);
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
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [user, loadConfigs, toast]);

  // Check if user has any API keys configured
  const hasAnyConfig = useCallback(() => {
    return Object.values(state.configs).some(key => key);
  }, [state.configs]);

  // Check if a specific provider is configured
  const hasConfig = useCallback((provider: keyof ApiKeyData) => {
    return !!state.configs[provider];
  }, [state.configs]);

  // Validate API key format with detailed feedback
  const validateKey = useCallback((provider: keyof ApiKeyData, apiKey: string) => {
    return ApiKeyValidator.validateApiKey(provider, apiKey);
  }, []);

  // Test API key connection
  const testConnection = useCallback(async (provider: keyof ApiKeyData) => {
    if (!state.configs[provider]) {
      toast({
        title: "Error",
        description: `No ${provider} API key configured`,
        variant: "destructive",
      });
      return false;
    }

    try {
      setState(prev => ({ ...prev, loading: true }));
      
      const isValid = await apiConfigService.testApiKey(provider, state.configs[provider]!);
      
      if (isValid) {
        toast({
          title: "Connection Successful",
          description: `${provider} API key is working correctly`,
        });
        return true;
      } else {
        toast({
          title: "Connection Failed",
          description: `${provider} API key is invalid or expired`,
          variant: "destructive",
        });
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to test API key connection';
      toast({
        title: "Connection Error",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [state.configs, toast]);

  // Clear cache and force refresh
  const refresh = useCallback(() => {
    setState(prev => ({
      ...prev,
      lastUpdated: null,
    }));
    return loadConfigs(true);
  }, [loadConfigs]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (cacheTimeoutRef.current) {
        clearTimeout(cacheTimeoutRef.current);
      }
    };
  }, []);

  // Load configs when user changes
  useEffect(() => {
    loadConfigs();
  }, [loadConfigs]);

  return {
    configs: state.configs,
    loading: state.loading,
    error: state.error,
    lastUpdated: state.lastUpdated,
    hasAnyConfig: hasAnyConfig(),
    hasConfig,
    validateKey,
    testConnection,
    saveConfig,
    removeConfig,
    loadConfigs,
    refresh,
  };
}

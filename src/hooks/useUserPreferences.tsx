import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { userPreferencesService, frameworks, type UserPreferences, type FrameworkInfo } from '@/services/services';
import { useToast } from './use-toast';

interface UserPreferencesState {
  preferences: UserPreferences | null;
  loading: boolean;
  error: string | null;
  lastUpdated: number | null;
}

export function useUserPreferences() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [state, setState] = useState<UserPreferencesState>({
    preferences: null,
    loading: true,
    error: null,
    lastUpdated: null,
  });

  // Load user preferences
  const loadPreferences = useCallback(async (forceRefresh = false) => {
    if (!user) {
      setState(prev => ({
        ...prev,
        preferences: null,
        loading: false,
        error: null,
      }));
      return;
    }

    // Check cache validity (10 minutes)
    const now = Date.now();
    const cacheValid = state.lastUpdated && (now - state.lastUpdated) < 10 * 60 * 1000;
    
    if (!forceRefresh && cacheValid && state.preferences) {
      return;
    }

    try {
      setState(prev => ({
        ...prev,
        loading: true,
        error: null,
      }));

      const preferences = await userPreferencesService.getUserPreferences();
      
      setState(prev => ({
        ...prev,
        preferences,
        loading: false,
        lastUpdated: now,
        error: null,
      }));

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load user preferences';
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
  }, [user, toast, state.lastUpdated, state.preferences]);

  // Save user preferences
  const savePreferences = useCallback(async (preferences: Partial<UserPreferences>) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to save preferences",
        variant: "destructive",
      });
      return false;
    }

    try {
      setState(prev => ({ ...prev, loading: true }));
      
      const success = await userPreferencesService.saveUserPreferences(preferences);
      if (success) {
        // Force refresh to get the updated state
        await loadPreferences(true);
        toast({
          title: "Success",
          description: "Preferences saved successfully",
        });
        return true;
      } else {
        toast({
          title: "Error",
          description: "Failed to save preferences",
          variant: "destructive",
        });
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save preferences';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [user, loadPreferences, toast]);

  // Update specific preference
  const updatePreference = useCallback(async <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => {
    return savePreferences({ [key]: value } as Partial<UserPreferences>);
  }, [savePreferences]);

  // Get available frameworks
  const getAvailableFrameworks = useCallback((): FrameworkInfo[] => {
    return frameworks;
  }, []);

  // Get framework by ID
  const getFramework = useCallback((frameworkId: string): FrameworkInfo | undefined => {
    return frameworks.find(f => f.id === frameworkId);
  }, []);

  // Check if a framework is available
  const isFrameworkAvailable = useCallback((frameworkId: string): boolean => {
    return frameworks.some(f => f.id === frameworkId);
  }, []);

  // Get current selected model
  const getSelectedModel = useCallback((): string | null => {
    return state.preferences?.selected_model || null;
  }, [state.preferences]);

  // Get current selected framework
  const getSelectedFramework = useCallback((): string | null => {
    return state.preferences?.selected_framework || null;
  }, [state.preferences]);

  // Clear cache and force refresh
  const refresh = useCallback(() => {
    setState(prev => ({
      ...prev,
      lastUpdated: null,
    }));
    return loadPreferences(true);
  }, [loadPreferences]);

  // Load preferences when user changes
  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  return {
    preferences: state.preferences,
    loading: state.loading,
    error: state.error,
    lastUpdated: state.lastUpdated,
    savePreferences,
    updatePreference,
    loadPreferences,
    refresh,
    getAvailableFrameworks,
    getFramework,
    isFrameworkAvailable,
    getSelectedModel,
    getSelectedFramework,
  };
}

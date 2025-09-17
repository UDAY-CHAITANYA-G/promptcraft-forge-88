import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { 
  promptHistoryService, 
  type PromptHistoryEntry, 
  type PromptHistoryStats,
  type SavePromptHistoryParams 
} from '@/services/services';
import { useToast } from './use-toast';

interface PromptHistoryState {
  entries: PromptHistoryEntry[];
  stats: PromptHistoryStats | null;
  loading: boolean;
  error: string | null;
  lastUpdated: number | null;
}

export function usePromptHistory() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [state, setState] = useState<PromptHistoryState>({
    entries: [],
    stats: null,
    loading: true,
    error: null,
    lastUpdated: null,
  });

  // Load prompt history
  const loadHistory = useCallback(async (forceRefresh = false) => {
    if (!user) {
      setState(prev => ({
        ...prev,
        entries: [],
        stats: null,
        loading: false,
        error: null,
      }));
      return;
    }

    // Check cache validity (5 minutes)
    const now = Date.now();
    const cacheValid = state.lastUpdated && (now - state.lastUpdated) < 5 * 60 * 1000;
    
    if (!forceRefresh && cacheValid && state.entries.length > 0) {
      return;
    }

    try {
      setState(prev => ({
        ...prev,
        loading: true,
        error: null,
      }));

      const [entries, stats] = await Promise.all([
        promptHistoryService.getUserPromptHistory(),
        promptHistoryService.getPromptHistoryStats()
      ]);
      
      setState(prev => ({
        ...prev,
        entries,
        stats,
        loading: false,
        lastUpdated: now,
        error: null,
      }));

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load prompt history';
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
  }, [user, toast, state.lastUpdated, state.entries.length]);

  // Save prompt history entry
  const savePromptHistory = useCallback(async (params: SavePromptHistoryParams) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to save prompt history",
        variant: "destructive",
      });
      return false;
    }

    try {
      const success = await promptHistoryService.savePromptHistory(params);
      if (success) {
        // Force refresh to get the updated state
        await loadHistory(true);
        return true;
      } else {
        toast({
          title: "Error",
          description: "Failed to save prompt history",
          variant: "destructive",
        });
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save prompt history';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    }
  }, [user, loadHistory, toast]);

  // Delete prompt history entry
  const deletePromptHistory = useCallback(async (entryId: string) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to delete prompt history",
        variant: "destructive",
      });
      return false;
    }

    try {
      const success = await promptHistoryService.deletePromptHistory(entryId);
      if (success) {
        // Force refresh to get the updated state
        await loadHistory(true);
        toast({
          title: "Success",
          description: "Prompt history entry deleted successfully",
        });
        return true;
      } else {
        toast({
          title: "Error",
          description: "Failed to delete prompt history entry",
          variant: "destructive",
        });
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete prompt history entry';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    }
  }, [user, loadHistory, toast]);

  // Clear all prompt history
  const clearAllHistory = useCallback(async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to clear prompt history",
        variant: "destructive",
      });
      return false;
    }

    try {
      const success = await promptHistoryService.clearAllPromptHistory();
      if (success) {
        setState(prev => ({
          ...prev,
          entries: [],
          stats: null,
          lastUpdated: null,
        }));
        toast({
          title: "Success",
          description: "All prompt history cleared successfully",
        });
        return true;
      } else {
        toast({
          title: "Error",
          description: "Failed to clear prompt history",
          variant: "destructive",
        });
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to clear prompt history';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    }
  }, [user, toast]);

  // Get entries by framework
  const getEntriesByFramework = useCallback((frameworkId: string): PromptHistoryEntry[] => {
    return state.entries.filter(entry => entry.framework_id === frameworkId);
  }, [state.entries]);

  // Get entries by model
  const getEntriesByModel = useCallback((model: string): PromptHistoryEntry[] => {
    return state.entries.filter(entry => entry.model === model);
  }, [state.entries]);

  // Get recent entries
  const getRecentEntries = useCallback((limit: number = 10): PromptHistoryEntry[] => {
    return state.entries
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit);
  }, [state.entries]);

  // Search entries
  const searchEntries = useCallback((query: string): PromptHistoryEntry[] => {
    const lowercaseQuery = query.toLowerCase();
    return state.entries.filter(entry => 
      entry.task_description.toLowerCase().includes(lowercaseQuery) ||
      entry.generated_prompt.toLowerCase().includes(lowercaseQuery) ||
      entry.framework_id.toLowerCase().includes(lowercaseQuery) ||
      entry.model.toLowerCase().includes(lowercaseQuery)
    );
  }, [state.entries]);

  // Clear cache and force refresh
  const refresh = useCallback(() => {
    setState(prev => ({
      ...prev,
      lastUpdated: null,
    }));
    return loadHistory(true);
  }, [loadHistory]);

  // Load history when user changes
  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  return {
    entries: state.entries,
    stats: state.stats,
    loading: state.loading,
    error: state.error,
    lastUpdated: state.lastUpdated,
    savePromptHistory,
    deletePromptHistory,
    clearAllHistory,
    loadHistory,
    refresh,
    getEntriesByFramework,
    getEntriesByModel,
    getRecentEntries,
    searchEntries,
  };
}

import { useState, useCallback, useRef } from 'react';
import { mcpService, MCPRequest, MCPResponse } from '@/services/services';
import { useToast } from './use-toast';

interface MCPState {
  isGenerating: boolean;
  lastResponse: MCPResponse | null;
  generationHistory: MCPResponse[];
  error: string | null;
}

export const useMCP = () => {
  const [state, setState] = useState<MCPState>({
    isGenerating: false,
    lastResponse: null,
    generationHistory: [],
    error: null,
  });
  const { toast } = useToast();
  const abortControllerRef = useRef<AbortController | null>(null);

  const generatePrompt = useCallback(async (request: MCPRequest): Promise<MCPResponse> => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    setState(prev => ({
      ...prev,
      isGenerating: true,
      lastResponse: null,
      error: null,
    }));
    
    try {
      const response = await mcpService.generatePrompt(request);
      
      // Check if request was aborted
      if (abortControllerRef.current?.signal.aborted) {
        return response;
      }

      setState(prev => ({
        ...prev,
        isGenerating: false,
        lastResponse: response,
        generationHistory: [response, ...prev.generationHistory.slice(0, 9)], // Keep last 10
        error: null,
      }));
      
      if (response.success) {
        toast({
          title: "Success!",
          description: `Prompt generated using ${response.model?.toUpperCase()} and ${response.framework?.toUpperCase()} framework`,
        });
      } else {
        toast({
          title: "Generation Failed",
          description: response.error || "Failed to generate prompt",
          variant: "destructive",
        });
      }
      
      return response;
    } catch (error) {
      // Don't update state if request was aborted
      if (abortControllerRef.current?.signal.aborted) {
        return {
          success: false,
          error: 'Request was cancelled'
        };
      }

      const errorResponse: MCPResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
      
      setState(prev => ({
        ...prev,
        isGenerating: false,
        lastResponse: errorResponse,
        error: errorResponse.error || null,
      }));

      toast({
        title: "Error",
        description: "An unexpected error occurred while generating the prompt",
        variant: "destructive",
      });
      
      return errorResponse;
    }
  }, [toast]);

  const validateModelConnection = useCallback(async (provider: 'openai' | 'gemini' | 'anthropic'): Promise<boolean> => {
    try {
      return await mcpService.validateModelConnection(provider);
    } catch (error) {
      console.error(`Model connection validation failed for ${provider}:`, error);
      return false;
    }
  }, []);

  const clearResponse = useCallback(() => {
    setState(prev => ({
      ...prev,
      lastResponse: null,
      error: null,
    }));
  }, []);

  const clearHistory = useCallback(() => {
    setState(prev => ({
      ...prev,
      generationHistory: [],
    }));
  }, []);

  const cancelGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setState(prev => ({
      ...prev,
      isGenerating: false,
    }));
  }, []);

  const getSupportedModels = useCallback(() => {
    return mcpService.getSupportedModels();
  }, []);

  const getGeminiModelRecommendations = useCallback(() => {
    return mcpService.getGeminiModelRecommendations();
  }, []);

  // Cleanup on unmount
  const cleanup = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  return {
    isGenerating: state.isGenerating,
    lastResponse: state.lastResponse,
    generationHistory: state.generationHistory,
    error: state.error,
    generatePrompt,
    validateModelConnection,
    clearResponse,
    clearHistory,
    cancelGeneration,
    getSupportedModels,
    getGeminiModelRecommendations,
    cleanup,
  };
};

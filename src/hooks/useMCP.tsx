import { useState, useCallback } from 'react';
import { mcpService, MCPRequest, MCPResponse } from '@/lib/mcpService';
import { useToast } from './use-toast';

export const useMCP = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastResponse, setLastResponse] = useState<MCPResponse | null>(null);
  const { toast } = useToast();

  const generatePrompt = useCallback(async (request: MCPRequest): Promise<MCPResponse> => {
    setIsGenerating(true);
    setLastResponse(null);
    
    try {
      const response = await mcpService.generatePrompt(request);
      setLastResponse(response);
      
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
      const errorResponse: MCPResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
      
      setLastResponse(errorResponse);
      toast({
        title: "Error",
        description: "An unexpected error occurred while generating the prompt",
        variant: "destructive",
      });
      
      return errorResponse;
    } finally {
      setIsGenerating(false);
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
    setLastResponse(null);
  }, []);

  return {
    isGenerating,
    lastResponse,
    generatePrompt,
    validateModelConnection,
    clearResponse
  };
};

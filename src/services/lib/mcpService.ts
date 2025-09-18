import { getMasterPrompt, MasterPromptConfig, buildMasterPrompt } from './masterPromptConfig';
import { userPreferencesService } from './userPreferencesService';
import { apiConfigService } from './apiConfigService';

export interface MCPRequest {
  frameworkId: string;
  taskDescription: string;
  tone?: string;
  length?: string;
  vibeCoding?: boolean;
}

export interface MCPResponse {
  success: boolean;
  prompt?: string;
  error?: string;
  model?: string;
  framework?: string;
}

export interface ModelConfig {
  provider: 'openai' | 'gemini' | 'anthropic';
  apiKey: string;
  baseUrl?: string;
}

class MCPService {
  private async getActiveModelConfig(): Promise<ModelConfig | null> {
    try {
      const preferences = await userPreferencesService.getUserPreferences();
      if (!preferences?.selected_model) {
        return null;
      }

      const apiConfigs = await apiConfigService.getUserApiConfigs();
      const apiKey = apiConfigs[preferences.selected_model];
      
      if (!apiKey) {
        return null;
      }

      return {
        provider: preferences.selected_model,
        apiKey
      };
    } catch (error) {
      console.error('Error getting active model config:', error);
      return null;
    }
  }

  private async callOpenAI(config: ModelConfig, prompt: string): Promise<string> {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'You are an expert prompt engineer. You MUST respond with ONLY the generated_prompt value as plain text, NOT wrapped in JSON. Extract the generated_prompt from your response and return it directly.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content || 'Failed to generate prompt';
      
      // Try to parse JSON response
      try {
        const jsonResponse = JSON.parse(content);
        // If we still get JSON, extract generated_prompt
        if (jsonResponse.generated_prompt) {
          return jsonResponse.generated_prompt;
        } else if (jsonResponse.prompt) {
          // Fallback to 'prompt' key if 'generated_prompt' is not found
          return jsonResponse.prompt;
        } else {
          // If no expected key found, return the content as is
          console.log('No generated_prompt or prompt key found in JSON response:', jsonResponse);
          return content;
        }
      } catch {
        // If not JSON, return the content as is (this is what we want now)
        return content;
      }
    } catch (error) {
      console.error('OpenAI API call failed:', error);
      throw error;
    }
  }

  private async callGemini(config: ModelConfig, prompt: string): Promise<string> {
    // List of Gemini models to try in order of preference
    const geminiModels = [
      'gemini-1.5-pro',
      'gemini-1.5-flash',
      'gemini-pro'
    ];

    for (const model of geminiModels) {
      try {
        console.log(`Trying Gemini model: ${model}`);
        
        // Try v1 API first, then fallback to v1beta for older models
        const apiVersions = ['v1', 'v1beta'];
        
        for (const version of apiVersions) {
          try {
            const response = await fetch(`https://generativelanguage.googleapis.com/${version}/models/${model}:generateContent?key=${config.apiKey}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                contents: [
                  {
                    parts: [
                      {
                        text: `You are an expert prompt engineer. You MUST respond with ONLY the generated_prompt value as plain text, NOT wrapped in JSON. Extract the generated_prompt from your response and return it directly.

${prompt}`
                      }
                    ]
                  }
                ],
                generationConfig: {
                  temperature: 0.7,
                  maxOutputTokens: 1000,
                  topP: 0.8,
                  topK: 40
                }
              })
            });

            if (!response.ok) {
              const errorData = await response.json().catch(() => ({}));
              console.log(`Gemini API ${version}/${model} failed: ${response.status} - ${errorData.error?.message || ''}`);
              continue; // Try next API version
            }

            const data = await response.json();
            const content = data.candidates[0]?.content?.parts[0]?.text || 'Failed to generate prompt';
            
            console.log(`Successfully used Gemini model: ${model} with API version: ${version}`);
            console.log('Raw AI response:', content);
            
            // Try to parse JSON response
            try {
              const jsonResponse = JSON.parse(content);
              console.log('Parsed JSON response:', jsonResponse);
              
              // If we still get JSON, extract generated_prompt
              if (jsonResponse.generated_prompt) {
                console.log('Extracted generated_prompt from JSON:', jsonResponse.generated_prompt);
                return jsonResponse.generated_prompt;
              } else if (jsonResponse.prompt) {
                // Fallback to 'prompt' key if 'generated_prompt' is not found
                console.log('Extracted prompt (fallback):', jsonResponse.prompt);
                return jsonResponse.prompt;
              } else {
                // If no expected key found, return the content as is
                console.log('No generated_prompt or prompt key found in JSON response:', jsonResponse);
                return content;
              }
            } catch (parseError) {
              console.log('Response is plain text, using as is');
              // If not JSON, return the content as is (this is what we want now)
              return content;
            }
          } catch (versionError) {
            console.log(`API version ${version} failed for model ${model}:`, versionError);
            continue; // Try next API version
          }
        }
      } catch (modelError) {
        console.log(`Model ${model} failed:`, modelError);
        continue; // Try next model
      }
    }

    // If all models fail, throw a comprehensive error
    throw new Error(`All Gemini models failed. Please check your API key and try again.`);
  }

  private async callAnthropic(config: ModelConfig, prompt: string): Promise<string> {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-sonnet-20240229',
          max_tokens: 1000,
          messages: [
            {
              role: 'user',
              content: `You are an expert prompt engineer. You MUST respond with ONLY the generated_prompt value as plain text, NOT wrapped in JSON. Extract the generated_prompt from your response and return it directly.

${prompt}`
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`Anthropic API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.content[0]?.text || 'Failed to generate prompt';
      
      // Try to parse JSON response
      try {
        const jsonResponse = JSON.parse(content);
        // If we still get JSON, extract generated_prompt
        if (jsonResponse.generated_prompt) {
          return jsonResponse.generated_prompt;
        } else if (jsonResponse.prompt) {
          // Fallback to 'prompt' key if 'generated_prompt' is not found
          return jsonResponse.prompt;
        } else {
          // If no expected key found, return the content as is
          console.log('No generated_prompt or prompt key found in JSON response:', jsonResponse);
          return content;
        }
      } catch {
        // If not JSON, return the content as is (this is what we want now)
        return content;
      }
    } catch (error) {
      console.error('Anthropic API call failed:', error);
      throw error;
    }
  }

  private buildPromptRequest(request: MCPRequest): string {
    const prompt = buildMasterPrompt(
      request.frameworkId,
      request.taskDescription,
      request.vibeCoding ? undefined : request.tone,
      request.vibeCoding ? undefined : request.length
    );
    
    // Debug logging
    console.log('=== MCP Master Prompt Generated ===');
    console.log('Framework ID:', request.frameworkId);
    console.log('Task Description:', request.taskDescription);
    console.log('Tone:', request.tone);
    console.log('Length:', request.length);
    console.log('Vibe Coding:', request.vibeCoding);
    console.log('Generated Prompt:', prompt);
    console.log('===================================');
    
    return prompt;
  }

  async generatePrompt(request: MCPRequest): Promise<MCPResponse> {
    try {
      const modelConfig = await this.getActiveModelConfig();
      if (!modelConfig) {
        return {
          success: false,
          error: 'No active model configuration found. Please configure an API key first.'
        };
      }

      const promptRequest = this.buildPromptRequest(request);
      let generatedPrompt: string;

      switch (modelConfig.provider) {
        case 'openai':
          generatedPrompt = await this.callOpenAI(modelConfig, promptRequest);
          break;
        case 'gemini':
          generatedPrompt = await this.callGemini(modelConfig, promptRequest);
          break;
        case 'anthropic':
          generatedPrompt = await this.callAnthropic(modelConfig, promptRequest);
          break;
        default:
          throw new Error(`Unsupported model: ${modelConfig.provider}`);
      }

      return {
        success: true,
        prompt: generatedPrompt,
        model: modelConfig.provider,
        framework: request.frameworkId
      };

    } catch (error) {
      console.error('MCP service error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async validateModelConnection(provider: 'openai' | 'gemini' | 'anthropic'): Promise<boolean> {
    try {
      const apiConfigs = await apiConfigService.getUserApiConfigs();
      const apiKey = apiConfigs[provider];
      
      if (!apiKey) {
        return false;
      }

      // For Gemini, test with a simple API call first
      if (provider === 'gemini') {
        return await this.testGeminiConnection(apiKey);
      }

      const testRequest: MCPRequest = {
        frameworkId: 'roses',
        taskDescription: 'Test connection',
        vibeCoding: true
      };

      const response = await this.generatePrompt(testRequest);
      return response.success;
    } catch (error) {
      console.error(`Model connection validation failed for ${provider}:`, error);
      return false;
    }
  }

  private async testGeminiConnection(apiKey: string): Promise<boolean> {
    try {
      // Test with a simple API call to check connectivity
      const response = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`);
      
      if (!response.ok) {
        console.log(`Gemini API test failed: ${response.status} ${response.statusText}`);
        return false;
      }

      const data = await response.json();
      interface ModelData {
        name: string;
      }
      const availableModels = data.data?.map((model: ModelData) => model.name) || [];
      
      console.log('Available Gemini models:', availableModels);
      
      // Check if any of our preferred models are available
      const preferredModels = ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-pro'];
      const hasPreferredModel = preferredModels.some(model => 
        availableModels.some((available: string) => available.includes(model))
      );

      if (!hasPreferredModel) {
        console.log('No preferred Gemini models found. Available models:', availableModels);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Gemini connection test failed:', error);
      return false;
    }
  }

  getSupportedModels(): string[] {
    return ['openai', 'gemini', 'anthropic'];
  }

  async getAvailableGeminiModels(apiKey: string): Promise<string[]> {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch models: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      interface ModelData {
        name: string;
      }
      return data.data?.map((model: ModelData) => model.name) || [];
    } catch (error) {
      console.error('Failed to get available Gemini models:', error);
      return [];
    }
  }

  getGeminiModelRecommendations(): string[] {
    return [
      'gemini-1.5-pro (Recommended - Latest model)',
      'gemini-1.5-flash (Fast and efficient)',
      'gemini-pro (Legacy model)'
    ];
  }
}

export const mcpService = new MCPService();
export default mcpService;

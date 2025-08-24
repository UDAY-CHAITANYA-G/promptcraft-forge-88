import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, Key, Bot, Loader2, Database } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useApiConfig } from '@/hooks/useApiConfig';
import { useToast } from '@/hooks/use-toast';
import { apiConfigService } from '@/lib/apiConfigService';
import { LeftSidebar } from '@/components/LeftSidebar';

interface ApiConfig {
  openai: string;
  gemini: string;
  anthropic: string;
}

const ApiConfig = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { configs, loading, hasAnyConfig, saveConfig, removeConfig, validateKey } = useApiConfig();
  
  const [apiKeys, setApiKeys] = useState<ApiConfig>({
    openai: '',
    gemini: '',
    anthropic: ''
  });
  const [isValidating, setIsValidating] = useState(false);
  const [validationResults, setValidationResults] = useState<Partial<ApiConfig>>({});
  const [errors, setErrors] = useState<string[]>([]);
  const [dbStatus, setDbStatus] = useState<{ connected: boolean; tableExists: boolean; error?: string } | null>(null);

  useEffect(() => {
    // Check if user is authenticated
    if (!user) {
      navigate('/auth');
      return;
    }

    // Test database connection
    testDatabaseConnection();

    // Pre-fill form with existing configs
    setApiKeys(prev => ({
      ...prev,
      ...configs
    }));
  }, [user, navigate, configs]);

  const testDatabaseConnection = async () => {
    try {
      const status = await apiConfigService.testDatabaseConnection();
      setDbStatus(status);
      
      if (!status.connected || !status.tableExists) {
        toast({
          title: "Database Issue",
          description: status.error || "Unable to connect to database",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error testing database connection:', error);
      setDbStatus({ connected: false, tableExists: false, error: 'Connection test failed' });
    }
  };

  const handleApiKeyChange = (model: keyof ApiConfig, value: string) => {
    setApiKeys(prev => ({ ...prev, [model]: value }));
    // Clear validation result when user changes the key
    setValidationResults(prev => ({ ...prev, [model]: undefined }));
  };

  const validateApiKey = async (model: keyof ApiConfig, apiKey: string): Promise<boolean> => {
    if (!apiKey.trim()) return false;
    
    // Use the hook to validate the key format
    return validateKey(model, apiKey);
  };

  const validateAllKeys = async () => {
    setIsValidating(true);
    setErrors([]);
    const results: Partial<ApiConfig> = {};
    
    for (const [model, key] of Object.entries(apiKeys)) {
      if (key.trim()) {
        const isValid = await validateApiKey(model as keyof ApiConfig, key);
        results[model as keyof ApiConfig] = isValid ? key : undefined;
        if (!isValid) {
          setErrors(prev => [...prev, `Invalid ${model} API key format`]);
        }
      }
    }
    
    setValidationResults(results);
    setIsValidating(false);
    
    // If at least one key is valid, save them to the database
    if (Object.values(results).some(key => key)) {
      await saveValidKeys(results);
    }
  };

  const saveValidKeys = async (validKeys: Partial<ApiConfig>) => {
    try {
      const savePromises = Object.entries(validKeys).map(async ([model, key]) => {
        if (key) {
          return await saveConfig(model as keyof ApiConfig, key);
        }
        return false;
      });

      const results = await Promise.all(savePromises);
      const successCount = results.filter(Boolean).length;

      if (successCount > 0) {
        toast({
          title: "Success!",
          description: `${successCount} API key(s) saved successfully`,
        });
      }
    } catch (error) {
      console.error('Error saving API keys:', error);
      toast({
        title: "Error",
        description: "Failed to save some API keys",
        variant: "destructive",
      });
    }
  };

  const removeApiKey = async (model: keyof ApiConfig) => {
    try {
      const success = await removeConfig(model);
      if (success) {
        // Clear from local state
        setApiKeys(prev => ({ ...prev, [model]: '' }));
        setValidationResults(prev => ({ ...prev, [model]: undefined }));
        
        toast({
          title: "Removed",
          description: `${model} API key removed successfully`,
        });
      }
    } catch (error) {
      console.error('Error removing API key:', error);
      toast({
        title: "Error",
        description: "Failed to remove API key",
        variant: "destructive",
      });
    }
  };

  const canProceed = Object.values(validationResults).some(key => key) && errors.length === 0;

  const getModelInfo = (model: keyof ApiConfig) => {
    const modelInfo = {
      openai: { name: 'ChatGPT', description: 'OpenAI GPT models (GPT-4, GPT-3.5)', icon: Bot },
      gemini: { name: 'Gemini', description: 'Google Gemini models (Flash, Pro)', icon: Bot },
      anthropic: { name: 'Claude', description: 'Anthropic Claude models', icon: Bot }
    };
    return modelInfo[model];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-6 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading your API configurations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-6">
      <LeftSidebar />
      <div className="max-w-4xl mx-auto">
        {/* Database Status Alert */}
        {dbStatus && (!dbStatus.connected || !dbStatus.tableExists) && (
          <Alert className="border-red-500 bg-red-50 mb-6">
            <Database className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>Database Issue:</strong> {dbStatus.error || 'Unable to connect to database'}
              <br />
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={testDatabaseConnection}
              >
                Retry Connection
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gradient mb-4">
            Configure Your AI Models
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Add your API keys to unlock the power of multiple AI models. Your keys are stored securely and encrypted.
          </p>
        </div>

        <div className="grid gap-6 mb-8">
          {Object.entries(apiKeys).map(([model, key]) => {
            const info = getModelInfo(model as keyof ApiConfig);
            const Icon = info.icon;
            const isValid = validationResults[model as keyof ApiConfig];
            const hasError = errors.some(error => error.includes(model));
            const isSaved = configs[model as keyof ApiConfig];
            
            return (
              <Card key={model} className={`transition-all duration-200 ${
                isValid ? 'ring-2 ring-green-500/20 bg-green-50/50' : 
                hasError ? 'ring-2 ring-red-500/20 bg-red-50/50' : 
                isSaved ? 'ring-2 ring-blue-500/20 bg-blue-50/50' : ''
              }`}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Icon className="w-6 h-6 text-primary" />
                    {info.name}
                    {isSaved && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        Saved
                      </span>
                    )}
                  </CardTitle>
                  <CardDescription>{info.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor={model} className="flex items-center gap-2">
                        <Key className="w-4 h-4" />
                        API Key
                      </Label>
                      <Input
                        id={model}
                        type="password"
                        placeholder={`Enter your ${info.name} API key`}
                        value={key}
                        onChange={(e) => handleApiKeyChange(model as keyof ApiConfig, e.target.value)}
                        className={isValid ? 'border-green-500' : hasError ? 'border-red-500' : ''}
                      />
                    </div>
                    
                    {isValid && (
                      <Alert className="border-green-500 bg-green-50">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800">
                          Valid API key format
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    {hasError && (
                      <Alert className="border-red-500 bg-red-50">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-800">
                          Invalid API key format
                        </AlertDescription>
                      </Alert>
                    )}

                    {isSaved && (
                      <div className="flex gap-2">
                        <Button
                          onClick={() => removeApiKey(model as keyof ApiConfig)}
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          Remove Key
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {errors.length > 0 && (
          <Alert className="border-red-500 bg-red-50 mb-6">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              Please fix the following errors: {errors.join(', ')}
            </AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={validateAllKeys}
            disabled={isValidating || Object.values(apiKeys).every(key => !key.trim()) || !dbStatus?.tableExists}
            size="lg"
            className="flex-1 sm:flex-none"
          >
            {isValidating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Validating & Saving...
              </>
            ) : (
              'Validate & Save API Keys'
            )}
          </Button>
          
          {canProceed && (
            <Button
              onClick={() => navigate('/prompt-generator')}
              variant="hero"
              size="lg"
              className="flex-1 sm:flex-none"
            >
              Continue to Prompt Generator
            </Button>
          )}
        </div>

        <div className="text-center mt-8 text-sm text-muted-foreground">
          <p>Don't have API keys? Get them from:</p>
          <div className="flex flex-wrap justify-center gap-4 mt-2">
            <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              OpenAI Platform
            </a>
            <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              Google AI Studio
            </a>
            <a href="https://console.anthropic.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              Anthropic Console
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiConfig;

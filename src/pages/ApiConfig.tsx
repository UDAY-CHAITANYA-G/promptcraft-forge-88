import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, Key, Bot, Loader2, Database, Sparkles, Shield, Zap, Globe, Building2, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useApiConfig } from '@/hooks/useApiConfig';
import { useToast } from '@/hooks/use-toast';
import { apiConfigService } from '@/services/services';
import { LeftSidebar } from '@/components/LeftSidebar';
import { Navbar } from '@/components/Navbar';

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
  const [originalApiKeys, setOriginalApiKeys] = useState<ApiConfig>({
    openai: '',
    gemini: '',
    anthropic: ''
  });
  const [isValidating, setIsValidating] = useState(false);
  const [validationResults, setValidationResults] = useState<Partial<ApiConfig>>({});
  const [errors, setErrors] = useState<string[]>([]);
  const [dbStatus, setDbStatus] = useState<{ connected: boolean; tableExists: boolean; error?: string } | null>(null);

  const testDatabaseConnection = useCallback(async () => {
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
  }, [toast]);

  useEffect(() => {
    // Check if user is authenticated
    if (!user) {
      navigate('/auth');
      return;
    }

    // Test database connection
    testDatabaseConnection();

    // Pre-fill form with existing configs
    const initialConfigs: ApiConfig = {
      openai: configs.openai || '',
      gemini: configs.gemini || '',
      anthropic: configs.anthropic || ''
    };
    setApiKeys(initialConfigs);
    setOriginalApiKeys(initialConfigs);
  }, [user, navigate, configs, testDatabaseConnection]);

  // Check if any changes have been made
  const hasChanges = () => {
    return Object.keys(apiKeys).some(key => {
      const modelKey = key as keyof ApiConfig;
      return apiKeys[modelKey] !== originalApiKeys[modelKey];
    });
  };

  // Check if user has any verified API keys
  const hasVerifiedApis = () => {
    return Object.values(configs).some(key => key && key.trim() !== '');
  };

  // Check if current form has any valid API keys
  const hasValidFormKeys = () => {
    return Object.values(apiKeys).some(key => key && key.trim() !== '');
  };

  // Check if validation button should be enabled
  const canValidate = () => {
    return hasChanges() && hasValidFormKeys() && !isValidating && dbStatus?.tableExists;
  };

  // Check if user can proceed to prompt generator
  const canProceed = hasVerifiedApis() && errors.length === 0;

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
        // Update originalApiKeys to reflect the saved state
        setOriginalApiKeys(prev => {
          const updatedOriginalKeys = { ...prev };
          Object.entries(validKeys).forEach(([key, value]) => {
            if (value !== undefined) {
              updatedOriginalKeys[key as keyof ApiConfig] = value;
            }
          });
          return updatedOriginalKeys;
        });
        
        // Clear validation results after successful save
        setValidationResults({});
        
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

  const getModelInfo = (model: keyof ApiConfig) => {
    const modelInfo = {
      openai: { 
        name: 'ChatGPT', 
        description: 'OpenAI GPT models (GPT-4, GPT-3.5)', 
        icon: Bot,
        color: 'from-emerald-500 to-teal-500',
        bgColor: 'bg-emerald-500/10',
        borderColor: 'border-emerald-500/20',
        ringColor: 'ring-emerald-500/30'
      },
      gemini: { 
        name: 'Gemini', 
        description: 'Google Gemini models (Flash, Pro)', 
        icon: Sparkles,
        color: 'from-blue-500 to-indigo-500',
        bgColor: 'bg-blue-500/10',
        borderColor: 'border-blue-500/20',
        ringColor: 'ring-blue-500/30'
      },
      anthropic: { 
        name: 'Claude', 
        description: 'Anthropic Claude models', 
        icon: Zap,
        color: 'from-purple-500 to-pink-500',
        bgColor: 'bg-purple-500/10',
        borderColor: 'border-purple-500/20',
        ringColor: 'ring-purple-500/30'
      }
    };
    return modelInfo[model];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-full animate-pulse-glow mx-auto"></div>
            <Loader2 className="w-8 h-8 animate-spin absolute inset-0 m-auto text-primary-foreground" />
          </div>
          <div className="space-y-2">
            <p className="text-xl font-semibold text-foreground">Loading your AI configurations...</p>
            <p className="text-muted-foreground">Preparing your personalized AI experience</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <Navbar />
      <div className="pt-20">
        <LeftSidebar showNavigation={false} />
        
        {/* Main Content */}
        <div className="ml-64 p-6">
          <div className="max-w-6xl mx-auto space-y-6">
            
            {/* Database Status Alert */}
            {dbStatus && (!dbStatus.connected || !dbStatus.tableExists) && (
              <div className="animate-in slide-in-from-top-4 duration-500">
                <Alert className="border-red-500/50 bg-red-500/5 backdrop-blur-sm">
                  <Database className="h-4 w-4 text-red-500" />
                  <AlertDescription className="text-red-600 text-sm">
                    <span className="font-semibold">Database Connection Issue:</span> {dbStatus.error || 'Unable to connect to database'}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="ml-2 mt-1 border-red-500/30 text-red-600 hover:bg-red-500/10 text-xs h-6 px-2"
                      onClick={testDatabaseConnection}
                    >
                      Retry Connection
                    </Button>
                  </AlertDescription>
                </Alert>
              </div>
            )}

            {/* Hero Section */}
            <div className="text-center space-y-4 animate-in slide-in-from-top-4 duration-700">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 blur-2xl rounded-full"></div>
                <div className="relative">
                  <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                    Configure Your AI Models
                  </h1>
                </div>
              </div>
              
              {/* Company Branding with Home Icon */}
              <div className="flex items-center justify-center gap-2 text-base text-muted-foreground">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 hover:bg-muted/50 rounded-full"
                  onClick={() => navigate('/')}
                  title="Go to Home"
                >
                  <Home className="h-4 w-4" />
                </Button>
                <Building2 className="w-4 h-4" />
                <span className="font-medium">ZeroXTech | Chaitanya</span>
              </div>
              
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Unlock the power of multiple AI models by adding your API keys. 
                Your keys are stored securely and encrypted for your privacy.
              </p>
              <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground">
                <Shield className="w-4 h-4" />
                <span>Enterprise-grade security</span>
                <span>•</span>
                <Globe className="w-4 h-4" />
                <span>Multiple AI providers</span>
              </div>
            </div>

            {/* API Key Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {Object.entries(apiKeys).map(([model, key], index) => {
                const info = getModelInfo(model as keyof ApiConfig);
                const Icon = info.icon;
                const isValid = validationResults[model as keyof ApiConfig];
                const hasError = errors.some(error => error.includes(model));
                const isSaved = configs[model as keyof ApiConfig];
                
                return (
                  <div 
                    key={model} 
                    className="animate-in slide-in-from-left-4 duration-500"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <Card className={`
                      group relative overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:shadow-lg h-full
                      ${isValid ? `ring-2 ${info.ringColor} bg-gradient-to-r ${info.bgColor} to-transparent` : 
                      hasError ? 'ring-2 ring-red-500/30 bg-red-500/5' : 
                      isSaved ? `ring-2 ${info.ringColor} bg-gradient-to-r ${info.bgColor} to-transparent` : 
                      'hover:ring-2 hover:ring-primary/20 hover:bg-card-hover/50'
                      }
                      border-0 shadow-md hover:shadow-xl
                    `}>
                      {/* Background Pattern */}
                      <div className="absolute inset-0 opacity-5">
                        <div className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-br ${info.color} rounded-full blur-xl`}></div>
                        <div className={`absolute bottom-0 left-0 w-12 h-12 bg-gradient-to-tl ${info.color} rounded-full blur-lg opacity-20`}></div>
                      </div>
                      
                      <CardHeader className="relative pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`
                              p-2 rounded-lg bg-gradient-to-r ${info.color} shadow-lg
                              group-hover:scale-110 transition-transform duration-300
                            `}>
                              <Icon className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                                {info.name}
                                {isSaved && (
                                  <span className="text-xs bg-green-500/20 text-green-600 px-2 py-1 rounded-full font-medium border border-green-500/30">
                                    ✓ Saved
                                  </span>
                                )}
                              </CardTitle>
                              <CardDescription className="text-muted-foreground text-sm mt-1">
                                {info.description}
                              </CardDescription>
                            </div>
                          </div>
                          
                          {/* Status Indicator */}
                          <div className="flex items-center gap-1">
                            {isValid && (
                              <div className="flex items-center gap-1 text-green-600 bg-green-500/10 px-2 py-1 rounded-full border border-green-500/20 animate-in scale-in duration-300">
                                <CheckCircle className="w-3 h-3" />
                                <span className="text-xs font-medium">Valid</span>
                              </div>
                            )}
                            {hasError && (
                              <div className="flex items-center gap-1 text-red-600 bg-red-500/10 px-2 py-1 rounded-full border border-red-500/20 animate-in scale-in duration-300">
                                <AlertCircle className="w-3 h-3" />
                                <span className="text-xs font-medium">Invalid</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="relative space-y-3">
                        <div className="space-y-2">
                          <Label htmlFor={model} className="flex items-center gap-2 text-sm font-medium text-foreground">
                            <Key className="w-4 h-4 text-primary" />
                            API Key
                          </Label>
                          <div className="relative">
                            <Input
                              id={model}
                              type="password"
                              placeholder={`Enter your ${info.name} API key`}
                              value={key}
                              onChange={(e) => handleApiKeyChange(model as keyof ApiConfig, e.target.value)}
                              className={`
                                h-9 text-sm border-2 transition-all duration-300
                                ${isValid ? `border-green-500/50 bg-green-500/5 focus:border-green-500 focus:ring-green-500/20` : 
                                hasError ? 'border-red-500/50 bg-red-500/5 focus:border-red-500 focus:ring-red-500/20' : 
                                key !== originalApiKeys[model as keyof ApiConfig] ? 'border-orange-500/50 bg-orange-500/5 focus:border-orange-500 focus:ring-orange-500/20' :
                                `border-border/50 hover:border-primary/30 focus:border-primary focus:ring-primary/20`
                                }
                                focus:ring-2 focus:ring-offset-0
                              `}
                            />
                            {key && (
                              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                {isValid ? (
                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                ) : hasError ? (
                                  <AlertCircle className="w-4 h-4 text-red-500" />
                                ) : key !== originalApiKeys[model as keyof ApiConfig] ? (
                                  <div className="w-4 h-4 bg-orange-500 rounded-full animate-pulse"></div>
                                ) : (
                                  <div className="w-4 h-4 border-2 border-muted-foreground/30 rounded-full"></div>
                                )}
                              </div>
                            )}
                          </div>
                          
                          {/* Change Indicator */}
                          {key !== originalApiKeys[model as keyof ApiConfig] && (
                            <div className="flex items-center gap-1 text-xs text-orange-600">
                              <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse"></div>
                              <span>Modified</span>
                            </div>
                          )}
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          {isSaved && (
                            <Button
                              onClick={() => removeApiKey(model as keyof ApiConfig)}
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-500/10 border-red-500/30 transition-all duration-300 text-sm h-8 px-3"
                            >
                              Remove Key
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                );
              })}
            </div>

            {/* Error Summary */}
            {errors.length > 0 && (
              <div className="animate-in slide-in-from-bottom-4 duration-500">
                <Alert className="border-red-500/50 bg-red-500/5 backdrop-blur-sm">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <AlertDescription className="text-red-600 text-sm">
                    <span className="font-semibold">Please fix the following errors:</span> {errors.join(', ')}
                  </AlertDescription>
                </Alert>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-in slide-in-from-bottom-4 duration-700">
              {/* Validate & Save Button - Only enabled when changes are detected */}
              <Button
                onClick={validateAllKeys}
                disabled={!canValidate()}
                size="lg"
                variant={hasChanges() ? "apiPrimary" : "outline"}
                className={`flex-1 sm:flex-none h-12 px-8 text-base font-medium transition-all duration-300 ${
                  hasChanges() 
                    ? 'hover:shadow-lg hover:scale-105' 
                    : 'opacity-60 cursor-not-allowed'
                }`}
              >
                {isValidating ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Validating & Saving...
                  </>
                ) : hasChanges() ? (
                  <>
                    <Key className="w-5 h-5 mr-2" />
                    Validate & Save Changes
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2 text-muted-foreground" />
                    No Changes to Save
                  </>
                )}
              </Button>
              
              {/* Continue to Prompt Generator Button - Only shown when APIs are verified */}
              {canProceed && (
                <Button
                  onClick={() => navigate('/prompt-generator')}
                  variant="apiSecondary"
                  size="lg"
                  className="flex-1 sm:flex-none h-12 px-8 text-base font-medium hover:shadow-lg hover:scale-105 transition-all duration-300"
                >
                  <Zap className="w-5 h-5 mr-2" />
                  Continue to Prompt Generator
                </Button>
              )}
            </div>

            {/* Change Detection Indicator */}
            {hasChanges() && (
              <div className="text-center animate-in slide-in-from-bottom-4 duration-500">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-sm text-primary">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                  <span className="font-medium">Changes detected</span>
                  <span className="text-primary/70">•</span>
                  <span className="text-primary/70">Click "Validate & Save Changes" to apply</span>
                </div>
              </div>
            )}

            {/* No Changes Indicator */}
            {!hasChanges() && hasVerifiedApis() && (
              <div className="text-center animate-in slide-in-from-bottom-4 duration-500">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full text-sm text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span className="font-medium">All APIs are up to date</span>
                  <span className="text-green-500/70">•</span>
                  <span className="text-green-500/70">Ready to generate prompts</span>
                </div>
              </div>
            )}

            {/* Help Section */}
            <div className="text-center space-y-4 animate-in slide-in-from-bottom-4 duration-700 pb-8">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground">Need API Keys?</h3>
                <p className="text-muted-foreground text-base">Get your API keys from these official platforms:</p>
              </div>
              <div className="flex flex-wrap justify-center gap-4">
                <a 
                  href="https://platform.openai.com/api-keys" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="group flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-lg hover:from-emerald-500/20 hover:to-teal-500/20 hover:border-emerald-500/30 transition-all duration-300 transform hover:scale-105 hover:shadow-md"
                >
                  <Bot className="w-4 h-4 text-emerald-500 group-hover:scale-110 transition-transform" />
                  <span className="font-medium text-foreground">OpenAI Platform</span>
                </a>
                <a 
                  href="https://makersuite.google.com/app/apikey" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="group flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20 rounded-lg hover:from-blue-500/20 hover:to-indigo-500/20 hover:border-blue-500/30 transition-all duration-300 transform hover:scale-105 hover:shadow-md"
                >
                  <Sparkles className="w-4 h-4 text-blue-500 group-hover:scale-110 transition-transform" />
                  <span className="font-medium text-foreground">Google AI Studio</span>
                </a>
                <a 
                  href="https://console.anthropic.com/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="group flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg hover:from-purple-500/20 hover:to-indigo-500/20 hover:border-purple-500/30 transition-all duration-300 transform hover:scale-105 hover:shadow-md"
                >
                  <Zap className="w-4 h-4 text-purple-500 group-hover:scale-110 transition-transform" />
                  <span className="font-medium text-foreground">Anthropic Console</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiConfig;

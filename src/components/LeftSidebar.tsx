import React, { useState, useEffect } from 'react';
import { Menu, X, Bot, Layers, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useApiConfig } from '@/hooks/useApiConfig';
import { userPreferencesService, frameworks, type UserPreferences } from '@/lib/userPreferencesService';
import { apiConfigService } from '@/lib/apiConfigService';

export const LeftSidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'model' | 'framework' | null>(null);
  const [showModelPopup, setShowModelPopup] = useState(false);
  const [showFrameworkPopup, setShowFrameworkPopup] = useState(false);
  const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const { user } = useAuth();
  const { hasAnyConfig } = useApiConfig();

  useEffect(() => {
    if (user && hasAnyConfig) {
      loadUserData();
    }
  }, [user, hasAnyConfig]);

  const loadUserData = async () => {
    try {
      // Load user preferences
      const preferences = await userPreferencesService.getUserPreferences();
      if (preferences) {
        setUserPreferences(preferences);
      } else {
        // Initialize preferences if none exist
        await userPreferencesService.initializePreferences();
        const newPrefs = await userPreferencesService.getUserPreferences();
        setUserPreferences(newPrefs);
      }

      // Load available models
      const configs = await apiConfigService.getAllUserConfigs();
      const models = configs.map(config => config.provider);
      setAvailableModels(models);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleModelSelect = async (model: 'openai' | 'gemini' | 'anthropic') => {
    try {
      await userPreferencesService.saveUserPreferences({ selected_model: model });
      setUserPreferences(prev => prev ? { ...prev, selected_model: model } : null);
      setShowModelPopup(false);
      setActiveTab(null); // Mark model tab as inactive
    } catch (error) {
      console.error('Error updating model preference:', error);
    }
  };

  const handleFrameworkSelect = async (framework: string) => {
    try {
      await userPreferencesService.saveUserPreferences({ selected_framework: framework as any });
      setUserPreferences(prev => prev ? { ...prev, selected_framework: framework as any } : null);
      setShowFrameworkPopup(false);
      setActiveTab(null); // Mark framework tab as inactive
    } catch (error) {
      console.error('Error updating framework preference:', error);
    }
  };

  const getModelDisplayName = (model: string) => {
    switch (model) {
      case 'openai': return 'OpenAI';
      case 'gemini': return 'Gemini';
      case 'anthropic': return 'Claude';
      default: return model;
    }
  };

  const getModelIcon = (model: string) => {
    switch (model) {
      case 'openai': return '🤖';
      case 'gemini': return '🌟';
      case 'anthropic': return '🧠';
      default: return '🤖';
    }
  };

  const handleTabClick = (tab: 'model' | 'framework') => {
    // If clicking the same tab, deactivate it
    if (activeTab === tab) {
      setActiveTab(null);
      setShowModelPopup(false);
      setShowFrameworkPopup(false);
    } else {
      // Activate the clicked tab
      setActiveTab(tab);
      if (tab === 'model') {
        setShowModelPopup(true);
        setShowFrameworkPopup(false);
      } else {
        setShowFrameworkPopup(true);
        setShowModelPopup(false);
      }
    }
  };

  const closeAllPopups = () => {
    setShowModelPopup(false);
    setShowFrameworkPopup(false);
    setIsOpen(false);
    setActiveTab(null);
  };

  if (!user || !hasAnyConfig) {
    return null;
  }

  return (
    <>
      {/* Hamburger Menu Button - Positioned next to Task Information box */}
      <Button
        variant="ghost"
        size="sm"
        className="absolute -left-12 top-0 bg-background/80 backdrop-blur-sm border border-border hover:bg-background rounded-lg shadow-lg"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Main Settings Popup */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={closeAllPopups}
          />
          
          {/* Main Settings Popup */}
          <div className="absolute left-0 top-12 z-50 w-80 bg-background border border-border rounded-lg shadow-2xl">
            <div className="p-4">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-foreground">Settings</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={closeAllPopups}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Tab Navigation */}
              <div className="flex space-x-1 mb-4 bg-muted p-1 rounded-lg">
                <Button
                  variant={activeTab === 'model' ? 'default' : 'ghost'}
                  size="sm"
                  className="flex-1 h-8 text-xs"
                  onClick={() => handleTabClick('model')}
                >
                  <Bot className="h-3 w-3 mr-1" />
                  Model
                </Button>
                <Button
                  variant={activeTab === 'framework' ? 'default' : 'ghost'}
                  size="sm"
                  className="flex-1 h-8 text-xs"
                  onClick={() => handleTabClick('framework')}
                >
                  <Layers className="h-3 w-3 mr-1" />
                  Framework
                </Button>
              </div>

              {/* Current Selection Summary */}
              {userPreferences && (
                <div className="mt-4 p-3 bg-muted/50 rounded-lg border border-border">
                  <h4 className="font-medium text-foreground mb-2 text-xs">Current Selection</h4>
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Model:</span>
                      <span className="font-medium">
                        {getModelIcon(userPreferences.selected_model)} {getModelDisplayName(userPreferences.selected_model)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Framework:</span>
                      <span className="font-medium">
                        {frameworks.find(f => f.id === userPreferences.selected_framework)?.name}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Models Popup */}
      {showModelPopup && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          />
          
          {/* Models Popup */}
          <div className="absolute left-96 top-12 z-50 w-80 bg-background border border-border rounded-lg shadow-2xl">
            <div className="p-4">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-foreground">Select AI Model</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowModelPopup(false)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <p className="text-sm text-muted-foreground mb-4">
                Choose your preferred AI model. Only models with configured API keys are available.
              </p>
              
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {availableModels.map((model) => (
                  <Card
                    key={model}
                    className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                      userPreferences?.selected_model === model
                        ? 'border-primary bg-primary/5 shadow-md'
                        : 'border-border hover:border-primary/50 hover:bg-muted/50'
                    }`}
                    onClick={() => handleModelSelect(model as any)}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{getModelIcon(model)}</span>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-foreground text-base">
                          {getModelDisplayName(model)}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {model === 'openai' ? 'GPT-4, GPT-3.5' : 
                           model === 'gemini' ? 'Gemini Pro' : 'Claude 3'}
                        </p>
                      </div>
                      {userPreferences?.selected_model === model && (
                        <Badge variant="default" className="bg-primary text-primary-foreground text-xs px-2 py-1">
                          Active
                        </Badge>
                      )}
                    </div>
                  </Card>
                ))}

                {availableModels.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Bot className="h-8 w-8 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">No API keys configured</p>
                    <p className="text-xs">Configure API keys in settings to select a model</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Frameworks Popup */}
      {showFrameworkPopup && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          />
          
          {/* Frameworks Popup */}
          <div className="absolute left-96 top-12 z-50 w-[65rem] bg-background border border-border rounded-lg shadow-2xl">
            <div className="p-4">
              {/* Header */}
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-base font-bold text-foreground">Select Framework</h2>
                                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFrameworkPopup(false)}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
              </div>
              
              <p className="text-xs text-muted-foreground mb-2">
                Choose your preferred prompt engineering framework. R.O.S.E.S is recommended for most use cases.
              </p>
              
              <div className="grid grid-cols-3 gap-2">
                {frameworks.map((framework) => (
                  <Card
                    key={framework.id}
                    className={`p-2 cursor-pointer transition-all hover:shadow-md ${
                      userPreferences?.selected_framework === framework.id
                        ? 'border-primary bg-primary/5 shadow-md'
                        : 'border-border hover:border-primary/50 hover:bg-muted/50'
                    }`}
                    onClick={() => handleFrameworkSelect(framework.id)}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-foreground text-sm">
                          {framework.name}
                        </h4>
                        {userPreferences?.selected_framework === framework.id && (
                          <ChevronRight className="h-4 w-4 text-primary flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground leading-tight">
                        {framework.description}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {framework.components.slice(0, 3).map((component, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="text-xs bg-muted/50 text-foreground border-border px-1 py-0.5"
                          >
                            {component}
                          </Badge>
                        ))}
                        {framework.components.length > 3 && (
                          <Badge variant="outline" className="text-xs px-1 py-0.5">
                            +{framework.components.length - 3}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground italic">
                        Best for: {framework.bestFor}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

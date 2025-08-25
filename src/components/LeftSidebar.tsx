import React, { useState, useEffect } from 'react';
import { Menu, X, Bot, Layers, ChevronRight, Code, History, Key, Building2, Home, Settings, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useApiConfig } from '@/hooks/useApiConfig';
import { userPreferencesService, frameworks, type UserPreferences } from '@/lib/userPreferencesService';
import { apiConfigService } from '@/lib/apiConfigService';
import { HistoryPopup } from './HistoryPopup';
import { useNavigate } from 'react-router-dom';

interface LeftSidebarProps {
  showNavigation?: boolean; // Controls whether to show navigation buttons
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({ showNavigation = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'model' | 'framework' | null>(null);
  const [showModelPopup, setShowModelPopup] = useState(false);
  const [showFrameworkPopup, setShowFrameworkPopup] = useState(false);
  const [showHistoryPopup, setShowHistoryPopup] = useState(false);
  const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const { user } = useAuth();
  const { hasAnyConfig } = useApiConfig();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && hasAnyConfig) {
      loadUserData();
    }
  }, [user, hasAnyConfig]);

  // Subscribe to preference changes for real-time updates
  useEffect(() => {
    if (user && hasAnyConfig) {
      const unsubscribe = userPreferencesService.subscribe((preferences) => {
        setUserPreferences(preferences);
      });

      return unsubscribe;
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
      await userPreferencesService.saveUserPreferences({ 
        selected_framework: framework as 'roses' | 'ape' | 'tag' | 'era' | 'race' | 'rise' | 'care' | 'coast' | 'trace' 
      });
      setUserPreferences(prev => prev ? { 
        ...prev, 
        selected_framework: framework as 'roses' | 'ape' | 'tag' | 'era' | 'race' | 'rise' | 'care' | 'coast' | 'trace' 
      } : null);
      setShowFrameworkPopup(false);
      setActiveTab(null); // Mark framework tab as inactive
    } catch (error) {
      console.error('Error updating framework preference:', error);
    }
  };

  const handleVibeCodingToggle = async (enabled: boolean) => {
    try {
      const success = await userPreferencesService.saveUserPreferences({
        vibe_coding: enabled
      });
      
      if (success) {
        setUserPreferences(prev => prev ? { ...prev, vibe_coding: enabled } : null);
      }
    } catch (error) {
      console.error('Error saving vibe coding preference:', error);
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
      {/* Inline Left Menu Navigation - Only show when showNavigation is true */}
      {showNavigation && (
        <div className="flex flex-col gap-3">
          {/* Home Navigation */}
          <Button
            variant="ghost"
            size="sm"
            className="group h-10 w-10 rounded-xl bg-background/90 backdrop-blur-xl border border-border/50 hover:bg-background hover:border-primary/50 hover:shadow-lg transition-all duration-300 shadow-md"
            onClick={() => navigate('/')}
            title="Go to Home"
          >
            <Home className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </Button>

          {/* Settings Navigation */}
          <Button
            variant="ghost"
            size="sm"
            className={`group h-10 w-10 rounded-xl backdrop-blur-xl border transition-all duration-300 shadow-md ${
              isOpen 
                ? 'bg-primary text-primary-foreground border-primary shadow-lg' 
                : 'bg-background/90 border-border/50 hover:bg-background hover:border-primary/50 hover:shadow-lg'
            }`}
            onClick={() => setIsOpen(!isOpen)}
            title="Settings & Preferences"
          >
            {isOpen ? (
              <X className="h-4 w-4" />
            ) : (
              <Settings className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            )}
          </Button>

          {/* History Navigation */}
          <Button
            variant="ghost"
            size="sm"
            className="group h-10 w-10 rounded-xl bg-background/90 backdrop-blur-xl border border-border/50 hover:bg-background hover:border-primary/50 hover:shadow-lg transition-all duration-300 shadow-md"
            onClick={() => setShowHistoryPopup(true)}
            title="View History & Analytics"
          >
            <History className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </Button>

          {/* API Configuration Navigation */}
          <Button
            variant="ghost"
            size="sm"
            className="group h-10 w-10 rounded-xl bg-background/90 backdrop-blur-xl border border-border/50 hover:bg-background hover:border-primary/50 hover:shadow-lg transition-all duration-300 shadow-md"
            onClick={() => navigate('/api-config')}
            title="API Configuration"
          >
            <Key className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </Button>

         
        </div>
      )}

      {/* Main Settings Popup */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
            onClick={closeAllPopups}
          />
          
          {/* Main Settings Popup */}
          <div className="absolute left-12 top-0 z-50 w-80 bg-background/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl animate-in slide-in-from-left-4 duration-300">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-foreground">Settings & Preferences</h2>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <Building2 className="w-4 h-4" />
                    <span>ZeroXTech | Chaitanya</span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={closeAllPopups}
                  className="h-8 w-8 p-0 hover:bg-muted/50 rounded-lg"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Tab Navigation */}
              <div className="flex space-x-2 mb-6 bg-muted/50 p-1.5 rounded-xl">
                <Button
                  variant={activeTab === 'model' ? 'default' : 'ghost'}
                  size="sm"
                  className="flex-1 h-9 text-sm font-medium rounded-lg"
                  onClick={() => handleTabClick('model')}
                >
                  <Bot className="h-4 w-4 mr-2" />
                  AI Model
                </Button>
                <Button
                  variant={activeTab === 'framework' ? 'default' : 'ghost'}
                  size="sm"
                  className="flex-1 h-9 text-sm font-medium rounded-lg"
                  onClick={() => handleTabClick('framework')}
                >
                  <Layers className="h-4 w-4 mr-2" />
                  Framework
                </Button>
              </div>

              {/* Current Selection Summary */}
              {userPreferences && (
                <div className="mb-6 p-4 bg-gradient-to-r from-primary/5 to-accent/5 rounded-xl border border-primary/20">
                  <h4 className="font-semibold text-foreground mb-3 text-sm flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    Current Configuration
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-2 bg-background/50 rounded-lg">
                      <span className="text-sm text-muted-foreground">AI Model:</span>
                      <Badge variant="secondary" className="font-medium">
                        {getModelIcon(userPreferences.selected_model)} {getModelDisplayName(userPreferences.selected_model)}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-background/50 rounded-lg">
                      <span className="text-sm text-muted-foreground">Framework:</span>
                      <Badge variant="secondary" className="font-medium">
                        {frameworks.find(f => f.id === userPreferences.selected_framework)?.name}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}

              {/* Vibe Coding Toggle */}
              <div className="p-4 bg-gradient-to-r from-muted/30 to-muted/50 rounded-xl border border-border/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Code className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <Label htmlFor="vibe-coding" className="text-sm font-semibold text-foreground">
                        Vibe Coding Mode
                      </Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        Simplified prompt generation
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="vibe-coding"
                    checked={userPreferences?.vibe_coding || false}
                    onCheckedChange={handleVibeCodingToggle}
                    className="data-[state=checked]:bg-primary"
                  />
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Models Popup */}
      {showModelPopup && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
            onClick={() => setShowModelPopup(false)}
          />
          
          {/* Models Popup */}
          <div className="absolute left-12 top-0 z-50 w-80 bg-background/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl animate-in slide-in-from-left-4 duration-300">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-foreground">Select AI Model</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowModelPopup(false)}
                  className="h-8 w-8 p-0 hover:bg-muted/50 rounded-lg"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                Choose your preferred AI model. Only models with configured API keys are available.
              </p>
              
              <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                {availableModels.map((model) => (
                  <Card
                    key={model}
                    className={`p-4 cursor-pointer transition-all duration-300 hover:shadow-lg border-2 ${
                      userPreferences?.selected_model === model
                        ? 'border-primary bg-gradient-to-r from-primary/5 to-primary/10 shadow-lg scale-[1.02]'
                        : 'border-border hover:border-primary/50 hover:bg-muted/30 hover:scale-[1.01]'
                    }`}
                    onClick={() => handleModelSelect(model as 'openai' | 'gemini' | 'anthropic')}
                  >
                    <div className="flex items-center space-x-4">
                      <span className="text-3xl">{getModelIcon(model)}</span>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-foreground text-base mb-1">
                          {getModelDisplayName(model)}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {model === 'openai' ? 'GPT-4, GPT-3.5 Turbo' : 
                           model === 'gemini' ? 'Gemini Pro, Flash' : 'Claude 3.5 Sonnet'}
                        </p>
                      </div>
                      {userPreferences?.selected_model === model && (
                        <Badge variant="default" className="bg-primary text-primary-foreground text-xs px-3 py-1.5 font-medium">
                          Active
                        </Badge>
                      )}
                    </div>
                  </Card>
                ))}

                {availableModels.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-base font-medium mb-2">No API keys configured</p>
                    <p className="text-sm">Configure API keys in settings to select a model</p>
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
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
            onClick={() => setShowFrameworkPopup(false)}
          />
          
          {/* Frameworks Popup */}
          <div className="absolute left-12 top-0 z-50 w-[70rem] max-h-[80vh] bg-background/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl animate-in slide-in-from-left-4 duration-300 overflow-hidden">
            <div className="p-6 h-full flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-foreground">Select Framework</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Choose your preferred prompt engineering framework
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFrameworkPopup(false)}
                  className="h-8 w-8 p-0 hover:bg-muted/50 rounded-lg"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-3 gap-4 flex-1 overflow-y-auto pr-2">
                {frameworks.map((framework) => (
                  <Card
                    key={framework.id}
                    className={`p-4 cursor-pointer transition-all duration-300 hover:shadow-lg border-2 ${
                      userPreferences?.selected_framework === framework.id
                        ? 'border-primary bg-gradient-to-r from-primary/5 to-primary/10 shadow-lg scale-[1.02]'
                        : 'border-border hover:border-primary/50 hover:bg-muted/30 hover:scale-[1.01]'
                    }`}
                    onClick={() => handleFrameworkSelect(framework.id)}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-foreground text-base">
                          {framework.name}
                        </h4>
                        {userPreferences?.selected_framework === framework.id && (
                          <Badge variant="default" className="bg-primary text-primary-foreground text-xs px-2 py-1">
                            Active
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {framework.description}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {framework.components.slice(0, 4).map((component, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="text-xs bg-muted/50 text-foreground border-border px-2 py-1"
                          >
                            {component}
                          </Badge>
                        ))}
                        {framework.components.length > 4 && (
                          <Badge variant="outline" className="text-xs px-2 py-1">
                            +{framework.components.length - 4}
                          </Badge>
                        )}
                      </div>
                      <div className="pt-2 border-t border-border/50">
                        <p className="text-xs text-muted-foreground">
                          <span className="font-medium">Best for:</span> {framework.bestFor}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* History Popup */}
      <HistoryPopup 
        isOpen={showHistoryPopup} 
        onClose={() => setShowHistoryPopup(false)} 
      />
    </>
  );
};

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Copy, Sparkles, Bot, CheckCircle, Loader2, AlertCircle, Building2, Settings, Home, Key, History } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useApiConfig } from '@/hooks/useApiConfig';
import { LeftSidebar } from '@/components/LeftSidebar';
import { Navbar } from '@/components/Navbar';
import { userPreferencesService, frameworks, promptHistoryService } from '@/services/services';
import { useMCP } from '@/hooks/useMCP';

interface Framework {
  id: string;
  name: string;
  description: string;
  components: string[];
  bestFor: string;
}

interface TaskInfo {
  taskDescription: string;
  tone?: string;
  length?: string;
}

const PromptGenerator = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { loading, hasAnyConfig } = useApiConfig();
  
  const [selectedFramework, setSelectedFramework] = useState<Framework | null>(null);
  const [userPreferences, setUserPreferences] = useState<{ selected_framework?: string; vibe_coding?: boolean } | null>(null);
  const [taskInfo, setTaskInfo] = useState<TaskInfo>({
    taskDescription: '',
    tone: 'professional',
    length: 'medium'
  });
  const [generatedPrompt, setGeneratedPrompt] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [activeModel, setActiveModel] = useState<string>('');
  const [generationTimestamp, setGenerationTimestamp] = useState<Date | null>(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false); // Mobile menu state
  
  const { isGenerating, lastResponse, generatePrompt: mcpGeneratePrompt, clearResponse } = useMCP();

  useEffect(() => {
    // Check if user is authenticated
    if (!user) {
      navigate('/auth');
      return;
    }

    // Check if user has configured API keys
    if (!loading && !hasAnyConfig) {
      navigate('/api-config');
    }

    // Load user preferences
    if (user && hasAnyConfig) {
      loadUserPreferences();
    }
  }, [user, navigate, loading, hasAnyConfig]);

  // Subscribe to preference changes for real-time updates
  useEffect(() => {
    if (user && hasAnyConfig) {
      const unsubscribe = userPreferencesService.subscribe((preferences) => {
        const previousVibeCoding = userPreferences?.vibe_coding;
        setUserPreferences(preferences);
        
        // Update selected framework if it changed
        if (preferences.selected_framework) {
          const framework = frameworks.find(f => f.id === preferences.selected_framework);
          if (framework) {
            setSelectedFramework(framework);
          }
        }
        
        // Clear generated prompt when preferences change to show immediate effect
        setGeneratedPrompt('');
        
        // Show toast notification when vibe coding changes
        if (previousVibeCoding !== undefined && previousVibeCoding !== preferences.vibe_coding) {
          toast({
            title: preferences.vibe_coding ? "Vibe Coding Enabled" : "Vibe Coding Disabled",
            description: preferences.vibe_coding 
              ? "Tone and length sections are now hidden for simplified prompts"
              : "Tone and length customization is now available",
          });
        }
      });

      return unsubscribe;
    }
  }, [user, hasAnyConfig, userPreferences?.vibe_coding, toast]);

  const loadUserPreferences = async () => {
    try {
      const preferences = await userPreferencesService.getUserPreferences();
      if (preferences) {
        setUserPreferences(preferences);
        setActiveModel(preferences.selected_model);
        const framework = frameworks.find(f => f.id === preferences.selected_framework);
        if (framework) {
          setSelectedFramework(framework);
        }
      } else {
        // Set default framework if no preferences
        setSelectedFramework(frameworks[0]);
      }
    } catch (error) {
      console.error('Error loading user preferences:', error);
      setSelectedFramework(frameworks[0]);
    }
  };

  const generatePrompt = async () => {
    if (!selectedFramework || !activeModel) {
      toast({
        title: "Error",
        description: "Please select a framework and ensure you have an active model configured.",
        variant: "destructive",
      });
      return;
    }

    // Test database connection
    try {
      console.log('🔍 [Test] Testing database connection...');
      const testResult = await promptHistoryService.getPromptHistory(1);
      console.log('✅ [Test] Database connection test successful:', testResult);
    } catch (error) {
      console.error('❌ [Test] Database connection test failed:', error);
      console.error('❌ [Test] Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
    }

    clearResponse();
    setGeneratedPrompt('');
    setGenerationTimestamp(null);
    
    // STEP 1: Store input details immediately when generate is clicked
    let historyEntryId: string | null = null;
    try {
      console.log('=== STEP 1: Storing Input Details ===');
      
      const inputSaveResult = await promptHistoryService.savePromptHistoryInput({
        framework_id: selectedFramework.id,
        framework_name: selectedFramework.name,
        model: activeModel,
        user_input: taskInfo.taskDescription,
        tone: taskInfo.tone,
        length: taskInfo.length,
        vibe_coding: userPreferences?.vibe_coding || false
      });
      
      if (inputSaveResult.success) {
        historyEntryId = inputSaveResult.entryId;
        console.log('✅ Input details stored successfully with ID:', historyEntryId);
      } else {
        console.log('❌ Failed to store input details');
      }
    } catch (error) {
      console.error('❌ Error storing input details:', error);
    }
    
    try {
      const request = {
        frameworkId: selectedFramework.id,
        taskDescription: taskInfo.taskDescription,
        tone: taskInfo.tone,
        length: taskInfo.length,
        vibeCoding: userPreferences?.vibe_coding
      };

      // Debug logging
      console.log('=== PromptGenerator Request ===');
      console.log('Framework:', selectedFramework.name);
      console.log('Task Description:', taskInfo.taskDescription);
      console.log('Tone:', taskInfo.tone);
      console.log('Length:', taskInfo.length);
      console.log('Vibe Coding:', userPreferences?.vibe_coding);
      console.log('Active Model:', activeModel);
      console.log('==============================');

      const response = await mcpGeneratePrompt(request);
      
      if (response.success && response.prompt) {
        // Debug: Log what we're getting
        console.log('=== MCP Response Debug ===');
        console.log('Full response:', response);
        console.log('Response.prompt:', response.prompt);
        console.log('Response type:', typeof response.prompt);
        console.log('Response length:', response.prompt.length);
        console.log('First 100 chars:', response.prompt.substring(0, 100));
        console.log('========================');
        
        // Check if the prompt still contains JSON wrapper
        let cleanPrompt = response.prompt;
        try {
          // If the prompt is still JSON, try to extract generated_prompt
          const parsed = JSON.parse(response.prompt);
          if (parsed.generated_prompt) {
            cleanPrompt = parsed.generated_prompt;
            console.log('Extracted generated_prompt from JSON wrapper:', cleanPrompt);
          }
        } catch (e) {
          // Not JSON, use as is
          console.log('Response.prompt is not JSON, using as is');
        }
        
        setGeneratedPrompt(cleanPrompt);
        setGenerationTimestamp(new Date());
        
        // STEP 2: Update the history entry with AI response
        if (historyEntryId) {
          try {
            console.log('=== STEP 2: Updating with AI Response ===');
            
            const updateResult = await promptHistoryService.updatePromptHistoryResponse(
              historyEntryId,
              cleanPrompt
            );
            
            if (updateResult) {
              console.log('✅ AI response updated successfully');
            } else {
              console.log('❌ Failed to update AI response');
            }
          } catch (error) {
            console.error('❌ Error updating AI response:', error);
          }
        }
        
        // Show success toast
        toast({
          title: "Prompt Generated!",
          description: `Successfully generated prompt using ${response.model?.toUpperCase()} model`,
        });
      } else if (response.error) {
        // Update history entry with failed status
        if (historyEntryId) {
          try {
            console.log('=== STEP 2: Updating with Failed Status ===');
            
            const updateResult = await promptHistoryService.updatePromptHistoryStatus(
              historyEntryId,
              'failed',
              response.error
            );
            
            if (updateResult) {
              console.log('✅ Failed status updated successfully');
            } else {
              console.log('❌ Failed to update failed status');
            }
          } catch (error) {
            console.error('❌ Error updating failed status:', error);
          }
        }
        
        // Show error toast
        toast({
          title: "Generation Failed",
          description: response.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error generating prompt:', error);
      
      // Update history entry with failed status if we have an entry ID
      if (historyEntryId) {
        try {
          console.log('=== STEP 2: Updating with Failed Status (Exception) ===');
          
          const updateResult = await promptHistoryService.updatePromptHistoryStatus(
            historyEntryId,
            'failed',
            error instanceof Error ? error.message : 'Unknown error occurred'
          );
          
          if (updateResult) {
            console.log('✅ Failed status updated successfully');
          } else {
            console.log('❌ Failed to update failed status');
          }
        } catch (updateError) {
          console.error('❌ Error updating failed status:', updateError);
        }
      }
      
      toast({
        title: "Error",
        description: "Failed to generate prompt. Please try again.",
        variant: "destructive",
      });
    }
  };



  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedPrompt);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Prompt copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (field: keyof TaskInfo, value: string) => {
    setTaskInfo(prev => ({ ...prev, [field]: value }));
  };

  if (loading || !selectedFramework) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-6 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">
            {loading ? 'Checking your API configurations...' : 'Loading your preferences...'}
          </p>
        </div>
      </div>
    );
  }

  if (!hasAnyConfig) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-6 flex items-center justify-center">
        <div className="text-center">
          <Bot className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-2">No API Keys Configured</h2>
          <p className="text-muted-foreground mb-4">You need to configure at least one API key to use the prompt generator.</p>
          <Button onClick={() => navigate('/api-config')}>
            Configure API Keys
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <Navbar />
      <div className="pt-8">
        
        {/* Main Content */}
        <div className="p-6">
          {/* Header */}
          <div className="text-center py-4 flex-shrink-0">
            <h1 className="text-2xl md:text-3xl font-bold text-gradient mb-2">
              AI Prompt Generator
            </h1>
            
            {/* Company Branding */}
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-2">
              <Building2 className="w-4 h-4" />
              <span className="font-medium">ZeroXTech | Chaitanya</span>
            </div>
            
            <p className="text-sm text-muted-foreground">
              Generate structured prompts using proven frameworks
            </p>
          </div>

          <div className="px-6">
            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full max-w-7xl mx-auto">
              {/* Left Side - Task Input with Menu */}
              <div className="relative h-full">
                {/* Menu positioned to the left of the task card - hidden on small screens */}
                <div className="absolute -left-16 top-0 z-10 hidden lg:block">
                  <LeftSidebar showNavigation={true} />
                </div>
                
                <Card className="h-full">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Bot className="w-5 h-5" />
                        <span className="text-lg font-semibold">Task Description</span>
                        {userPreferences?.vibe_coding && (
                          <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-primary/20">
                            Vibe Coding Enabled
                          </Badge>
                        )}
                      </div>
                      
                      {/* Mobile Menu Button - visible only on small screens */}
                      <div className="lg:hidden">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => setShowMobileMenu(!showMobileMenu)}
                          title="Menu"
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <CardDescription>
                      {userPreferences?.vibe_coding 
                        ? "Describe your task in detail for simplified AI prompt generation"
                        : "Describe your task in detail for the AI prompt"
                      }
                    </CardDescription>
                    
                    {/* Mobile Menu Dropdown */}
                    {showMobileMenu && (
                      <div className="mt-3 p-3 bg-muted/30 rounded-lg border border-border/50 animate-in slide-in-from-top-2 duration-200">
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-3 text-xs"
                            onClick={() => navigate('/')}
                          >
                            <Home className="h-3 w-3 mr-1" />
                            Home
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-3 text-xs"
                            onClick={() => navigate('/api-config')}
                          >
                            <Key className="h-3 w-3 mr-1" />
                            API Config
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-3 text-xs"
                            onClick={() => setShowMobileMenu(false)}
                          >
                            <History className="h-3 w-3 mr-1" />
                            History
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    {/* Active Model and Framework Tags */}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {activeModel && (
                        <Badge variant="outline" className="text-xs">
                          Model: {activeModel.toUpperCase()}
                        </Badge>
                      )}
                      {selectedFramework && (
                        <Badge variant="outline" className="text-xs">
                          Framework: {selectedFramework.name}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="flex-1 flex flex-col space-y-3">
                    <div className="flex-1 flex flex-col min-h-0">
                      <Label htmlFor="taskDescription" className="text-sm mb-1">Task Details *</Label>
                      <Textarea
                        id="taskDescription"
                        placeholder="Describe your task in detail. Include what you want the AI to do, any specific requirements, context, examples, or constraints..."
                        value={taskInfo.taskDescription}
                        onChange={(e) => handleInputChange('taskDescription', e.target.value)}
                        className="flex-1 resize-none min-h-0 text-base leading-relaxed"
                        style={{ 
                          minHeight: userPreferences?.vibe_coding ? '484px' : '434px' 
                        }}
                      />
                      {userPreferences?.vibe_coding && (
                        <p className="text-xs text-muted-foreground mt-2">
                          💡 Vibe coding mode: Tone and length preferences are automatically optimized for your task.
                        </p>
                      )}
                    </div>
                    
                    {!userPreferences?.vibe_coding && (
                      <div className="grid grid-cols-2 gap-3 flex-shrink-0">
                        <div className="space-y-1">
                          <Label htmlFor="tone" className="text-sm">Tone</Label>
                          <Select value={taskInfo.tone} onValueChange={(value) => handleInputChange('tone', value)}>
                            <SelectTrigger className="h-9">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="professional">Professional</SelectItem>
                              <SelectItem value="casual">Casual</SelectItem>
                              <SelectItem value="friendly">Friendly</SelectItem>
                              <SelectItem value="formal">Formal</SelectItem>
                              <SelectItem value="creative">Creative</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-1">
                          <Label htmlFor="length" className="text-sm">Length</Label>
                          <Select value={taskInfo.length} onValueChange={(value) => handleInputChange('length', value)}>
                            <SelectTrigger className="h-9">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="short">Short</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="long">Long</SelectItem>
                              <SelectItem value="detailed">Detailed</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}
                    
                    <Button
                      onClick={generatePrompt}
                      disabled={!taskInfo.taskDescription.trim() || isGenerating}
                      className="w-full h-10 text-sm"
                      size="default"
                    >
                      {isGenerating ? 'Generating...' : 'Generate Prompt'}
                    </Button>
                  </CardContent>
                </Card>
                
                {/* Menu Icon positioned next to the Task Information box */}
                
              </div>

              {/* Right Side - Generated Prompt */}
              <Card className="h-full flex flex-col">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Sparkles className="w-5 h-5" />
                    Generated Prompt
                  </CardTitle>
                  <CardDescription>
                    Your structured prompt based on the {selectedFramework?.name} framework
                    {userPreferences?.vibe_coding && (
                      <span className="text-primary"> • Vibe coding optimized</span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col p-6">
                  {generatedPrompt ? (
                    <div className="flex-1 flex flex-col space-y-4">
                      {/* Generated Prompt Display */}
                      <div className="bg-muted/50 rounded-lg border flex-1 flex flex-col">
                        <div className="p-4 flex-1">
                          <div className="mb-3">
                            <Badge variant="outline" className="text-xs">
                              AI Generated Prompt
                            </Badge>
                          </div>
                          <pre className="whitespace-pre-wrap text-sm font-mono flex-1 leading-relaxed">{generatedPrompt}</pre>
                        </div>
                        
                        {/* Footer with Timestamp and Details Tags */}
                        {lastResponse && (
                          <div className="px-4 py-3 bg-muted/30 border-t border-muted/50">
                            <div className="flex flex-wrap gap-2 justify-end">
                              <Badge variant="outline" className="text-xs">
                                {generationTimestamp ? generationTimestamp.toLocaleString() : 'Just now'}
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                {lastResponse.model?.toUpperCase()}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {selectedFramework?.name}
                              </Badge>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex gap-3 flex-shrink-0">
                        <Button
                          onClick={copyToClipboard}
                          variant="outline"
                          className="flex-1 h-10"
                          size="default"
                        >
                          {copied ? (
                            <>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4 mr-2" />
                              Copy Prompt
                            </>
                          )}
                        </Button>
                        
                        <Button
                          onClick={() => setGeneratedPrompt('')}
                          variant="outline"
                          size="default"
                          className="h-10"
                        >
                          Clear
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
                      <Sparkles className="w-16 h-16 mb-4 opacity-50" />
                      <p className="text-base text-center max-w-md">Fill in the task information and click "Generate Prompt" to see your structured prompt here.</p>
                      {lastResponse && !lastResponse.success && (
                        <div className="mt-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg w-full max-w-md">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertCircle className="w-4 h-4 text-destructive" />
                            <span className="text-sm font-medium text-destructive">Generation Failed</span>
                          </div>
                          <p className="text-xs text-destructive">{lastResponse.error}</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromptGenerator;

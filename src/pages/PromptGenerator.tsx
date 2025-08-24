import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Copy, Sparkles, Bot, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useApiConfig } from '@/hooks/useApiConfig';
import { LeftSidebar } from '@/components/LeftSidebar';
import { userPreferencesService, frameworks } from '@/lib/userPreferencesService';
import { useMCP } from '@/hooks/useMCP';
import { getMasterPrompt } from '@/lib/masterPromptConfig';

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

    clearResponse();
    setGeneratedPrompt('');
    setGenerationTimestamp(null);
    
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
        
        // Show success toast
        toast({
          title: "Prompt Generated!",
          description: `Successfully generated prompt using ${response.model?.toUpperCase()} model`,
        });
      } else if (response.error) {
        // Show error toast
        toast({
          title: "Generation Failed",
          description: response.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error generating prompt:', error);
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
    <div className="h-screen bg-gradient-to-br from-background to-muted/20 flex flex-col pt-4 pb-4">
      {/* Header */}
      <div className="text-center py-4 flex-shrink-0">
        <h1 className="text-2xl md:text-3xl font-bold text-gradient mb-2">
          AI Prompt Generator
        </h1>
        <p className="text-sm text-muted-foreground">
          Generate structured prompts using proven frameworks
        </p>
      </div>

      <div className="flex-1 px-6">
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full max-w-7xl mx-auto">
          {/* Left Side - Task Input */}
          <div className="relative h-full">
            <Card className="h-full">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Bot className="w-5 h-5" />
                  Task Description
                  {userPreferences?.vibe_coding && (
                    <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-primary/20">
                      Vibe Coding Enabled
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  {userPreferences?.vibe_coding 
                    ? "Describe your task in detail for simplified AI prompt generation"
                    : "Describe your task in detail for the AI prompt"
                  }
                </CardDescription>
                {/* Active Model and Framework Tags */}
                <div className="flex flex-wrap gap-2 mt-2">
                  {activeModel && (
                    <Badge variant="outline" className="text-xs">
                      Model: {activeModel.toUpperCase()}
                    </Badge>
                  )}
                  {selectedFramework && (
                    <Badge variant="secondary" className="text-xs">
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
                      minHeight: userPreferences?.vibe_coding ? '500px' : '450px' 
                    }}
                  />
                  {userPreferences?.vibe_coding && (
                    <p className="text-xs text-muted-foreground mt-1">
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
            <LeftSidebar />
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

      {/* Navigation */}
      <div className="flex justify-center mt-6">
        <Button
          onClick={() => navigate('/api-config')}
          variant="outline"
          size="default"
        >
          Back to API Configuration
        </Button>
      </div>
    </div>
  );
};

export default PromptGenerator;

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Copy, Sparkles, Bot, CheckCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useApiConfig } from '@/hooks/useApiConfig';
import { LeftSidebar } from '@/components/LeftSidebar';
import { userPreferencesService, frameworks } from '@/lib/userPreferencesService';

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
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

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

  const generatePrompt = () => {
    setIsGenerating(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const prompt = buildPromptFromFramework(selectedFramework, taskInfo);
      setGeneratedPrompt(prompt);
      setIsGenerating(false);
    }, 1500);
  };

  const buildPromptFromFramework = (framework: Framework, info: TaskInfo): string => {
    let prompt = '';
    
    switch (framework.id) {
      case 'roses':
        prompt = `Role: [Define the role based on the task]
Objective: ${info.taskDescription || '[Describe your task]'}
Steps: [Break down the task into steps]
Examples: [Provide examples or references]
Specifications: [Add any specific requirements]`;
        break;
        
      case 'ape':
        prompt = `Action: ${info.taskDescription || '[Describe the action needed]'}
Purpose: [Explain the purpose]
Expectation: [Define expected outcome]`;
        break;
        
      case 'tag':
        prompt = `Task: ${info.taskDescription || '[Describe the task]'}
Action: [Specify the action]
Goal: [Define the goal]`;
        break;
        
      case 'era':
        prompt = `Expectation: [Set clear expectations]
Role: [Define the role]
Action: ${info.taskDescription || '[Describe the action]'}`;
        break;
        
      case 'race':
        prompt = `Role: [Define the role based on the task]
Action: ${info.taskDescription || '[Describe the action]'}
Context: [Provide context]
Expectation: [Set expectations]`;
        break;
        
      case 'rise':
        prompt = `Role: [Define the role based on the task]
Input: [Specify input requirements]
Steps: [Outline steps for the task]
Expectation: [Set expectations]`;
        break;
        
      case 'care':
        prompt = `Context: [Provide context for the task]
Action: ${info.taskDescription || '[Describe the action]'}
Result: [Define expected result]
Example: [Provide examples]`;
        break;
        
      case 'coast':
        prompt = `Context: [Provide context for the task]
Objective: ${info.taskDescription || '[Define objective]'}
Actions: [Specify actions needed]
Scenario: [Describe scenario]
Task: [Define the task]`;
        break;
        
      case 'trace':
        prompt = `Task: ${info.taskDescription || '[Define the task]'}
Role: [Specify the role]
Action: [Describe actions needed]
Context: [Provide context]
Example: [Provide examples]`;
        break;
        
      default:
        prompt = `Please provide the following information:
Task: ${info.taskDescription || '[Describe your task in detail]'}`;
    }
    
    // Add tone and length preferences only if vibe coding is disabled
    const isVibeCodingEnabled = userPreferences?.vibe_coding === true;
    if (!isVibeCodingEnabled && (info.tone || info.length)) {
      prompt += `\n\nPreferences:
${info.tone ? `Tone: ${info.tone}` : ''}
${info.length ? `Length: ${info.length}` : ''}`;
    }
    
    return prompt.trim();
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
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-6">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-gradient mb-2">
          AI Prompt Generator
        </h1>
        <p className="text-lg text-muted-foreground">
          Generate structured prompts using proven frameworks
        </p>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Left Side - Task Input */}
            <div className="relative">
              <Card>
                <CardHeader className="pb-3">
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
                </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="taskDescription" className="text-sm">Task Details *</Label>
                <Textarea
                  id="taskDescription"
                  placeholder="Describe your task in detail. Include what you want the AI to do, any specific requirements, context, examples, or constraints..."
                  value={taskInfo.taskDescription}
                  onChange={(e) => handleInputChange('taskDescription', e.target.value)}
                  rows={6}
                  className="min-h-[120px] resize-none"
                />
                {userPreferences?.vibe_coding && (
                  <p className="text-xs text-muted-foreground mt-1">
                    💡 Vibe coding mode: Tone and length preferences are automatically optimized for your task.
                  </p>
                )}
              </div>
              
              {!userPreferences?.vibe_coding && (
                <div className="grid grid-cols-2 gap-3">
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
                className="w-full mt-2"
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
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Sparkles className="w-5 h-5" />
                Generated Prompt
              </CardTitle>
              <CardDescription>
                Your structured prompt based on the {selectedFramework.name} framework
                {userPreferences?.vibe_coding && (
                  <span className="text-primary"> • Vibe coding optimized</span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {generatedPrompt ? (
                <div className="space-y-3">
                  <div className="bg-muted/50 p-3 rounded-lg border">
                    <pre className="whitespace-pre-wrap text-sm font-mono">{generatedPrompt}</pre>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={copyToClipboard}
                      variant="outline"
                      className="flex-1"
                      size="sm"
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
                      size="sm"
                    >
                      Clear
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Sparkles className="w-10 h-10 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">Fill in the task information and click "Generate Prompt" to see your structured prompt here.</p>
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

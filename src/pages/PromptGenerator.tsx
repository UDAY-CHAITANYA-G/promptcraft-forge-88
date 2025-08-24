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

interface Framework {
  id: string;
  name: string;
  description: string;
  components: string[];
  bestFor: string;
}

const frameworks: Framework[] = [
  {
    id: "roses",
    name: "R.O.S.E.S",
    description: "Role, Objective, Scenario, Expected output, Short form",
    components: ["Role", "Objective", "Scenario", "Expected output", "Short form"],
    bestFor: "Complex tasks requiring detailed context"
  },
  {
    id: "ape",
    name: "A.P.E",
    description: "Action, Purpose, Expectation",
    components: ["Action", "Purpose", "Expectation"],
    bestFor: "Quick, action-oriented tasks"
  },
  {
    id: "tag",
    name: "T.A.G",
    description: "Task, Action, Goal",
    components: ["Task", "Action", "Goal"],
    bestFor: "Straightforward problem-solving"
  },
  {
    id: "era",
    name: "E.R.A",
    description: "Expectation, Role, Action",
    components: ["Expectation", "Role", "Action"],
    bestFor: "Role-playing scenarios"
  },
  {
    id: "race",
    name: "R.A.C.E",
    description: "Role, Action, Context, Expectation",
    components: ["Role", "Action", "Context", "Expectation"],
    bestFor: "Professional and business contexts"
  },
  {
    id: "rise",
    name: "R.I.S.E",
    description: "Role, Input, Steps, Expectation",
    components: ["Role", "Input", "Steps", "Expectation"],
    bestFor: "Process-driven tasks"
  },
  {
    id: "care",
    name: "C.A.R.E",
    description: "Context, Action, Result, Example",
    components: ["Context", "Action", "Result", "Example"],
    bestFor: "Educational and training content"
  },
  {
    id: "coast",
    name: "C.O.A.S.T",
    description: "Context, Objective, Actions, Scenario, Task",
    components: ["Context", "Objective", "Actions", "Scenario", "Task"],
    bestFor: "Complex multi-step processes"
  },
  {
    id: "trace",
    name: "T.R.A.C.E",
    description: "Task, Role, Action, Context, Example",
    components: ["Task", "Role", "Action", "Context", "Example"],
    bestFor: "Detailed instruction-based prompts"
  }
];

interface TaskInfo {
  role: string;
  objective: string;
  context: string;
  requirements: string;
  examples: string;
  tone: string;
  length: string;
}

const PromptGenerator = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { loading, hasAnyConfig } = useApiConfig();
  
  const [selectedFramework, setSelectedFramework] = useState<Framework>(frameworks[0]);
  const [taskInfo, setTaskInfo] = useState<TaskInfo>({
    role: '',
    objective: '',
    context: '',
    requirements: '',
    examples: '',
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
  }, [user, navigate, loading, hasAnyConfig]);

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
        prompt = `Role: ${info.role || '[Define the role]'}
Objective: ${info.objective || '[Define the objective]'}
Scenario: ${info.context || '[Describe the scenario]'}
Expected Output: ${info.requirements || '[Specify expected output]'}
Short Form: ${info.examples || '[Provide examples or constraints]'}`;
        break;
        
      case 'ape':
        prompt = `Action: ${info.objective || '[Define the action needed]'}
Purpose: ${info.context || '[Explain the purpose]'}
Expectation: ${info.requirements || '[Specify expectations]'}`;
        break;
        
      case 'tag':
        prompt = `Task: ${info.objective || '[Define the task]'}
Action: ${info.requirements || '[Specify required actions]'}
Goal: ${info.context || '[Describe the goal]'}`;
        break;
        
      case 'era':
        prompt = `Expectation: ${info.requirements || '[Define expectations]'}
Role: ${info.role || '[Specify the role]'}
Action: ${info.objective || '[Describe the action]'}`;
        break;
        
      case 'race':
        prompt = `Role: ${info.role || '[Define the role]'}
Action: ${info.objective || '[Specify the action]'}
Context: ${info.context || '[Provide context]'}
Expectation: ${info.requirements || '[Set expectations]'}`;
        break;
        
      case 'rise':
        prompt = `Role: ${info.role || '[Define the role]'}
Input: ${info.context || '[Specify input requirements]'}
Steps: ${info.requirements || '[Outline steps]'}
Expectation: ${info.examples || '[Set expectations]'}`;
        break;
        
      case 'care':
        prompt = `Context: ${info.context || '[Provide context]'}
Action: ${info.objective || '[Specify action]'}
Result: ${info.requirements || '[Define expected result]'}
Example: ${info.examples || '[Provide examples]'}`;
        break;
        
      case 'coast':
        prompt = `Context: ${info.context || '[Provide context]'}
Objective: ${info.objective || '[Define objective]'}
Actions: ${info.requirements || '[Specify actions]'}
Scenario: ${info.examples || '[Describe scenario]'}
Task: ${info.role || '[Define the task]'}`;
        break;
        
      case 'trace':
        prompt = `Task: ${info.objective || '[Define the task]'}
Role: ${info.role || '[Specify the role]'}
Action: ${info.requirements || '[Describe actions]'}
Context: ${info.context || '[Provide context]'}
Example: ${info.examples || '[Provide examples]'}`;
        break;
        
      default:
        prompt = `Please provide the following information:
${info.role ? `Role: ${info.role}` : ''}
${info.objective ? `Objective: ${info.objective}` : ''}
${info.context ? `Context: ${info.context}` : ''}
${info.requirements ? `Requirements: ${info.requirements}` : ''}
${info.examples ? `Examples: ${info.examples}` : ''}`;
    }
    
    // Add tone and length preferences
    if (info.tone || info.length) {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-6 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Checking your API configurations...</p>
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
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gradient mb-4">
            AI Prompt Generator
          </h1>
          <p className="text-xl text-muted-foreground">
            Generate structured prompts using proven frameworks
          </p>
        </div>

        {/* Framework Selection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Select Framework
            </CardTitle>
            <CardDescription>
              Choose the prompt engineering framework that best fits your task
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={selectedFramework.id} onValueChange={(value) => {
              const framework = frameworks.find(f => f.id === value);
              if (framework) setSelectedFramework(framework);
            }}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a framework" />
              </SelectTrigger>
              <SelectContent>
                {frameworks.map((framework) => (
                  <SelectItem key={framework.id} value={framework.id}>
                    <div className="flex flex-col">
                      <span className="font-semibold">{framework.name}</span>
                      <span className="text-sm text-muted-foreground">{framework.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <div className="mt-4">
              <div className="flex flex-wrap gap-2">
                {selectedFramework.components.map((component) => (
                  <Badge key={component} variant="secondary">
                    {component}
                  </Badge>
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Best for: {selectedFramework.bestFor}
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Side - Task Input */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="w-5 h-5" />
                Task Information
              </CardTitle>
              <CardDescription>
                Fill in the details for your AI prompt
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="role">Role (Optional)</Label>
                <Input
                  id="role"
                  placeholder="e.g., Marketing Expert, Data Analyst, Creative Writer"
                  value={taskInfo.role}
                  onChange={(e) => handleInputChange('role', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="objective">Objective/Task *</Label>
                <Textarea
                  id="objective"
                  placeholder="What do you want the AI to do?"
                  value={taskInfo.objective}
                  onChange={(e) => handleInputChange('objective', e.target.value)}
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="context">Context (Optional)</Label>
                <Textarea
                  id="context"
                  placeholder="Background information, situation, or environment"
                  value={taskInfo.context}
                  onChange={(e) => handleInputChange('context', e.target.value)}
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="requirements">Requirements/Constraints (Optional)</Label>
                <Textarea
                  id="requirements"
                  placeholder="Specific requirements, format, or constraints"
                  value={taskInfo.requirements}
                  onChange={(e) => handleInputChange('requirements', e.target.value)}
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="examples">Examples/References (Optional)</Label>
                <Textarea
                  id="examples"
                  placeholder="Examples, references, or similar outputs"
                  value={taskInfo.examples}
                  onChange={(e) => handleInputChange('examples', e.target.value)}
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tone">Tone</Label>
                  <Select value={taskInfo.tone} onValueChange={(value) => handleInputChange('tone', value)}>
                    <SelectTrigger>
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
                
                <div className="space-y-2">
                  <Label htmlFor="length">Length</Label>
                  <Select value={taskInfo.length} onValueChange={(value) => handleInputChange('length', value)}>
                    <SelectTrigger>
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
              
              <Button
                onClick={generatePrompt}
                disabled={!taskInfo.objective.trim() || isGenerating}
                className="w-full"
                size="lg"
              >
                {isGenerating ? 'Generating...' : 'Generate Prompt'}
              </Button>
            </CardContent>
          </Card>

          {/* Right Side - Generated Prompt */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Generated Prompt
              </CardTitle>
              <CardDescription>
                Your structured prompt based on the {selectedFramework.name} framework
              </CardDescription>
            </CardHeader>
            <CardContent>
              {generatedPrompt ? (
                <div className="space-y-4">
                  <div className="bg-muted/50 p-4 rounded-lg border">
                    <pre className="whitespace-pre-wrap text-sm font-mono">{generatedPrompt}</pre>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={copyToClipboard}
                      variant="outline"
                      className="flex-1"
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
                    >
                      Clear
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Fill in the task information and click "Generate Prompt" to see your structured prompt here.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Navigation */}
        <div className="flex justify-center mt-8">
          <Button
            onClick={() => navigate('/api-config')}
            variant="outline"
            size="lg"
          >
            Back to API Configuration
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PromptGenerator;

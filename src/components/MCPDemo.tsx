import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bot, Sparkles, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useMCP } from '@/hooks/useMCP';
import { getMasterPrompt, buildMasterPrompt } from '@/services/services';

export const MCPDemo: React.FC = () => {
  const [selectedFramework, setSelectedFramework] = useState('roses');
  const [taskDescription, setTaskDescription] = useState('');
  const { isGenerating, lastResponse, generatePrompt, clearResponse } = useMCP();

  const frameworks = [
    { id: 'roses', name: 'R.O.S.E.S', description: 'Role, Objective, Scenario, Expected output, Short form' },
    { id: 'ape', name: 'A.P.E', description: 'Action, Purpose, Expectation' },
    { id: 'tag', name: 'T.A.G', description: 'Task, Action, Goal' }
  ];

  const handleGenerate = async () => {
    if (!taskDescription.trim()) return;
    
    // Show the master prompt being generated
    const masterPrompt = buildMasterPrompt(
      selectedFramework,
      taskDescription,
      'professional', // Default tone
      'medium'        // Default length
    );
    
    console.log('=== Master Prompt Generated ===');
    console.log(masterPrompt);
    console.log('===============================');
    
    await generatePrompt({
      frameworkId: selectedFramework,
      taskDescription: taskDescription,
      vibeCoding: true
    });
  };

  const masterPrompt = getMasterPrompt(selectedFramework);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">MCP (Model Context Protocol) Demo</h2>
        <p className="text-muted-foreground">
          Experience AI-powered prompt generation using different models and frameworks
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              Generate Prompt
            </CardTitle>
            <CardDescription>
              Select a framework and describe your task to generate an AI-optimized prompt
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Framework Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Framework</label>
              <div className="grid grid-cols-1 gap-2">
                {frameworks.map((framework) => (
                  <Button
                    key={framework.id}
                    variant={selectedFramework === framework.id ? "default" : "outline"}
                    onClick={() => setSelectedFramework(framework.id)}
                    className="justify-start"
                  >
                    <div className="text-left">
                      <div className="font-medium">{framework.name}</div>
                      <div className="text-xs text-muted-foreground">{framework.description}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            {/* Task Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Task Description</label>
              <textarea
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                placeholder="Describe what you want to accomplish..."
                className="w-full p-3 border rounded-md min-h-[100px] resize-none"
              />
            </div>

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={!taskDescription.trim() || isGenerating}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate with AI
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Output Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Generated Prompt
            </CardTitle>
            <CardDescription>
              AI-generated prompt using the selected framework
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {lastResponse ? (
              <>
                {/* Response Info */}
                <div className="p-3 bg-muted/30 rounded-lg border">
                  <div className="flex items-center gap-2 mb-2">
                    <Bot className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">Generation Details</span>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div>Model: <span className="font-medium">{lastResponse.model?.toUpperCase()}</span></div>
                    <div>Framework: <span className="font-medium">{lastResponse.framework?.toUpperCase()}</span></div>
                    {lastResponse.success && (
                      <div className="text-green-600 font-medium flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Successfully generated
                      </div>
                    )}
                  </div>
                </div>

                {/* Generated Prompt */}
                {lastResponse.success && lastResponse.prompt && (
                  <div className="bg-muted/50 p-3 rounded-lg border">
                    <pre className="whitespace-pre-wrap text-sm font-mono">{lastResponse.prompt}</pre>
                  </div>
                )}

                {/* Error Display */}
                {!lastResponse.success && (
                  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="w-4 h-4 text-destructive" />
                      <span className="text-sm font-medium text-destructive">Generation Failed</span>
                    </div>
                    <p className="text-xs text-destructive">{lastResponse.error}</p>
                  </div>
                )}

                <Button
                  onClick={clearResponse}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  Clear
                </Button>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Sparkles className="w-10 h-10 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Fill in the task information and click "Generate with AI" to see your prompt here.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Master Prompt Info */}
      {masterPrompt && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              {masterPrompt.name} Framework
            </CardTitle>
            <CardDescription>
              Understanding the master prompt structure
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-sm text-muted-foreground">{masterPrompt.description}</p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Components</h4>
                <div className="flex flex-wrap gap-2">
                  {masterPrompt.variables.map((variable) => (
                    <Badge key={variable} variant="secondary">
                      {variable}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Example</h4>
                <div className="bg-muted/30 p-3 rounded-lg">
                  <p className="text-sm text-muted-foreground">{masterPrompt.examples[0]}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

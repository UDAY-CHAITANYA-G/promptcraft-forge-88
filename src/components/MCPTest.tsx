import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { buildMasterPrompt } from '@/services/services';

export const MCPTest: React.FC = () => {
  const [testPrompt, setTestPrompt] = useState<string>('');

  const testMasterPrompt = () => {
    try {
      const prompt = buildMasterPrompt(
        'roses',
        'Design a scalable microservices architecture for an e-commerce platform',
        'professional',
        'detailed'
      );
      setTestPrompt(prompt);
    } catch (error) {
      setTestPrompt(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Master Prompt Test</CardTitle>
        <CardDescription>
          Test the master prompt generation system
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={testMasterPrompt}>
          Generate Test Master Prompt
        </Button>
        
        {testPrompt && (
          <div className="mt-4">
            <h4 className="font-medium mb-2">Generated Master Prompt:</h4>
            <div className="bg-muted p-4 rounded-lg">
              <pre className="whitespace-pre-wrap text-sm">{testPrompt}</pre>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

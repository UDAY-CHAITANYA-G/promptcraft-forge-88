import React, { useState } from 'react';
import { ApiKeyValidator } from '@/lib/apiKeyValidator';

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  provider?: string;
}

export const ApiKeyValidatorDemo: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [summary, setSummary] = useState('');

  const handleValidation = () => {
    if (!apiKey.trim()) {
      setSummary('Please enter an API key to validate');
      setValidationResult(null);
      return;
    }

    const result = ApiKeyValidator.validateOpenAIKey(apiKey);
    const summaryText = ApiKeyValidator.getValidationSummary(result);
    
    setValidationResult(result);
    setSummary(summaryText);
  };

  const handleTestKey = () => {
    // Example key for demonstration (not a real API key)
    const exampleKey = 'sk-proj-example1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
    setApiKey(exampleKey);
    const result = ApiKeyValidator.validateOpenAIKey(exampleKey);
    const summaryText = ApiKeyValidator.getValidationSummary(result);
    
    setValidationResult(result);
    setSummary(summaryText);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">OpenAI API Key Validator</h2>
      
      <div className="mb-6">
        <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-2">
          Enter OpenAI API Key:
        </label>
        <textarea
          id="apiKey"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="sk-... or sk-proj-..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={3}
        />
      </div>

      <div className="flex gap-3 mb-6">
        <button
          onClick={handleValidation}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Validate Key
        </button>
        <button
          onClick={handleTestKey}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        >
          Test with Sample Key
        </button>
      </div>

      {summary && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2 text-gray-800">Validation Result:</h3>
          <div className="p-4 bg-gray-50 rounded-md">
            <pre className="whitespace-pre-wrap text-sm text-gray-700">{summary}</pre>
          </div>
        </div>
      )}

      {validationResult && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2 text-gray-800">Detailed Result:</h3>
          <div className="p-4 bg-gray-50 rounded-md">
            <div className="space-y-2">
              <div>
                <span className="font-medium">Valid:</span>{' '}
                <span className={validationResult.isValid ? 'text-green-600' : 'text-red-600'}>
                  {validationResult.isValid ? 'Yes' : 'No'}
                </span>
              </div>
              
              {validationResult.errors.length > 0 && (
                <div>
                  <span className="font-medium text-red-600">Errors:</span>
                  <ul className="list-disc list-inside ml-4 text-red-600">
                    {validationResult.errors.map((error: string, index: number) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {validationResult.warnings.length > 0 && (
                <div>
                  <span className="font-medium text-yellow-600">Warnings:</span>
                  <ul className="list-disc list-inside ml-4 text-yellow-600">
                    {validationResult.warnings.map((warning: string, index: number) => (
                      <li key={index}>{warning}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="text-sm text-gray-600">
        <h4 className="font-medium mb-2">Supported Formats:</h4>
        <ul className="list-disc list-inside space-y-1">
          <li><code className="bg-gray-100 px-1 rounded">sk-...</code> - Standard OpenAI API key</li>
          <li><code className="bg-gray-100 px-1 rounded">sk-proj-...</code> - Project-level OpenAI API key</li>
          <li>Minimum 32 characters after the prefix</li>
          <li>Only letters, numbers, hyphens, and underscores allowed</li>
        </ul>
      </div>
    </div>
  );
};

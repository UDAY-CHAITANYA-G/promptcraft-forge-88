# MCP (Model Context Protocol) System

## Overview

The MCP system in PromptCraft Forge provides a unified interface for generating AI prompts using different AI models (OpenAI, Gemini, Anthropic) through a standardized protocol. It combines master prompts with user inputs to create optimized, framework-based prompts.

## Architecture

### Core Components

1. **Master Prompt Configuration** (`src/lib/masterPromptConfig.ts`)
   - Defines base prompts for all 9 frameworks (R.O.S.E.S, A.P.E, T.A.G, etc.)
   - Contains structured templates with variables and examples
   - Provides consistent prompt engineering guidelines

2. **MCP Service** (`src/lib/mcpService.ts`)
   - Handles communication with different AI model APIs
   - Manages API key authentication and request formatting
   - Provides unified response handling

3. **MCP Hook** (`src/hooks/useMCP.tsx`)
   - React hook for managing MCP operations
   - Handles state management and error handling
   - Provides toast notifications for user feedback

4. **Updated Prompt Generator** (`src/pages/PromptGenerator.tsx`)
   - Integrates MCP system with existing UI
   - Shows active model and framework information
   - Displays generation details and error handling

## How It Works

### 1. Master Prompt Selection
When a user selects a framework, the system loads the corresponding master prompt:

```typescript
const masterPrompt = getMasterPrompt(frameworkId);
// Returns structured prompt with guidelines and variables
```

### 2. User Input Processing
The system combines:
- Selected framework's master prompt
- User's task description
- Tone and length preferences (if vibe coding is disabled)
- Framework-specific guidelines

### 3. AI Model Communication
Based on the user's active model preference, the system:
- Formats the request according to the model's API requirements
- Sends the combined prompt to the selected AI service
- Handles responses and errors uniformly

### 4. Response Processing
The system:
- Displays the generated prompt
- Shows which model and framework were used
- Provides error information if generation fails
- Updates the UI with generation status

## Supported Models

### OpenAI (GPT-4)
- **Endpoint**: `https://api.openai.com/v1/chat/completions`
- **Model**: `gpt-4`
- **Features**: System/user message format, temperature control

### Google Gemini
- **Endpoint**: `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent`
- **Model**: `gemini-pro`
- **Features**: Content generation with safety controls

### Anthropic Claude
- **Endpoint**: `https://api.anthropic.com/v1/messages`
- **Model**: `claude-3-sonnet-20240229`
- **Features**: Message-based API with version control

## Framework Integration

### R.O.S.E.S Framework
- **Components**: Role, Objective, Scenario, Expected output, Short form
- **Best For**: Complex tasks requiring detailed context
- **Master Prompt**: Comprehensive guidelines for structured prompt creation

### A.P.E Framework
- **Components**: Action, Purpose, Expectation
- **Best For**: Quick, action-oriented tasks
- **Master Prompt**: Streamlined approach focusing on essential elements

### T.A.G Framework
- **Components**: Task, Action, Goal
- **Best For**: Straightforward problem-solving
- **Master Prompt**: Goal-oriented prompt engineering

### Additional Frameworks
- **E.R.A**: Expectation, Role, Action
- **R.A.C.E**: Role, Action, Context, Expectation
- **R.I.S.E**: Role, Input, Steps, Expectation
- **C.A.R.E**: Context, Action, Result, Example
- **C.O.A.S.T**: Context, Objective, Actions, Scenario, Task
- **T.R.A.C.E**: Task, Role, Action, Context, Example

## Usage Examples

### Basic Prompt Generation
```typescript
const request = {
  frameworkId: 'roses',
  taskDescription: 'Design a scalable microservices architecture',
  tone: 'professional',
  length: 'detailed',
  vibeCoding: false
};

const response = await mcpService.generatePrompt(request);
```

### Vibe Coding Mode
```typescript
const request = {
  frameworkId: 'ape',
  taskDescription: 'Analyze customer feedback data',
  vibeCoding: true // Automatically optimizes tone and length
};
```

## Error Handling

The system provides comprehensive error handling:

1. **API Key Validation**: Checks for valid, active API configurations
2. **Model Connection**: Validates connectivity to selected AI services
3. **Response Processing**: Handles API errors and network issues
4. **User Feedback**: Toast notifications for success/failure states

## Security Features

- **API Key Encryption**: Keys are encrypted before storage
- **User Isolation**: Each user can only access their own configurations
- **Secure Communication**: HTTPS endpoints for all API calls
- **Row Level Security**: Database-level access control

## Configuration

### Environment Variables
```bash
# OpenAI
OPENAI_API_KEY=your_openai_key

# Google Gemini
GOOGLE_API_KEY=your_gemini_key

# Anthropic
ANTHROPIC_API_KEY=your_claude_key
```

### Database Setup
The system requires the following tables:
- `api_configurations`: Stores encrypted API keys
- `user_preferences`: Stores user model and framework selections

## Testing

### Model Connection Validation
```typescript
const isValid = await mcpService.validateModelConnection('openai');
// Returns true if OpenAI API is accessible
```

### Framework Testing
```typescript
const masterPrompt = getMasterPrompt('roses');
// Returns R.O.S.E.S framework configuration
```

## Future Enhancements

1. **Model Switching**: Real-time model switching during generation
2. **Batch Processing**: Generate multiple prompts simultaneously
3. **Custom Frameworks**: User-defined prompt frameworks
4. **Prompt History**: Save and reuse generated prompts
5. **Performance Metrics**: Track generation success rates and response times

## Troubleshooting

### Common Issues

1. **"No active model configuration found"**
   - Ensure API keys are configured in the API Configuration page
   - Check that the selected model has an active API key

2. **"Generation Failed"**
   - Verify API key validity
   - Check network connectivity
   - Review API rate limits

3. **"Framework not found"**
   - Ensure framework ID matches available options
   - Check framework configuration files

### Debug Mode
Enable console logging for detailed error information:
```typescript
console.log('MCP Request:', request);
console.log('MCP Response:', response);
```

## Contributing

To extend the MCP system:

1. **Add New Models**: Implement API calls in `mcpService.ts`
2. **New Frameworks**: Add to `masterPromptConfig.ts`
3. **UI Components**: Create React components using the `useMCP` hook
4. **Error Handling**: Add specific error types and user messages

## License

This MCP system is part of PromptCraft Forge and follows the same licensing terms.

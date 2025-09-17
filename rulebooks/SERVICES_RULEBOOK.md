# PromptCraft Forge - Services Rulebook

## 📋 **Overview**
This rulebook defines the architecture, patterns, and standards for the PromptCraft Forge services layer. It ensures consistent service implementation, proper organization, and maintainable code across all application services.

---

## 🏗️ **Services Architecture**

### **Directory Structure**
```
src/services/
├── services.ts                    # Main entry point - import from here
├── lib/                          # Individual service implementations
│   ├── apiConfigService.ts       # API configuration management
│   ├── apiKeyValidator.ts        # API key validation
│   ├── mcpService.ts             # Master Control Prompt service
│   ├── userPreferencesService.ts # User preferences
│   ├── promptHistoryService.ts   # Prompt history tracking
│   ├── feedbackService.ts        # User feedback system
│   ├── emailService.ts           # Email communications
│   ├── masterPromptConfig.ts     # Prompt templates
│   ├── emailConfig.ts            # Email configuration
│   └── utils.ts                  # Utility functions
└── [rulebooks/]                  # Service documentation
```

### **Service Categories**
- **Core Services**: Essential application functionality
- **User Services**: User-related features and data
- **Communication Services**: External communication systems
- **Configuration Services**: Application configuration
- **Utility Services**: Helper functions and utilities

---

## 🎯 **Service Implementation Standards**

### **Service Class Pattern**
```typescript
// ✅ Good: Service Class Pattern
class ServiceName {
  private static instance: ServiceName | null = null;
  
  // Singleton pattern for stateful services
  static getInstance(): ServiceName {
    if (!ServiceName.instance) {
      ServiceName.instance = new ServiceName();
    }
    return ServiceName.instance;
  }
  
  // Private constructor for singleton
  private constructor() {
    // Initialize service
  }
  
  // Public methods
  async methodName(params: ParamsType): Promise<ReturnType> {
    try {
      // Implementation
      return result;
    } catch (error) {
      console.error('Service error:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const serviceName = ServiceName.getInstance();
```

### **Service Interface Pattern**
```typescript
// ✅ Good: Service Interface Pattern
export interface ServiceRequest {
  // Request parameters
  param1: string;
  param2?: number;
}

export interface ServiceResponse {
  // Response structure
  success: boolean;
  data?: any;
  error?: string;
}

export interface ServiceError {
  message: string;
  code?: string;
  details?: any;
}
```

### **Error Handling Pattern**
```typescript
// ✅ Good: Error Handling Pattern
async serviceMethod(): Promise<ServiceResponse> {
  try {
    // Service logic
    const result = await someOperation();
    
    return {
      success: true,
      data: result
    };
  } catch (error) {
    console.error('Service method error:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}
```

---

## 🔧 **Core Services**

### **API Configuration Service**
- **Purpose**: Manages AI provider API keys and configurations
- **Pattern**: Singleton with encrypted storage
- **Key Methods**: `saveApiKey()`, `getApiKey()`, `testConnection()`

```typescript
// ✅ Good: API Config Service Usage
import { apiConfigService } from '@/services/services';

const result = await apiConfigService.saveApiKey('openai', 'sk-...');
if (result.success) {
  // Handle success
} else {
  // Handle error
}
```

### **API Key Validator**
- **Purpose**: Validates API key formats and formats
- **Pattern**: Static utility class
- **Key Methods**: `validateOpenAI()`, `validateGemini()`, `validateAnthropic()`

```typescript
// ✅ Good: API Key Validation Usage
import { ApiKeyValidator } from '@/services/services';

const validator = new ApiKeyValidator();
const isValid = validator.validateOpenAI('sk-...');
```

### **MCP Service (Master Control Prompt)**
- **Purpose**: AI prompt generation and model interactions
- **Pattern**: Singleton with provider abstraction
- **Key Methods**: `generatePrompt()`, `validateModelConnection()`

```typescript
// ✅ Good: MCP Service Usage
import { mcpService } from '@/services/services';

const response = await mcpService.generatePrompt({
  frameworkId: 'roses',
  taskDescription: 'Create a marketing email',
  tone: 'professional'
});
```

---

## 👤 **User Services**

### **User Preferences Service**
- **Purpose**: Manages user settings and framework preferences
- **Pattern**: Singleton with Supabase integration
- **Key Methods**: `getUserPreferences()`, `updatePreferences()`, `getFrameworks()`

```typescript
// ✅ Good: User Preferences Usage
import { userPreferencesService, frameworks } from '@/services/services';

const preferences = await userPreferencesService.getUserPreferences();
const availableFrameworks = frameworks;
```

### **Prompt History Service**
- **Purpose**: Tracks and manages prompt generation history
- **Pattern**: Singleton with database integration
- **Key Methods**: `savePromptHistory()`, `getPromptHistory()`, `updatePromptStatus()`

```typescript
// ✅ Good: Prompt History Usage
import { promptHistoryService } from '@/services/services';

const history = await promptHistoryService.savePromptHistory({
  user_id: user.id,
  framework_id: 'roses',
  task_description: 'Create a blog post',
  generated_prompt: 'Generated prompt text...',
  model_used: 'openai'
});
```

### **Feedback Service**
- **Purpose**: Manages user feedback system
- **Pattern**: Singleton with database storage
- **Key Methods**: `saveFeedback()`, `getFeedback()`, `getFeedbackStats()`

```typescript
// ✅ Good: Feedback Service Usage
import { feedbackService } from '@/services/services';

const result = await feedbackService.saveFeedback({
  message: 'Great app!',
  user_id: user.id
});
```

---

## 📧 **Communication Services**

### **Email Service**
- **Purpose**: Handles email communications via EmailJS
- **Pattern**: Singleton with configuration management
- **Key Methods**: `sendFeedbackEmail()`, `isConfigured()`, `testEmailConnection()`

```typescript
// ✅ Good: Email Service Usage
import { emailService } from '@/services/services';

const result = await emailService.sendFeedbackEmail({
  message: 'User feedback',
  userEmail: 'user@example.com',
  userName: 'John Doe'
});
```

---

## ⚙️ **Configuration Services**

### **Master Prompt Configuration**
- **Purpose**: Prompt templates and model-specific configurations
- **Pattern**: Static configuration with dynamic building
- **Key Methods**: `getMasterPrompt()`, `buildMasterPrompt()`

```typescript
// ✅ Good: Master Prompt Usage
import { getMasterPrompt, buildMasterPrompt } from '@/services/services';

const prompt = getMasterPrompt('openai');
const builtPrompt = buildMasterPrompt('roses', 'Create a story', 'openai');
```

### **Email Configuration**
- **Purpose**: EmailJS configuration management
- **Pattern**: Static configuration with environment variables
- **Key Methods**: `getEmailConfig()`, `validateConfig()`

```typescript
// ✅ Good: Email Config Usage
import { emailConfig } from '@/services/services';

const config = emailConfig;
const isValid = emailConfig.validateConfig();
```

---

## 🚀 **Service Management**

### **Service Initialization**
```typescript
// ✅ Good: Service Initialization
import { initializeServices } from '@/services/services';

// Initialize all services during app startup
await initializeServices();
```

### **Service Health Monitoring**
```typescript
// ✅ Good: Service Health Check
import { getServicesHealth } from '@/services/services';

const health = await getServicesHealth();
console.log(health); // { apiConfig: { status: 'healthy' }, ... }
```

### **Dynamic Service Loading**
```typescript
// ✅ Good: Dynamic Service Loading
import { getService } from '@/services/services';

const apiConfig = await getService('apiConfig');
const userPreferences = await getService('userPreferences');
```

### **Service Categories**
```typescript
// ✅ Good: Service Categories
import { coreServices, userServices } from '@/services/services';

// Dynamic loading by category
const apiConfig = await coreServices.apiConfig();
const preferences = await userServices.preferences();
```

---

## 📦 **Import Patterns**

### **Direct Service Import**
```typescript
// ✅ Good: Direct Import
import { 
  apiConfigService, 
  userPreferencesService, 
  mcpService 
} from '@/services/services';
```

### **Type-Safe Import**
```typescript
// ✅ Good: Type-Safe Import
import { 
  apiConfigService, 
  type ApiKeyData,
  type UserPreferences,
  type MCPRequest,
  type MCPResponse
} from '@/services/services';
```

### **Default Export**
```typescript
// ✅ Good: Default Export
import services from '@/services/services';

const { apiConfig, userPreferences, mcp } = services;
```

### **Service Registry**
```typescript
// ✅ Good: Service Registry
import { serviceRegistry, getService } from '@/services/services';

// Get service by name
const apiConfig = await getService('apiConfig');
```

---

## 🔒 **Security Standards**

### **API Key Management**
- [ ] **Encryption**: All API keys encrypted in database
- [ ] **Environment Variables**: Sensitive config in environment variables
- [ ] **Validation**: Proper API key format validation
- [ ] **Access Control**: RLS policies for data access

### **Data Protection**
- [ ] **Input Validation**: Validate all service inputs
- [ ] **Error Handling**: No sensitive data in error messages
- [ ] **Logging**: Structured logging without sensitive data
- [ ] **Sanitization**: Sanitize user inputs before processing

### **Authentication**
- [ ] **User Context**: Always validate user authentication
- [ ] **Permission Checks**: Verify user permissions for operations
- [ ] **Session Management**: Proper session handling
- [ ] **Token Validation**: Validate authentication tokens

---

## 🧪 **Testing Standards**

### **Service Testing**
```typescript
// ✅ Good: Service Test Pattern
describe('ApiConfigService', () => {
  let service: ApiConfigService;
  
  beforeEach(() => {
    service = ApiConfigService.getInstance();
  });
  
  it('should save API key successfully', async () => {
    const result = await service.saveApiKey('openai', 'test-key');
    expect(result.success).toBe(true);
  });
  
  it('should handle validation errors', async () => {
    const result = await service.saveApiKey('invalid', 'test-key');
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});
```

### **Mocking External Dependencies**
```typescript
// ✅ Good: Mock External Dependencies
jest.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: jest.fn(() => ({
      insert: jest.fn(() => ({
        select: jest.fn(() => Promise.resolve({ data: [], error: null }))
      }))
    }))
  }
}));
```

---

## 📊 **Performance Standards**

### **Service Optimization**
- [ ] **Lazy Loading**: Use dynamic imports for large services
- [ ] **Caching**: Implement appropriate caching strategies
- [ ] **Connection Pooling**: Reuse database connections
- [ ] **Error Recovery**: Implement retry mechanisms

### **Memory Management**
- [ ] **Singleton Pattern**: Use for stateful services
- [ ] **Cleanup**: Proper cleanup of resources
- [ ] **Memory Leaks**: Avoid memory leaks in long-running services
- [ ] **Resource Limits**: Set appropriate resource limits

---

## 🔄 **Service Lifecycle**

### **Initialization Phase**
1. **Service Registration**: Register services in the service registry
2. **Configuration Loading**: Load service configurations
3. **Dependency Resolution**: Resolve service dependencies
4. **Health Checks**: Perform initial health checks

### **Runtime Phase**
1. **Request Handling**: Process service requests
2. **Error Handling**: Handle and log errors
3. **Monitoring**: Monitor service health and performance
4. **Scaling**: Scale services based on demand

### **Shutdown Phase**
1. **Graceful Shutdown**: Handle pending requests
2. **Resource Cleanup**: Clean up resources and connections
3. **State Persistence**: Save important state if needed
4. **Logging**: Log shutdown events

---

## 🚨 **Common Service Anti-Patterns**

### **❌ Don't Do This**
```typescript
// ❌ Bad: Direct database access in components
const { data } = await supabase.from('api_configurations').select('*');

// ❌ Bad: No error handling
const result = await apiConfigService.saveApiKey('openai', key);

// ❌ Bad: Hardcoded service instances
const service = new ApiConfigService();

// ❌ Bad: No input validation
async saveApiKey(provider: string, key: string) {
  // No validation
}

// ❌ Bad: Exposing sensitive data
console.log('API Key:', apiKey);
```

### **✅ Do This Instead**
```typescript
// ✅ Good: Use service layer
const result = await apiConfigService.getApiKeys();

// ✅ Good: Proper error handling
try {
  const result = await apiConfigService.saveApiKey('openai', key);
  if (!result.success) {
    throw new Error(result.error);
  }
} catch (error) {
  // Handle error
}

// ✅ Good: Use singleton pattern
const service = apiConfigService;

// ✅ Good: Input validation
async saveApiKey(provider: string, key: string) {
  if (!provider || !key) {
    throw new Error('Provider and key are required');
  }
  // Implementation
}

// ✅ Good: Secure logging
console.log('API Key saved for provider:', provider);
```

---

## 📚 **Service Documentation Standards**

### **Service Documentation**
```typescript
/**
 * API Configuration Service
 * 
 * Manages AI provider API keys and configurations with encrypted storage.
 * Provides methods for saving, retrieving, and validating API keys.
 * 
 * @example
 * ```typescript
 * import { apiConfigService } from '@/services/services';
 * 
 * const result = await apiConfigService.saveApiKey('openai', 'sk-...');
 * if (result.success) {
 *   console.log('API key saved successfully');
 * }
 * ```
 * 
 * @author PromptCraft Forge Team
 * @version 1.0.0
 */
class ApiConfigService {
  /**
   * Save API key for a specific provider
   * @param provider - AI provider (openai, gemini, anthropic)
   * @param apiKey - The API key to save
   * @returns Promise with success status and error message if failed
   */
  async saveApiKey(provider: string, apiKey: string): Promise<ServiceResponse> {
    // Implementation
  }
}
```

---

## 📋 **Service Development Checklist**

### **Before Creating a New Service**
- [ ] **Identify Purpose**: Clearly define the service's purpose
- [ ] **Design Interface**: Define the service interface and methods
- [ ] **Plan Dependencies**: Identify required dependencies
- [ ] **Security Review**: Plan security considerations
- [ ] **Testing Strategy**: Plan testing approach

### **During Service Development**
- [ ] **Follow Patterns**: Use established service patterns
- [ ] **Error Handling**: Implement proper error handling
- [ ] **Input Validation**: Validate all inputs
- [ ] **Logging**: Add appropriate logging
- [ ] **Documentation**: Document all public methods

### **After Service Development**
- [ ] **Unit Tests**: Write comprehensive unit tests
- [ ] **Integration Tests**: Test service integration
- [ ] **Performance Testing**: Test service performance
- [ ] **Security Testing**: Verify security measures
- [ ] **Documentation**: Update service documentation

---

## 📚 **Resources & References**

### **Service Architecture**
- [Service Layer Pattern](https://martinfowler.com/eaaCatalog/serviceLayer.html)
- [Dependency Injection](https://martinfowler.com/articles/injection.html)
- [Singleton Pattern](https://refactoring.guru/design-patterns/singleton)

### **Error Handling**
- [Error Handling Best Practices](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Control_flow_and_error_handling)
- [TypeScript Error Handling](https://www.typescriptlang.org/docs/handbook/2/classes.html#error-handling)

### **Testing**
- [Jest Testing Framework](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)

---

**Last Updated**: January 2025  
**Version**: 1.0  
**Maintainer**: Development Team

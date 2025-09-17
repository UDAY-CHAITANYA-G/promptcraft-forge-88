# PromptCraft Forge - API Configuration & Prompt Generation Rulebook

## 📋 **Overview**
This rulebook defines the patterns, standards, and best practices for API configuration management and prompt generation functionality in the PromptCraft Forge application. It ensures consistent user experience, secure API key management, and efficient prompt generation workflows.

---

## 🔧 **API Configuration Architecture**

### **API Configuration System**
- **Provider Support**: OpenAI, Gemini, Anthropic
- **Storage**: Encrypted database storage via Supabase
- **Validation**: Real-time API key validation
- **Security**: Encryption at rest with secure key management

### **API Configuration Flow**
```typescript
// ✅ Good: API Configuration Flow Pattern
const ApiConfigFlow = {
  // 1. User authentication check
  authCheck: {
    authenticated: 'config-screen',
    unauthenticated: 'auth-redirect'
  },
  
  // 2. API key input and validation
  keyInput: {
    validate: 'real-time-validation',
    save: 'encrypted-storage',
    test: 'connection-test'
  },
  
  // 3. Configuration completion
  completion: {
    hasConfig: 'prompt-generator',
    noConfig: 'setup-required'
  }
}
```

### **API Configuration States**
- **Loading**: Initial configuration load
- **Empty**: No API keys configured
- **Partial**: Some API keys configured
- **Complete**: All desired API keys configured
- **Validating**: API key validation in progress
- **Error**: Configuration or validation error

---

## 🔑 **API Configuration Page Patterns**

### **API Configuration Page Structure**
```typescript
// ✅ Good: API Configuration Page Structure
const ApiConfigPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
      <Navbar />
      <div className="pt-20">
        <LeftSidebar showNavigation={true} />
        <main className="ml-64 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <ApiConfigHeader />
            <DatabaseStatus />
            <ApiKeyCards />
            <ConfigurationActions />
          </div>
        </main>
      </div>
    </div>
  )
}
```

### **API Key Card Pattern**
```typescript
// ✅ Good: API Key Card Pattern
const ApiKeyCard = ({ provider, apiKey, onUpdate, onValidate, validationResult }) => {
  const info = getModelInfo(provider)
  const Icon = info.icon
  const isValid = validationResult?.[provider]
  const isSaved = !!apiKey

  return (
    <Card className={`
      group relative overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:shadow-lg h-full
      ${isValid ? `ring-2 ${info.ringColor} bg-gradient-to-r ${info.bgColor} to-transparent` : 
      isSaved ? `ring-2 ${info.ringColor} bg-gradient-to-r ${info.bgColor} to-transparent` : 
      'hover:ring-2 hover:ring-primary/20 hover:bg-card-hover/50'
      }
      border-0 shadow-md hover:shadow-xl
    `}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-br ${info.color} rounded-full blur-xl`}></div>
        <div className={`absolute bottom-0 left-0 w-12 h-12 bg-gradient-to-tl ${info.color} rounded-full blur-lg opacity-20`}></div>
      </div>
      
      <CardHeader className="relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg bg-gradient-to-r ${info.gradient} shadow-lg`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold">{info.name}</CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                {info.description}
              </CardDescription>
            </div>
          </div>
          
          {/* Status Badge */}
          <div className="flex items-center space-x-2">
            {isValid ? (
              <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                <CheckCircle className="w-3 h-3 mr-1" />
                Valid
              </Badge>
            ) : isSaved ? (
              <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">
                <Key className="w-3 h-3 mr-1" />
                Saved
              </Badge>
            ) : (
              <Badge variant="outline" className="text-muted-foreground">
                Not Configured
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="relative space-y-4">
        <div className="space-y-2">
          <Label htmlFor={`${provider}-key`}>API Key</Label>
          <Input
            id={`${provider}-key`}
            type="password"
            placeholder={`Enter your ${info.name} API key`}
            value={apiKey}
            onChange={(e) => onUpdate(provider, e.target.value)}
            className="font-mono text-sm"
          />
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={() => onValidate(provider)}
            disabled={!apiKey || isValidating}
            className="flex-1"
            variant={isValid ? "default" : "outline"}
          >
            {isValidating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Validating...
              </>
            ) : (
              <>
                <Shield className="w-4 h-4 mr-2" />
                {isValid ? 'Validated' : 'Validate'}
              </>
            )}
          </Button>
          
          {isSaved && (
            <Button
              onClick={() => onRemove(provider)}
              variant="outline"
              size="sm"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              Remove
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
```

### **Database Status Pattern**
```typescript
// ✅ Good: Database Status Pattern
const DatabaseStatus = ({ dbStatus, onTestConnection }) => {
  if (!dbStatus) return null

  return (
    <Alert className={`
      ${dbStatus.connected && dbStatus.tableExists 
        ? 'border-green-500/50 bg-green-500/5' 
        : 'border-red-500/50 bg-red-500/5'
      }
    `}>
      <Database className={`
        h-4 w-4 
        ${dbStatus.connected && dbStatus.tableExists ? 'text-green-500' : 'text-red-500'}
      `} />
      <AlertDescription className={`
        text-sm 
        ${dbStatus.connected && dbStatus.tableExists ? 'text-green-600' : 'text-red-600'}
      `}>
        <span className="font-semibold">
          Database Status: {dbStatus.connected && dbStatus.tableExists ? 'Connected' : 'Issue Detected'}
        </span>
        {dbStatus.error && (
          <div className="mt-2">
            <p>{dbStatus.error}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2 border-red-500/30 text-red-600 hover:bg-red-500/10 text-xs h-6 px-2"
              onClick={onTestConnection}
            >
              Retry Connection
            </Button>
          </div>
        )}
      </AlertDescription>
    </Alert>
  )
}
```

### **Configuration Actions Pattern**
```typescript
// ✅ Good: Configuration Actions Pattern
const ConfigurationActions = ({ hasChanges, onSave, onCancel, isValidating }) => {
  return (
    <div className="flex justify-between items-center pt-6 border-t border-border/50">
      <div className="text-sm text-muted-foreground">
        {hasChanges ? (
          <span className="text-amber-600">You have unsaved changes</span>
        ) : (
          <span>All changes saved</span>
        )}
      </div>
      
      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={!hasChanges}
        >
          Cancel
        </Button>
        
        <Button
          onClick={onSave}
          disabled={!hasChanges || isValidating}
          className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
        >
          {isValidating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Key className="w-4 h-4 mr-2" />
              Save Configuration
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
```

---

## 🎯 **Prompt Generation Architecture**

### **Prompt Generation System**
- **Frameworks**: 9 proven prompt frameworks (R.O.S.E.S, A.P.E, T.A.G, etc.)
- **AI Models**: Multi-model support (OpenAI, Gemini, Anthropic)
- **Generation**: AI-powered prompt creation with framework structure
- **History**: Prompt generation history and management

### **Prompt Generation Flow**
```typescript
// ✅ Good: Prompt Generation Flow Pattern
const PromptGenerationFlow = {
  // 1. User input collection
  inputCollection: {
    framework: 'framework-selection',
    task: 'task-description',
    preferences: 'tone-length-settings'
  },
  
  // 2. Prompt generation
  generation: {
    validate: 'input-validation',
    generate: 'ai-generation',
    structure: 'framework-application'
  },
  
  // 3. Result handling
  resultHandling: {
    display: 'generated-prompt',
    copy: 'clipboard-functionality',
    save: 'history-storage'
  }
}
```

### **Prompt Generation States**
- **Input**: User entering task description
- **Generating**: AI generating prompt
- **Success**: Prompt generated successfully
- **Error**: Generation failed
- **History**: Viewing previous generations

---

## 🚀 **Prompt Generation Page Patterns**

### **Prompt Generation Page Structure**
```typescript
// ✅ Good: Prompt Generation Page Structure
const PromptGeneratorPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
      <Navbar />
      <div className="pt-20">
        <LeftSidebar showNavigation={true} />
        <main className="ml-64 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
              <TaskInputSection />
              <GeneratedPromptSection />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
```

### **Task Input Section Pattern**
```typescript
// ✅ Good: Task Input Section Pattern
const TaskInputSection = () => {
  return (
    <div className="space-y-6">
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5" />
            Task Input
          </CardTitle>
          <CardDescription>
            Describe your task and select your preferred framework
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <FrameworkSelection />
          <TaskDescription />
          <TaskPreferences />
          <GenerationActions />
        </CardContent>
      </Card>
    </div>
  )
}
```

### **Framework Selection Pattern**
```typescript
// ✅ Good: Framework Selection Pattern
const FrameworkSelection = ({ selectedFramework, onFrameworkChange }) => {
  return (
    <div className="space-y-4">
      <Label className="text-base font-semibold">Select Framework</Label>
      <div className="grid grid-cols-1 gap-3">
        {frameworks.map((framework) => (
          <Card
            key={framework.id}
            className={`
              cursor-pointer transition-all duration-200 hover:shadow-md
              ${selectedFramework?.id === framework.id 
                ? 'ring-2 ring-primary bg-primary/5' 
                : 'hover:ring-1 hover:ring-primary/20'
              }
            `}
            onClick={() => onFrameworkChange(framework)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg">{framework.name}</h3>
                    {framework.isDefault && (
                      <Badge variant="secondary" className="text-xs">
                        Default
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {framework.description}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {framework.components.map((component, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {component}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Best for: {framework.bestFor}
                  </p>
                </div>
                
                <div className="flex items-center">
                  {selectedFramework?.id === framework.id ? (
                    <CheckCircle className="w-5 h-5 text-primary" />
                  ) : (
                    <div className="w-5 h-5 border-2 border-muted-foreground/30 rounded-full" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
```

### **Task Description Pattern**
```typescript
// ✅ Good: Task Description Pattern
const TaskDescription = ({ taskInfo, onTaskChange }) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="task-description" className="text-base font-semibold">
          Task Description
        </Label>
        <Textarea
          id="task-description"
          placeholder="Describe what you want to create, analyze, or accomplish..."
          value={taskInfo.taskDescription}
          onChange={(e) => onTaskChange('taskDescription', e.target.value)}
          className="min-h-[120px] resize-none"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Be specific about your requirements</span>
          <span>{taskInfo.taskDescription.length}/500</span>
        </div>
      </div>
    </div>
  )
}
```

### **Task Preferences Pattern**
```typescript
// ✅ Good: Task Preferences Pattern
const TaskPreferences = ({ taskInfo, onTaskChange }) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="tone" className="text-sm font-medium">Tone</Label>
          <Select
            value={taskInfo.tone}
            onValueChange={(value) => onTaskChange('tone', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select tone" />
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
          <Label htmlFor="length" className="text-sm font-medium">Length</Label>
          <Select
            value={taskInfo.length}
            onValueChange={(value) => onTaskChange('length', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select length" />
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
    </div>
  )
}
```

### **Generated Prompt Section Pattern**
```typescript
// ✅ Good: Generated Prompt Section Pattern
const GeneratedPromptSection = ({ generatedPrompt, isGenerating, onCopy, copied }) => {
  return (
    <div className="space-y-6">
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Generated Prompt
          </CardTitle>
          <CardDescription>
            Your AI-generated prompt will appear here
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {isGenerating ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                <p className="text-muted-foreground">Generating your prompt...</p>
              </div>
            </div>
          ) : generatedPrompt ? (
            <div className="space-y-4">
              <div className="relative">
                <Textarea
                  value={generatedPrompt}
                  readOnly
                  className="min-h-[300px] font-mono text-sm bg-muted/50"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onCopy}
                  className="absolute top-2 right-2"
                >
                  {copied ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
              
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Generated using {activeModel?.toUpperCase()} and {selectedFramework?.name}</span>
                <span>{generatedPrompt.length} characters</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="space-y-4">
                <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Ready to Generate</h3>
                  <p className="text-muted-foreground">
                    Select a framework and describe your task to get started
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
```

---

## 🎨 **UI Component Patterns**

### **Loading States**
```typescript
// ✅ Good: API Configuration Loading State
const ApiConfigLoadingState = () => (
  <div className="flex items-center justify-center py-12">
    <div className="text-center space-y-4">
      <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
      <p className="text-muted-foreground">Loading configuration...</p>
    </div>
  </div>
)

// ✅ Good: Prompt Generation Loading State
const PromptGenerationLoadingState = () => (
  <div className="flex items-center justify-center py-12">
    <div className="text-center space-y-4">
      <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
      <p className="text-muted-foreground">Generating your prompt...</p>
      <div className="w-48 h-1 bg-muted rounded-full overflow-hidden">
        <div className="h-full bg-primary rounded-full animate-pulse" />
      </div>
    </div>
  </div>
)
```

### **Error States**
```typescript
// ✅ Good: API Configuration Error State
const ApiConfigErrorState = ({ error, onRetry }) => (
  <Alert className="border-red-500/50 bg-red-500/5">
    <AlertCircle className="h-4 w-4 text-red-500" />
    <AlertDescription className="text-red-600 text-sm">
      <span className="font-semibold">Configuration Error:</span> {error}
      <Button
        variant="outline"
        size="sm"
        className="ml-2 mt-1 border-red-500/30 text-red-600 hover:bg-red-500/10 text-xs h-6 px-2"
        onClick={onRetry}
      >
        Retry
      </Button>
    </AlertDescription>
  </Alert>
)

// ✅ Good: Prompt Generation Error State
const PromptGenerationErrorState = ({ error, onRetry }) => (
  <Alert className="border-red-500/50 bg-red-500/5">
    <AlertCircle className="h-4 w-4 text-red-500" />
    <AlertDescription className="text-red-600 text-sm">
      <span className="font-semibold">Generation Failed:</span> {error}
      <Button
        variant="outline"
        size="sm"
        className="ml-2 mt-1 border-red-500/30 text-red-600 hover:bg-red-500/10 text-xs h-6 px-2"
        onClick={onRetry}
      >
        Try Again
      </Button>
    </AlertDescription>
  </Alert>
)
```

### **Success States**
```typescript
// ✅ Good: API Configuration Success State
const ApiConfigSuccessState = ({ message }) => (
  <Alert className="border-green-500/50 bg-green-500/5">
    <CheckCircle className="h-4 w-4 text-green-500" />
    <AlertDescription className="text-green-600 text-sm">
      <span className="font-semibold">Success:</span> {message}
    </AlertDescription>
  </Alert>
)

// ✅ Good: Prompt Generation Success State
const PromptGenerationSuccessState = ({ model, framework }) => (
  <Alert className="border-green-500/50 bg-green-500/5">
    <CheckCircle className="h-4 w-4 text-green-500" />
    <AlertDescription className="text-green-600 text-sm">
      <span className="font-semibold">Prompt Generated!</span> Using {model?.toUpperCase()} and {framework?.name} framework
    </AlertDescription>
  </Alert>
)
```

---

## 🔄 **State Management Patterns**

### **API Configuration State**
```typescript
// ✅ Good: API Configuration State Management
interface ApiConfigState {
  configs: Record<string, string>
  loading: boolean
  error: string | null
  validationResults: Record<string, boolean>
  isValidating: boolean
  hasChanges: boolean
}

const useApiConfigState = () => {
  const [state, setState] = useState<ApiConfigState>({
    configs: {},
    loading: true,
    error: null,
    validationResults: {},
    isValidating: false,
    hasChanges: false
  })

  const updateConfig = (provider: string, value: string) => {
    setState(prev => ({
      ...prev,
      configs: { ...prev.configs, [provider]: value },
      hasChanges: true
    }))
  }

  const validateConfig = async (provider: string) => {
    setState(prev => ({ ...prev, isValidating: true }))
    
    try {
      const isValid = await validateApiKey(provider, state.configs[provider])
      setState(prev => ({
        ...prev,
        validationResults: { ...prev.validationResults, [provider]: isValid },
        isValidating: false
      }))
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error.message,
        isValidating: false
      }))
    }
  }

  return { state, updateConfig, validateConfig }
}
```

### **Prompt Generation State**
```typescript
// ✅ Good: Prompt Generation State Management
interface PromptGenerationState {
  selectedFramework: Framework | null
  taskInfo: TaskInfo
  generatedPrompt: string
  isGenerating: boolean
  error: string | null
  generationHistory: MCPResponse[]
  copied: boolean
}

const usePromptGenerationState = () => {
  const [state, setState] = useState<PromptGenerationState>({
    selectedFramework: null,
    taskInfo: {
      taskDescription: '',
      tone: 'professional',
      length: 'medium'
    },
    generatedPrompt: '',
    isGenerating: false,
    error: null,
    generationHistory: [],
    copied: false
  })

  const updateTaskInfo = (field: keyof TaskInfo, value: string) => {
    setState(prev => ({
      ...prev,
      taskInfo: { ...prev.taskInfo, [field]: value }
    }))
  }

  const generatePrompt = async () => {
    setState(prev => ({ ...prev, isGenerating: true, error: null }))
    
    try {
      const response = await mcpService.generatePrompt({
        frameworkId: state.selectedFramework?.id || 'roses',
        taskDescription: state.taskInfo.taskDescription,
        tone: state.taskInfo.tone,
        length: state.taskInfo.length
      })
      
      setState(prev => ({
        ...prev,
        generatedPrompt: response.prompt || '',
        isGenerating: false,
        generationHistory: [response, ...prev.generationHistory.slice(0, 9)]
      }))
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error.message,
        isGenerating: false
      }))
    }
  }

  return { state, updateTaskInfo, generatePrompt }
}
```

---

## 📱 **Responsive Design Patterns**

### **Mobile API Configuration**
```typescript
// ✅ Good: Mobile API Configuration Pattern
const MobileApiConfig = () => (
  <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
    <Navbar />
    <div className="pt-20 p-4">
      <div className="max-w-md mx-auto space-y-4">
        <ApiConfigHeader />
        <DatabaseStatus />
        <div className="space-y-4">
          {Object.entries(apiKeys).map(([provider, key]) => (
            <ApiKeyCard key={provider} provider={provider} apiKey={key} />
          ))}
        </div>
        <ConfigurationActions />
      </div>
    </div>
  </div>
)
```

### **Mobile Prompt Generation**
```typescript
// ✅ Good: Mobile Prompt Generation Pattern
const MobilePromptGenerator = () => (
  <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
    <Navbar />
    <div className="pt-20 p-4">
      <div className="max-w-md mx-auto space-y-6">
        <TaskInputSection />
        <GeneratedPromptSection />
      </div>
    </div>
  </div>
)
```

---

## 🔒 **Security Patterns**

### **API Key Validation**
```typescript
// ✅ Good: API Key Validation Pattern
const validateApiKey = async (provider: string, apiKey: string): Promise<boolean> => {
  if (!apiKey) return false
  
  try {
    const response = await apiConfigService.validateApiKey(provider, apiKey)
    return response.isValid
  } catch (error) {
    console.error('API key validation error:', error)
    return false
  }
}
```

### **Input Sanitization**
```typescript
// ✅ Good: Input Sanitization Pattern
const sanitizeTaskDescription = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .substring(0, 500) // Limit length
}
```

---

## 📊 **Analytics & Tracking**

### **API Configuration Events**
```typescript
// ✅ Good: API Configuration Event Tracking
const trackApiConfigEvent = (event: string, properties?: Record<string, any>) => {
  console.log('API Config Event:', event, properties)
  
  // Example events:
  // - 'api_key_added'
  // - 'api_key_validated'
  // - 'api_key_removed'
  // - 'configuration_saved'
  // - 'validation_failed'
}

// Usage in components
const handleSaveConfig = async () => {
  try {
    await saveConfiguration()
    trackApiConfigEvent('configuration_saved', { 
      providers: Object.keys(configs),
      hasAllProviders: Object.keys(configs).length === 3
    })
  } catch (error) {
    trackApiConfigEvent('configuration_save_failed', { error: error.message })
  }
}
```

### **Prompt Generation Events**
```typescript
// ✅ Good: Prompt Generation Event Tracking
const trackPromptGenerationEvent = (event: string, properties?: Record<string, any>) => {
  console.log('Prompt Generation Event:', event, properties)
  
  // Example events:
  // - 'prompt_generation_started'
  // - 'prompt_generated'
  // - 'prompt_copied'
  // - 'framework_selected'
  // - 'generation_failed'
}

// Usage in components
const handleGeneratePrompt = async () => {
  trackPromptGenerationEvent('prompt_generation_started', {
    framework: selectedFramework?.id,
    taskLength: taskInfo.taskDescription.length,
    tone: taskInfo.tone,
    length: taskInfo.length
  })
  
  try {
    const response = await generatePrompt()
    trackPromptGenerationEvent('prompt_generated', {
      framework: selectedFramework?.id,
      model: response.model,
      promptLength: response.prompt?.length,
      success: response.success
    })
  } catch (error) {
    trackPromptGenerationEvent('generation_failed', { error: error.message })
  }
}
```

---

## 🧪 **Testing Patterns**

### **API Configuration Testing**
```typescript
// ✅ Good: API Configuration Test Pattern
describe('API Configuration', () => {
  it('should validate API keys correctly', async () => {
    render(<ApiConfigPage />)
    
    fireEvent.change(screen.getByLabelText('OpenAI API Key'), {
      target: { value: 'sk-test-key' }
    })
    
    fireEvent.click(screen.getByText('Validate'))
    
    await waitFor(() => {
      expect(screen.getByText('Valid')).toBeInTheDocument()
    })
  })
  
  it('should save configuration successfully', async () => {
    render(<ApiConfigPage />)
    
    // Fill in API keys
    fireEvent.change(screen.getByLabelText('OpenAI API Key'), {
      target: { value: 'sk-test-key' }
    })
    
    fireEvent.click(screen.getByText('Save Configuration'))
    
    await waitFor(() => {
      expect(screen.getByText('Configuration saved successfully')).toBeInTheDocument()
    })
  })
})
```

### **Prompt Generation Testing**
```typescript
// ✅ Good: Prompt Generation Test Pattern
describe('Prompt Generation', () => {
  it('should generate prompt with selected framework', async () => {
    render(<PromptGeneratorPage />)
    
    // Select framework
    fireEvent.click(screen.getByText('R.O.S.E.S'))
    
    // Enter task description
    fireEvent.change(screen.getByLabelText('Task Description'), {
      target: { value: 'Create a marketing strategy for a new product' }
    })
    
    // Generate prompt
    fireEvent.click(screen.getByText('Generate Prompt'))
    
    await waitFor(() => {
      expect(screen.getByText('Generated using R.O.S.E.S framework')).toBeInTheDocument()
    })
  })
  
  it('should copy generated prompt to clipboard', async () => {
    render(<PromptGeneratorPage />)
    
    // Mock clipboard API
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn().mockImplementation(() => Promise.resolve())
      }
    })
    
    fireEvent.click(screen.getByText('Copy'))
    
    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(generatedPrompt)
      expect(screen.getByText('Copied!')).toBeInTheDocument()
    })
  })
})
```

---

## 📋 **Implementation Checklist**

### **API Configuration Setup**
- [ ] **API key input forms** implemented with validation
- [ ] **Real-time validation** implemented for all providers
- [ ] **Encrypted storage** implemented for API keys
- [ ] **Database connection testing** implemented
- [ ] **Error handling** implemented for all operations

### **Prompt Generation Setup**
- [ ] **Framework selection** implemented with all 9 frameworks
- [ ] **Task input forms** implemented with validation
- [ ] **AI generation service** integrated
- [ ] **Result display** implemented with copy functionality
- [ ] **History management** implemented

### **UI Components**
- [ ] **Loading states** implemented for all async operations
- [ ] **Error states** implemented with user-friendly messages
- [ ] **Success states** implemented with appropriate feedback
- [ ] **Responsive design** implemented for mobile devices
- [ ] **Accessibility** implemented with proper ARIA labels

### **Security**
- [ ] **API key encryption** implemented before storage
- [ ] **Input validation** implemented for all forms
- [ ] **XSS prevention** implemented with input sanitization
- [ ] **Rate limiting** implemented for API calls
- [ ] **Error handling** implemented without exposing sensitive data

### **Testing**
- [ ] **Unit tests** implemented for configuration logic
- [ ] **Integration tests** implemented for API services
- [ ] **E2E tests** implemented for complete workflows
- [ ] **Accessibility tests** implemented for UI components
- [ ] **Performance tests** implemented for generation operations

---

## 🚀 **Best Practices**

### **API Configuration Best Practices**
- **Always validate API keys** before saving
- **Use encrypted storage** for sensitive data
- **Provide clear error messages** for validation failures
- **Implement real-time feedback** for user actions
- **Test database connections** regularly

### **Prompt Generation Best Practices**
- **Validate user input** before generation
- **Provide framework guidance** to help users choose
- **Implement request cancellation** for long operations
- **Cache generation results** for better performance
- **Provide copy functionality** for generated prompts

### **UI/UX Best Practices**
- **Progressive disclosure** to avoid overwhelming users
- **Clear visual feedback** for all user actions
- **Consistent navigation** across all pages
- **Responsive design** for all device sizes
- **Accessibility compliance** for all users

### **Security Best Practices**
- **Never store API keys** in plain text
- **Validate all inputs** to prevent injection attacks
- **Use HTTPS** for all API communications
- **Implement proper error handling** without exposing sensitive data
- **Regular security audits** of configuration and generation systems

---

## 📚 **Resources & References**

### **Documentation**
- [Supabase Documentation](https://supabase.com/docs)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Google AI Documentation](https://ai.google.dev/docs)
- [Anthropic API Documentation](https://docs.anthropic.com/)

### **Security Resources**
- [OWASP API Security](https://owasp.org/www-project-api-security/)
- [Web Security Best Practices](https://web.dev/security/)
- [React Security Guidelines](https://react.dev/learn/security)

### **UI/UX Resources**
- [Material Design Guidelines](https://material.io/design)
- [Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Mobile-First Design](https://web.dev/responsive-web-design-basics/)

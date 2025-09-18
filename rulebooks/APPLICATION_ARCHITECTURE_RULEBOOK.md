# PromptCraft Forge - Application Architecture Rulebook

## 📋 **Overview**
This rulebook defines the architectural patterns, structural guidelines, and styling standards for the PromptCraft Forge application. It serves as the authoritative guide for maintaining consistency and quality across the codebase.

---

## 🏗️ **Application Architecture**

### **Technology Stack**
- **Frontend**: React 18 + TypeScript + Vite
- **UI Framework**: shadcn/ui + Tailwind CSS
- **State Management**: React Context + React Query
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **Email Service**: EmailJS
- **Build Tool**: Vite
- **Package Manager**: npm

### **Project Structure**
```
src/
├── components/          # React components
│   ├── ui/             # shadcn/ui base components
│   └── [feature].tsx   # Feature-specific components
├── hooks/              # Custom React hooks
├── services/           # Application services layer
│   ├── services.ts     # Main entry point
│   └── lib/            # Individual service implementations
├── config/             # Configuration system
│   ├── index.ts        # Centralized configuration exports
│   ├── app.config.ts   # Application-wide configuration
│   └── environment.config.ts # Environment-specific settings
├── pages/              # Route components
├── integrations/       # External service integrations
│   └── supabase/       # Supabase client and types
└── assets/             # Static assets
```

---

## 🎯 **Component Architecture Standards**

### **Component Organization**

#### **1. UI Components (`src/components/ui/`)**
- **Purpose**: Base design system components from shadcn/ui
- **Pattern**: Atomic design principles
- **Styling**: Tailwind CSS with CSS variables
- **Props**: Extend native HTML attributes with TypeScript

```typescript
// ✅ Good: UI Component Pattern
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
```

#### **2. Feature Components (`src/components/`)**
- **Purpose**: Business logic components
- **Pattern**: Single responsibility principle
- **Props**: Well-defined TypeScript interfaces
- **Styling**: Use UI components + custom Tailwind classes

```typescript
// ✅ Good: Feature Component Pattern
interface HeroSectionProps {
  onStartCreatingPrompts: () => void
  isLoading: boolean
  user?: User
}

export function HeroSection({ onStartCreatingPrompts, isLoading, user }: HeroSectionProps) {
  // Component logic here
}
```

#### **3. Page Components (`src/pages/`)**
- **Purpose**: Route-level components
- **Pattern**: Container components that orchestrate features
- **Structure**: Layout + Feature components
- **Navigation**: Use React Router hooks

```typescript
// ✅ Good: Page Component Pattern
const Index = () => {
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20">
        <LeftSidebar showNavigation={false} />
        <HeroSection onStartCreatingPrompts={handleStartCreatingPrompts} />
      </div>
    </div>
  )
}
```

### **Component Standards**

#### **Props Interface**
- [ ] **Always define TypeScript interfaces** for component props
- [ ] **Use descriptive names** that indicate the component's purpose
- [ ] **Extend native HTML attributes** when appropriate
- [ ] **Make optional props explicit** with `?` operator

#### **Component Structure**
- [ ] **Single responsibility** - Each component has one clear purpose
- [ ] **Composition over inheritance** - Build complex components from simple ones
- [ ] **Forward refs** for UI components that need DOM access
- [ ] **Display names** for better debugging

#### **State Management**
- [ ] **Local state** for component-specific data
- [ ] **Context** for shared application state
- [ ] **React Query** for server state management
- [ ] **Custom hooks** for reusable state logic

### **Request Management**
- [ ] **AbortController** for canceling in-flight requests
- [ ] **Request deduplication** to prevent duplicate API calls
- [ ] **Caching strategies** with appropriate cache invalidation
- [ ] **Error recovery** with retry mechanisms

---

## 🔧 **Service Layer Architecture**

### **Service Organization (`src/services/`)**

#### **1. Service Classes**
- **Pattern**: Class-based services with singleton pattern
- **Purpose**: Encapsulate business logic and API interactions
- **Error Handling**: Consistent error handling with proper types
- **Entry Point**: Single import point via `@/services/services`

```typescript
// ✅ Good: Service Class Pattern
class MCPService {
  private static instance: MCPService | null = null;
  
  static getInstance(): MCPService {
    if (!MCPService.instance) {
      MCPService.instance = new MCPService();
    }
    return MCPService.instance;
  }
  
  private constructor() {
    // Initialize service
  }

  async generatePrompt(request: MCPRequest): Promise<MCPResponse> {
    try {
      // Implementation
      return { success: true, prompt: generatedPrompt }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }
}

export const mcpService = MCPService.getInstance()
```

#### **2. Service Interfaces**
- **Purpose**: Define contracts for service methods
- **Pattern**: Request/Response interfaces
- **Validation**: Use Zod or similar for runtime validation

```typescript
// ✅ Good: Service Interface Pattern
export interface MCPRequest {
  frameworkId: string
  taskDescription: string
  tone?: string
  length?: string
  vibeCoding?: boolean
}

export interface MCPResponse {
  success: boolean
  prompt?: string
  error?: string
  model?: string
  framework?: string
}
```

### **Service Standards**

#### **Service Import Patterns**
- [ ] **Single entry point** - Import from `@/services/services`
- [ ] **Type-safe imports** - Include TypeScript interfaces
- [ ] **Service categories** - Use `coreServices`, `userServices`, etc.
- [ ] **Dynamic loading** - Use service registry for lazy loading

#### **Error Handling**
- [ ] **Consistent error format** across all services
- [ ] **Proper error types** - no `any` types
- [ ] **Graceful degradation** - services should handle failures gracefully
- [ ] **Logging** - Log errors for debugging

#### **API Integration**
- [ ] **Type-safe API calls** with proper TypeScript interfaces
- [ ] **Request/Response validation** using interfaces
- [ ] **Timeout handling** for external API calls
- [ ] **Retry logic** for transient failures

#### **Data Management**
- [ ] **Encryption** for sensitive data (API keys)
- [ ] **Validation** of input data
- [ ] **Sanitization** of user inputs
- [ ] **Caching** where appropriate

#### **Service Management**
- [ ] **Service initialization** - Use `initializeServices()`
- [ ] **Health monitoring** - Use `getServicesHealth()`
- [ ] **Service registry** - Use `getService()` for dynamic loading
- [ ] **Singleton pattern** - For stateful services

### **Configuration Integration**
- [ ] **Environment variables** - Use centralized configuration system
- [ ] **Feature flags** - Use `isFeatureEnabled()` for conditional features
- [ ] **Provider configuration** - Use `getProviderConfig()` for dynamic providers
- [ ] **Configuration validation** - Validate configuration on startup

### **Database Integration**
- [ ] **Row Level Security** - All tables must have RLS enabled with comprehensive policies
- [ ] **Type Safety** - Use generated TypeScript types for database operations
- [ ] **Service Pattern** - Use singleton pattern for database services
- [ ] **Error Handling** - Consistent error handling for database operations
- [ ] **Migration Strategy** - Follow structured migration approach with modular schema files
- [ ] **Performance Optimization** - Implement strategic indexing and query optimization
- [ ] **Analytics Integration** - Use built-in analytics and monitoring systems
- [ ] **Maintenance Procedures** - Follow automated maintenance and health monitoring

---

## 🎨 **Styling Architecture**

### **Design System**

#### **1. CSS Variables**
- **Purpose**: Consistent theming and customization
- **Location**: `src/index.css`
- **Pattern**: HSL color values with semantic naming

```css
/* ✅ Good: CSS Variable Pattern */
:root {
  --background: 0 0% 100%;
  --foreground: 240 10% 3.9%;
  --primary: 262 83% 58%;
  --primary-foreground: 0 0% 98%;
}
```

#### **2. Tailwind Configuration**
- **Purpose**: Extend Tailwind with custom design tokens
- **Location**: `tailwind.config.ts`
- **Pattern**: Semantic color names and custom utilities

```typescript
// ✅ Good: Tailwind Config Pattern
export default {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
          glow: 'hsl(var(--primary-glow))'
        }
      }
    }
  }
}
```

### **Styling Standards**

#### **Component Styling**
- [ ] **Use shadcn/ui components** as base
- [ ] **Extend with Tailwind classes** for customization
- [ ] **Use CSS variables** for theming
- [ ] **Responsive design** with mobile-first approach

#### **Class Organization**
- [ ] **Group related classes** together
- [ ] **Use `cn()` utility** for conditional classes
- [ ] **Avoid inline styles** - use Tailwind classes
- [ ] **Consistent spacing** using design system tokens

#### **Animation & Transitions**
- [ ] **Use Tailwind transition classes** for consistency
- [ ] **Custom animations** defined in Tailwind config
- [ ] **Performance considerations** - avoid expensive animations
- [ ] **Accessibility** - respect `prefers-reduced-motion`

---

## 🔐 **Authentication & Security**

### **Authentication Flow**
- **Provider**: Supabase Auth
- **Pattern**: Context-based authentication
- **Storage**: Local storage with automatic refresh
- **UI Flow**: Comprehensive authentication and home page patterns (see Authentication & UI Flow Rulebook)

```typescript
// ✅ Good: Auth Hook Pattern
export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )
    return () => subscription.unsubscribe()
  }, [])
  
  return { user, loading, signIn, signOut }
}
```

### **Security Standards**
- [ ] **Row Level Security (RLS)** enabled on all Supabase tables
- [ ] **Input validation** on all user inputs
- [ ] **API key encryption** in storage
- [ ] **HTTPS only** in production
- [ ] **Error boundaries** to prevent information leakage

---

## 📊 **Data Management**

### **Database Schema**
- **Provider**: Supabase PostgreSQL with restructured modular system
- **Pattern**: Normalized schema with proper relationships and comprehensive analytics
- **Security**: Advanced RLS policies with encryption and audit logging
- **Performance**: Strategic indexing, materialized views, and query optimization
- **Maintenance**: Automated maintenance, health monitoring, and cleanup operations
- **Analytics**: Built-in analytics system with usage tracking and performance metrics

#### **Table Standards**
- [ ] **UUID primary keys** for all tables
- [ ] **Timestamps** (`created_at`, `updated_at`) on all tables
- [ ] **Foreign key constraints** for data integrity
- [ ] **Indexes** on frequently queried columns

### **Data Access Patterns**
- [ ] **Service layer** for all database operations
- [ ] **Type-safe queries** using Supabase TypeScript types
- [ ] **Error handling** for database operations
- [ ] **Optimistic updates** where appropriate

---

## 🚀 **Performance Standards**

### **Bundle Optimization**
- [ ] **Code splitting** for route-based components
- [ ] **Lazy loading** for heavy components
- [ ] **Tree shaking** - remove unused code
- [ ] **Bundle analysis** - monitor bundle size

### **Runtime Performance**
- [ ] **React.memo** for expensive components
- [ ] **useCallback** for functions passed as props
- [ ] **useMemo** for expensive calculations
- [ ] **Virtual scrolling** for large lists

### **Loading States**
- [ ] **Skeleton screens** for better perceived performance
- [ ] **Loading indicators** for async operations
- [ ] **Error boundaries** for graceful error handling
- [ ] **Progressive enhancement** - core functionality works without JS

---

## 🧪 **Testing Architecture**

### **Testing Strategy**
- **Unit Tests**: Individual functions and components
- **Integration Tests**: Service layer and API interactions
- **E2E Tests**: Critical user flows
- **Visual Tests**: Component appearance and behavior

### **Testing Standards**
- [ ] **Test coverage** for critical business logic
- [ ] **Mock external dependencies** in tests
- [ ] **Test error scenarios** and edge cases
- [ ] **Accessibility testing** for UI components

---

## 📝 **Code Organization**

### **Import Organization**
```typescript
// ✅ Good: Import Order
// 1. React and React-related imports
import React, { useState, useEffect } from 'react'

// 2. Third-party libraries
import { useNavigate } from 'react-router-dom'

// 3. Internal components (UI first, then feature components)
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { HeroSection } from '@/components/HeroSection'

// 4. Hooks and services
import { useAuth } from '@/hooks/useAuth'
import { mcpService } from '@/lib/mcpService'

// 5. Types and utilities
import { cn } from '@/lib/utils'
```

### **File Naming**
- [ ] **PascalCase** for component files (`HeroSection.tsx`)
- [ ] **camelCase** for utility files (`apiConfigService.ts`)
- [ ] **kebab-case** for configuration files (`tailwind.config.ts`)
- [ ] **Descriptive names** that indicate purpose

---

## 🔄 **State Management Patterns**

### **Local State**
```typescript
// ✅ Good: Local State Pattern
const [isLoading, setIsLoading] = useState(false)
const [data, setData] = useState<DataType | null>(null)
```

### **Context State**
```typescript
// ✅ Good: Context Pattern
interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<AuthResult>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)
```

### **Server State (React Query)**
```typescript
// ✅ Good: React Query Pattern
const { data, isLoading, error } = useQuery({
  queryKey: ['user-preferences', user?.id],
  queryFn: () => userPreferencesService.getUserPreferences(),
  enabled: !!user
})
```

---

## 🎯 **Framework-Specific Patterns**

### **Prompt Frameworks**
- **Location**: `src/lib/userPreferencesService.ts`
- **Pattern**: Configuration-driven framework system
- **Extensibility**: Easy to add new frameworks

```typescript
// ✅ Good: Framework Pattern
export interface FrameworkInfo {
  id: string
  name: string
  description: string
  components: string[]
  bestFor: string
  isDefault?: boolean
}

export const frameworks: FrameworkInfo[] = [
  {
    id: "roses",
    name: "R.O.S.E.S",
    description: "Role, Objective, Scenario, Expected output, Short form",
    components: ["Role", "Objective", "Scenario", "Expected output", "Short form"],
    bestFor: "Complex tasks requiring detailed context",
    isDefault: true
  }
]
```

### **Master Prompt System**
- **Purpose**: Generate context-aware prompts for different AI models
- **Pattern**: Model-specific prompt templates
- **Flexibility**: Support for multiple AI providers

### **AI Provider Integration**
- **Multi-Provider Support**: OpenAI, Gemini, Anthropic
- **Model Selection**: Dynamic model configuration per user
- **API Key Management**: Encrypted storage and validation
- **Rate Limiting**: Proper handling of API limits and quotas
- **Configuration & Generation**: Comprehensive API configuration and prompt generation patterns (see API Configuration & Prompt Generation Rulebook)

```typescript
// ✅ Good: AI Provider Integration Pattern
class MCPService {
  async generatePrompt(request: MCPRequest): Promise<MCPResponse> {
    const modelConfig = await this.getActiveModelConfig()
    
    switch (modelConfig.provider) {
      case 'openai':
        return await this.callOpenAI(modelConfig, promptRequest)
      case 'gemini':
        return await this.callGemini(modelConfig, promptRequest)
      case 'anthropic':
        return await this.callAnthropic(modelConfig, promptRequest)
      default:
        throw new Error(`Unsupported model: ${modelConfig.provider}`)
    }
  }
}
```

### **Custom Hooks Patterns**
- **Service Integration**: Hooks that wrap service calls with state management
- **Request Cancellation**: AbortController integration for canceling requests
- **Caching**: Built-in caching with cache invalidation
- **Error Handling**: Consistent error handling with toast notifications

```typescript
// ✅ Good: Custom Hook Pattern
export const useMCP = () => {
  const [state, setState] = useState<MCPState>({
    isGenerating: false,
    lastResponse: null,
    generationHistory: [],
    error: null,
  });
  const abortControllerRef = useRef<AbortController | null>(null);

  const generatePrompt = useCallback(async (request: MCPRequest) => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    
    try {
      const response = await mcpService.generatePrompt(request);
      // Handle success
    } catch (error) {
      // Handle error
    }
  }, []);

  return { ...state, generatePrompt };
};
```

---

## ⚛️ **React Patterns & Best Practices**

### **Component Lifecycle Management**
- [ ] **useEffect Dependencies**: Always include all dependencies in dependency arrays
- [ ] **Cleanup Functions**: Return cleanup functions from useEffect for subscriptions
- [ ] **Conditional Effects**: Use conditional logic to prevent unnecessary effect runs
- [ ] **Effect Ordering**: Order effects logically (data loading before UI updates)

```typescript
// ✅ Good: Effect with Proper Dependencies
useEffect(() => {
  if (user && hasAnyConfig) {
    loadUserData();
  }
}, [user, hasAnyConfig, loadUserData]);

// ✅ Good: Effect with Cleanup
useEffect(() => {
  const unsubscribe = userPreferencesService.subscribe((preferences) => {
    setUserPreferences(preferences);
  });
  
  return unsubscribe;
}, [user, hasAnyConfig]);
```

### **State Management Patterns**
- [ ] **State Structure**: Keep related state together in single state objects
- [ ] **State Updates**: Use functional updates for state that depends on previous state
- [ ] **State Initialization**: Initialize state with proper default values
- [ ] **State Validation**: Validate state updates before applying them

```typescript
// ✅ Good: Structured State
interface MCPState {
  isGenerating: boolean;
  lastResponse: MCPResponse | null;
  generationHistory: MCPResponse[];
  error: string | null;
}

// ✅ Good: Functional State Updates
setState(prev => ({
  ...prev,
  isGenerating: false,
  lastResponse: response,
  generationHistory: [response, ...prev.generationHistory.slice(0, 9)],
  error: null,
}));
```

### **Performance Optimization**
- [ ] **useCallback**: Wrap functions passed as props or dependencies
- [ ] **useMemo**: Memoize expensive calculations
- [ ] **React.memo**: Memoize components that receive stable props
- [ ] **Lazy Loading**: Use React.lazy for code splitting

```typescript
// ✅ Good: useCallback for Stable References
const generatePrompt = useCallback(async (request: MCPRequest) => {
  // Implementation
}, []);

// ✅ Good: useMemo for Expensive Calculations
const filteredHistory = useMemo(() => {
  return history.filter(entry => 
    entry.task_description.toLowerCase().includes(searchTerm.toLowerCase())
  );
}, [history, searchTerm]);
```

### **Error Handling Patterns**
- [ ] **Error Boundaries**: Use error boundaries for component tree error handling
- [ ] **Try-Catch**: Wrap async operations in try-catch blocks
- [ ] **Error State**: Maintain error state in components
- [ ] **User Feedback**: Show user-friendly error messages

```typescript
// ✅ Good: Error Boundary
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App Error:', error, errorInfo);
  }
}

// ✅ Good: Component Error Handling
try {
  const response = await mcpService.generatePrompt(request);
  // Handle success
} catch (error) {
  setState(prev => ({
    ...prev,
    error: error instanceof Error ? error.message : 'Unknown error',
    isGenerating: false,
  }));
}
```

### **Navigation & Routing**
- [ ] **Protected Routes**: Check authentication before rendering protected components
- [ ] **Route Guards**: Implement route guards for access control
- [ ] **Navigation Hooks**: Use useNavigate for programmatic navigation
- [ ] **Route Parameters**: Handle route parameters safely

```typescript
// ✅ Good: Protected Route Pattern
useEffect(() => {
  if (!user) {
    navigate('/auth');
    return;
  }
  
  if (!loading && !hasAnyConfig) {
    navigate('/api-config');
  }
}, [user, navigate, loading, hasAnyConfig]);
```

---

## 📋 **Development Workflow**

### **Before Starting Development**
1. **Read this rulebook** and understand the patterns
2. **Check existing components** for similar functionality
3. **Plan the component structure** and data flow
4. **Identify required services** and interfaces

### **During Development**
1. **Follow naming conventions** consistently
2. **Use TypeScript interfaces** for all props and data
3. **Implement error handling** for all async operations
4. **Add loading states** for better UX

### **Before Committing**
1. **Run linting** (`npm run lint`)
2. **Check build** (`npm run build`)
3. **Test functionality** manually
4. **Update documentation** if needed

---

## 🚨 **Common Anti-Patterns to Avoid**

### **❌ Don't Do This**
```typescript
// ❌ Bad: Any types
const [data, setData] = useState<any>(null)

// ❌ Bad: Inline styles
<div style={{ color: 'red', fontSize: '16px' }}>

// ❌ Bad: Direct DOM manipulation
document.getElementById('button').addEventListener('click', handler)

// ❌ Bad: Missing error handling
const result = await apiCall() // No try-catch

// ❌ Bad: Hardcoded values
if (user.role === 'admin') // Should use constants
```

### **✅ Do This Instead**
```typescript
// ✅ Good: Proper types
const [data, setData] = useState<UserData | null>(null)

// ✅ Good: Tailwind classes
<div className="text-red-500 text-base">

// ✅ Good: React event handlers
<button onClick={handleClick}>

// ✅ Good: Error handling
try {
  const result = await apiCall()
} catch (error) {
  // Handle error
}

// ✅ Good: Constants
if (user.role === USER_ROLES.ADMIN)
```

---

## 🚀 **Deployment & Environment Management**

### **Environment Configuration**
- **Development**: Local development with hot reload
- **Production**: Lovable platform deployment
- **Environment Variables**: Secure configuration management

#### **Environment Variables Pattern**
```typescript
// ✅ Good: Environment Variable Usage
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing required environment variables')
}
```

#### **Configuration Files**
- **Public Config**: `src/lib/emailConfig.ts` - Non-sensitive configuration
- **Private Config**: `src/lib/emailConfig.private.ts` - Sensitive credentials (gitignored)
- **Template Config**: `src/lib/emailConfig.private.template.ts` - Template for setup

### **Deployment Standards**
- [ ] **Environment variables** properly configured for each environment
- [ ] **Build optimization** with Vite production builds
- [ ] **Asset optimization** for production deployment
- [ ] **Error monitoring** in production environments
- [ ] **Performance monitoring** and analytics

### **Build Configuration**
```typescript
// ✅ Good: Vite Configuration Pattern
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}))
```

---

## 🔧 **Development Tools & Scripts**

### **Package Scripts**
- **Development**: `npm run dev` - Start development server
- **Build**: `npm run build` - Production build
- **Lint**: `npm run lint` - Code quality checks
- **Preview**: `npm run preview` - Preview production build
- **Setup**: `npm run setup-emailjs` - Configure EmailJS

### **Development Workflow**
```bash
# ✅ Good: Development Workflow
npm install          # Install dependencies
npm run dev          # Start development
npm run lint         # Check code quality
npm run build        # Build for production
npm run preview      # Preview production build
```

### **Code Quality Tools**
- **ESLint**: Code linting and style enforcement
- **TypeScript**: Type checking and safety
- **Prettier**: Code formatting (via ESLint)
- **Lovable Tagger**: Component tagging for development

---

## 📊 **Monitoring & Analytics**

### **Error Tracking**
- **Error Boundaries**: React error boundaries for graceful error handling
- **Console Logging**: Structured logging for debugging
- **User Feedback**: EmailJS feedback system for user reports

### **Performance Monitoring**
- **Bundle Analysis**: Monitor bundle size and performance
- **Loading States**: Proper loading indicators for better UX
- **Caching Strategy**: React Query for efficient data caching

### **Analytics Integration**
- **User Behavior**: Track user interactions and flows
- **Performance Metrics**: Monitor app performance and load times
- **Error Rates**: Track and monitor error occurrences

---

## 🔒 **Security Best Practices**

### **API Key Management**
- **Encryption**: API keys encrypted in database
- **Environment Variables**: Sensitive data in environment variables
- **Gitignore**: Private configuration files excluded from version control

```typescript
// ✅ Good: Secure API Key Storage
const apiKey = await apiConfigService.getEncryptedApiKey(provider)
// Never store API keys in plain text
```

### **Data Protection**
- **Row Level Security**: Supabase RLS policies for data access
- **Input Validation**: Validate all user inputs
- **XSS Prevention**: Sanitize user-generated content
- **CSRF Protection**: Implement CSRF tokens where needed

### **Authentication Security**
- **JWT Tokens**: Secure token-based authentication
- **Session Management**: Proper session handling and expiration
- **Password Policies**: Strong password requirements
- **OAuth Integration**: Secure third-party authentication

---

## 🧪 **Testing Strategy**

### **Testing Levels**
- **Unit Tests**: Individual functions and components
- **Integration Tests**: Service layer and API interactions
- **E2E Tests**: Complete user workflows
- **Visual Tests**: Component appearance and behavior

### **Testing Tools**
- **Jest**: Unit testing framework
- **React Testing Library**: Component testing
- **Cypress**: End-to-end testing
- **Storybook**: Component documentation and testing

### **Testing Standards**
- [ ] **Test coverage** for critical business logic
- [ ] **Mock external dependencies** in tests
- [ ] **Test error scenarios** and edge cases
- [ ] **Accessibility testing** for UI components
- [ ] **Performance testing** for critical paths

---

## 📚 **Resources & References**

### **Documentation**
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)
- [Supabase Documentation](https://supabase.com/docs)

### **Internal Resources**
- [Code Review Checklist](./CODE_REVIEW_CHECKLIST.md)
- [API Documentation](../docs/)
- [Database Schema](../supabase/) - Restructured modular database system with comprehensive documentation

---

**Last Updated**: September 18th, 2025  
**Version**: 1.0  
**Maintainer**: Development Team

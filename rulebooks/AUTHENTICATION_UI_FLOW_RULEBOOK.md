# PromptCraft Forge - Authentication & UI Flow Rulebook

## 📋 **Overview**
This rulebook defines the authentication patterns, user interface flows, and home page standards for the PromptCraft Forge application. It ensures consistent user experience, secure authentication, and intuitive navigation throughout the application.

---

## 🔐 **Authentication Architecture**

### **Authentication Provider**
- **Provider**: Supabase Auth
- **Methods**: Email/Password, Google OAuth
- **Session Management**: Automatic token refresh, persistent sessions
- **Storage**: LocalStorage for session persistence

### **Authentication Flow**
```typescript
// ✅ Good: Authentication Flow Pattern
const AuthFlow = {
  // 1. User visits app
  initial: 'homepage',
  
  // 2. Authentication check
  authCheck: {
    authenticated: 'dashboard',
    unauthenticated: 'auth-page'
  },
  
  // 3. Configuration check
  configCheck: {
    hasConfig: 'prompt-generator',
    noConfig: 'api-config'
  },
  
  // 4. Final destination
  destination: 'prompt-generator'
}
```

### **Authentication States**
- **Loading**: Initial authentication check
- **Authenticated**: User is signed in
- **Unauthenticated**: User needs to sign in
- **Email Verification**: Pending email verification
- **Error**: Authentication error state

---

## 🏠 **Home Page Architecture**

### **Home Page Structure**
```typescript
// ✅ Good: Home Page Component Structure
const HomePage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />                    {/* Global navigation */}
      <div className="pt-20">       {/* Account for fixed navbar */}
        <LeftSidebar />             {/* Optional sidebar */}
        <main>
          <HeroSection />           {/* Main hero content */}
          <FeaturesSection />       {/* Feature showcase */}
          <ProcessFlow />           {/* How it works */}
          <Footer />                {/* Footer content */}
        </main>
      </div>
    </div>
  )
}
```

### **Home Page States**
- **Loading**: Authentication and configuration check
- **Unauthenticated**: Show public homepage with sign-up CTA
- **Authenticated + No Config**: Show setup flow
- **Authenticated + Configured**: Show dashboard access

### **Home Page Navigation Logic**
```typescript
// ✅ Good: Home Page Navigation Pattern
const handleStartCreatingPrompts = () => {
  if (!user) {
    // Redirect to authentication
    toast({
      title: "Authentication Required",
      description: "Please sign in to start creating prompts",
    })
    navigate('/auth')
    return
  }

  if (configLoading) {
    // Wait for configuration check
    return
  }

  if (hasAnyConfig) {
    // User has API keys configured
    toast({
      title: "Welcome Back!",
      description: "Taking you to the prompt generator",
    })
    navigate('/prompt-generator')
  } else {
    // User needs to configure API keys
    toast({
      title: "Setup Required",
      description: "Let's configure your API keys first",
    })
    navigate('/api-config')
  }
}
```

---

## 🔑 **Authentication Page Patterns**

### **Authentication Page Structure**
```typescript
// ✅ Good: Authentication Page Structure
const AuthPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
      <Navbar />
      <div className="pt-20 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <AuthHeader />
          <AuthTabs />
          <AuthForms />
        </div>
      </div>
    </div>
  )
}
```

### **Authentication Tabs Pattern**
```typescript
// ✅ Good: Authentication Tabs Pattern
<Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
  <TabsList className="grid w-full grid-cols-2">
    <TabsTrigger value="signin">Sign In</TabsTrigger>
    <TabsTrigger value="signup">Sign Up</TabsTrigger>
  </TabsList>
  
  <TabsContent value="signin">
    <SignInForm />
  </TabsContent>
  
  <TabsContent value="signup">
    <SignUpForm />
  </TabsContent>
</Tabs>
```

### **Sign-In Form Pattern**
```typescript
// ✅ Good: Sign-In Form Pattern
const SignInForm = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSignIn = async () => {
    setIsSubmitting(true)
    
    try {
      const result = await signIn(email, password)
      if (result.success) {
        toast({
          title: "Success",
          description: "Signed in successfully!",
        })
        navigate('/')
      } else {
        toast({
          title: "Error",
          description: result.error?.message || 'Failed to sign in',
          variant: "destructive",
        })
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign in'
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
        <CardDescription>Enter your credentials to access your account</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        
        <Button 
          onClick={handleSignIn} 
          disabled={isSubmitting}
          className="w-full"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing In...
            </>
          ) : (
            'Sign In'
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
```

### **Sign-Up Form Pattern**
```typescript
// ✅ Good: Sign-Up Form Pattern
const SignUpForm = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showEmailVerification, setShowEmailVerification] = useState(false)

  const handleSignUp = async () => {
    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      })
      return
    }
    
    setIsSubmitting(true)
    
    try {
      const result = await signUp(email, password)
      if (result.success) {
        setShowEmailVerification(true)
        setEmail('')
        setPassword('')
        setConfirmPassword('')
      } else {
        toast({
          title: "Error",
          description: result.error?.message || 'Failed to sign up',
          variant: "destructive",
        })
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign up'
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (showEmailVerification) {
    return <EmailVerificationMessage email={verificationEmail} />
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Account</CardTitle>
        <CardDescription>Sign up to start creating amazing prompts</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="signup-email">Email</Label>
          <Input
            id="signup-email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="signup-password">Password</Label>
          <Input
            id="signup-password"
            type="password"
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="confirm-password">Confirm Password</Label>
          <Input
            id="confirm-password"
            type="password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        
        <Button 
          onClick={handleSignUp} 
          disabled={isSubmitting}
          className="w-full"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating Account...
            </>
          ) : (
            'Create Account'
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
```

### **Google OAuth Pattern**
```typescript
// ✅ Good: Google OAuth Pattern
const GoogleAuthButton = () => {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleGoogleAuth = async () => {
    setIsSubmitting(true)
    try {
      const isSignUpMode = currentTab === 'signup'
      const result = await signInWithGoogle(isSignUpMode)
      
      if (result.success) {
        // Authentication handled in popup
      } else {
        toast({
          title: "Authentication Failed",
          description: result.error?.message || 'Failed to initiate Google authentication',
          variant: "destructive",
        })
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unexpected error occurred'
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Button
      variant="outline"
      onClick={handleGoogleAuth}
      disabled={isSubmitting}
      className="w-full"
    >
      {isSubmitting ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Connecting...
        </>
      ) : (
        <>
          <Chrome className="mr-2 h-4 w-4" />
          Continue with Google
        </>
      )}
    </Button>
  )
}
```

### **Email Verification Pattern**
```typescript
// ✅ Good: Email Verification Pattern
const EmailVerificationMessage = ({ email }: { email: string }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Check Your Email</CardTitle>
        <CardDescription>
          We've sent a verification link to {email}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Mail className="w-6 h-6 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground">
            Click the link in your email to verify your account and complete the sign-up process.
          </p>
        </div>
        
        <Button
          variant="outline"
          onClick={() => setShowEmailVerification(false)}
          className="w-full"
        >
          Back to Sign Up
        </Button>
      </CardContent>
    </Card>
  )
}
```

---

## 🧭 **Navigation Patterns**

### **Navbar Component Pattern**
```typescript
// ✅ Good: Navbar Component Pattern
const Navbar = () => {
  const { user, signOut } = useAuth()
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border/50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Building2 className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-gradient">PromptForge</span>
          </Link>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="h-8 w-8 p-0"
          >
            {theme === 'light' ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Sun className="h-4 w-4" />
            )}
          </Button>

          {/* User Menu */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-gradient-to-r from-primary to-accent text-primary-foreground">
                      {getInitials(user.email)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium text-sm">{getFullName(user.email)}</p>
                    <p className="w-[200px] truncate text-xs text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/auth">
              <Button size="sm" className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300">
                Get Started
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
```

### **Protected Route Pattern**
```typescript
// ✅ Good: Protected Route Pattern
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth')
    }
  }, [user, loading, navigate])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return <>{children}</>
}
```

### **Route Guard Pattern**
```typescript
// ✅ Good: Route Guard Pattern
const useRouteGuard = () => {
  const { user, loading: authLoading } = useAuth()
  const { hasAnyConfig, loading: configLoading } = useApiConfig()
  const navigate = useNavigate()

  useEffect(() => {
    if (authLoading || configLoading) return

    if (!user) {
      navigate('/auth')
      return
    }

    if (!hasAnyConfig) {
      navigate('/api-config')
      return
    }
  }, [user, authLoading, hasAnyConfig, configLoading, navigate])

  return { user, hasAnyConfig, loading: authLoading || configLoading }
}
```

---

## 🎨 **UI Component Patterns**

### **Loading States**
```typescript
// ✅ Good: Authentication Loading State
const AuthLoadingState = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
      <p className="text-muted-foreground">Loading...</p>
    </div>
  </div>
)

// ✅ Good: Form Loading State
const FormLoadingState = ({ isSubmitting }: { isSubmitting: boolean }) => (
  <Button disabled={isSubmitting} className="w-full">
    {isSubmitting ? (
      <>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Processing...
      </>
    ) : (
      'Submit'
    )}
  </Button>
)
```

### **Error States**
```typescript
// ✅ Good: Authentication Error State
const AuthErrorState = ({ error }: { error: string }) => (
  <Alert className="border-red-500/50 bg-red-500/5">
    <AlertCircle className="h-4 w-4 text-red-500" />
    <AlertDescription className="text-red-600 text-sm">
      {error}
    </AlertDescription>
  </Alert>
)

// ✅ Good: Form Validation Error
const FormErrorState = ({ errors }: { errors: Record<string, string> }) => (
  <div className="space-y-2">
    {Object.entries(errors).map(([field, message]) => (
      <p key={field} className="text-sm text-destructive">
        {message}
      </p>
    ))}
  </div>
)
```

### **Success States**
```typescript
// ✅ Good: Authentication Success State
const AuthSuccessState = ({ message }: { message: string }) => (
  <Alert className="border-green-500/50 bg-green-500/5">
    <CheckCircle className="h-4 w-4 text-green-500" />
    <AlertDescription className="text-green-600 text-sm">
      {message}
    </AlertDescription>
  </Alert>
)
```

---

## 🔄 **State Management Patterns**

### **Authentication State**
```typescript
// ✅ Good: Authentication State Management
interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
}

const useAuthState = () => {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null
  })

  const updateState = (updates: Partial<AuthState>) => {
    setState(prev => ({ ...prev, ...updates }))
  }

  return { state, updateState }
}
```

### **Form State Management**
```typescript
// ✅ Good: Form State Management
interface FormState {
  email: string
  password: string
  confirmPassword: string
  isSubmitting: boolean
  errors: Record<string, string>
}

const useFormState = () => {
  const [state, setState] = useState<FormState>({
    email: '',
    password: '',
    confirmPassword: '',
    isSubmitting: false,
    errors: {}
  })

  const updateField = (field: keyof FormState, value: any) => {
    setState(prev => ({ ...prev, [field]: value }))
  }

  const setError = (field: string, message: string) => {
    setState(prev => ({
      ...prev,
      errors: { ...prev.errors, [field]: message }
    }))
  }

  const clearErrors = () => {
    setState(prev => ({ ...prev, errors: {} }))
  }

  return { state, updateField, setError, clearErrors }
}
```

---

## 📱 **Responsive Design Patterns**

### **Mobile Authentication**
```typescript
// ✅ Good: Mobile Authentication Pattern
const MobileAuthLayout = () => (
  <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
    <Navbar />
    <div className="pt-20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Mobile-optimized auth form */}
        <Card className="w-full">
          <CardContent className="p-6">
            {/* Form content */}
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
)
```

### **Mobile Navigation**
```typescript
// ✅ Good: Mobile Navigation Pattern
const MobileNavbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border/50">
      <div className="flex justify-between items-center h-16 px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <Building2 className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold">PromptForge</span>
        </Link>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="h-8 w-8 p-0"
        >
          {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="absolute top-16 left-0 right-0 bg-background border-b border-border/50 shadow-lg">
          <div className="p-4 space-y-2">
            {/* Menu items */}
          </div>
        </div>
      )}
    </nav>
  )
}
```

---

## 🎯 **User Experience Patterns**

### **Progressive Disclosure**
```typescript
// ✅ Good: Progressive Disclosure Pattern
const ProgressiveAuthFlow = () => {
  const [step, setStep] = useState<'auth' | 'config' | 'dashboard'>('auth')

  const nextStep = () => {
    switch (step) {
      case 'auth':
        setStep('config')
        break
      case 'config':
        setStep('dashboard')
        break
    }
  }

  return (
    <div>
      {step === 'auth' && <AuthForm onSuccess={nextStep} />}
      {step === 'config' && <ConfigForm onSuccess={nextStep} />}
      {step === 'dashboard' && <Dashboard />}
    </div>
  )
}
```

### **Contextual Help**
```typescript
// ✅ Good: Contextual Help Pattern
const ContextualHelp = ({ step }: { step: string }) => {
  const helpContent = {
    auth: "Sign in to access your personalized prompt generation experience",
    config: "Configure your API keys to start generating prompts",
    dashboard: "Welcome to your prompt generation dashboard"
  }

  return (
    <div className="bg-muted/50 rounded-lg p-4 mb-6">
      <div className="flex items-start space-x-3">
        <Info className="h-5 w-5 text-primary mt-0.5" />
        <p className="text-sm text-muted-foreground">
          {helpContent[step]}
        </p>
      </div>
    </div>
  )
}
```

### **Onboarding Flow**
```typescript
// ✅ Good: Onboarding Flow Pattern
const OnboardingFlow = () => {
  const [currentStep, setCurrentStep] = useState(0)
  const steps = [
    { title: "Welcome", component: WelcomeStep },
    { title: "Authentication", component: AuthStep },
    { title: "Configuration", component: ConfigStep },
    { title: "Ready", component: ReadyStep }
  ]

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          <span className="text-sm text-muted-foreground">Step {currentStep + 1} of {steps.length}</span>
          <span className="text-sm text-muted-foreground">{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {steps[currentStep] && (
        <steps[currentStep].component 
          onNext={() => setCurrentStep(prev => Math.min(prev + 1, steps.length - 1))}
          onPrev={() => setCurrentStep(prev => Math.max(prev - 1, 0))}
        />
      )}
    </div>
  )
}
```

---

## 🔒 **Security Patterns**

### **Input Validation**
```typescript
// ✅ Good: Input Validation Pattern
const validateAuthInput = (email: string, password: string) => {
  const errors: Record<string, string> = {}

  if (!email) {
    errors.email = 'Email is required'
  } else if (!/\S+@\S+\.\S+/.test(email)) {
    errors.email = 'Email is invalid'
  }

  if (!password) {
    errors.password = 'Password is required'
  } else if (password.length < 6) {
    errors.password = 'Password must be at least 6 characters'
  }

  return errors
}
```

### **Password Requirements**
```typescript
// ✅ Good: Password Requirements Pattern
const PasswordRequirements = ({ password }: { password: string }) => {
  const requirements = [
    { text: 'At least 6 characters', met: password.length >= 6 },
    { text: 'Contains a number', met: /\d/.test(password) },
    { text: 'Contains uppercase letter', met: /[A-Z]/.test(password) },
    { text: 'Contains lowercase letter', met: /[a-z]/.test(password) }
  ]

  return (
    <div className="space-y-1">
      {requirements.map((req, index) => (
        <div key={index} className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${req.met ? 'bg-green-500' : 'bg-muted'}`} />
          <span className={`text-xs ${req.met ? 'text-green-600' : 'text-muted-foreground'}`}>
            {req.text}
          </span>
        </div>
      ))}
    </div>
  )
}
```

### **Session Management**
```typescript
// ✅ Good: Session Management Pattern
const useSessionManagement = () => {
  const { user, signOut } = useAuth()

  useEffect(() => {
    if (!user) return

    // Set up session timeout
    const timeout = setTimeout(() => {
      signOut()
    }, 24 * 60 * 60 * 1000) // 24 hours

    return () => clearTimeout(timeout)
  }, [user, signOut])

  return { user }
}
```

---

## 📊 **Analytics & Tracking**

### **Authentication Events**
```typescript
// ✅ Good: Authentication Event Tracking
const trackAuthEvent = (event: string, properties?: Record<string, any>) => {
  // Track authentication events
  console.log('Auth Event:', event, properties)
  
  // Example events:
  // - 'user_signed_up'
  // - 'user_signed_in'
  // - 'user_signed_out'
  // - 'auth_error'
  // - 'google_auth_initiated'
}

// Usage in components
const handleSignIn = async () => {
  try {
    const result = await signIn(email, password)
    if (result.success) {
      trackAuthEvent('user_signed_in', { method: 'email' })
    } else {
      trackAuthEvent('auth_error', { method: 'email', error: result.error?.message })
    }
  } catch (error) {
    trackAuthEvent('auth_error', { method: 'email', error: 'unknown' })
  }
}
```

### **User Journey Tracking**
```typescript
// ✅ Good: User Journey Tracking
const trackUserJourney = (step: string, data?: Record<string, any>) => {
  console.log('User Journey:', step, data)
  
  // Example steps:
  // - 'homepage_visited'
  // - 'auth_page_visited'
  // - 'sign_up_initiated'
  // - 'sign_in_completed'
  // - 'config_page_visited'
  // - 'first_prompt_generated'
}

// Usage in components
useEffect(() => {
  trackUserJourney('homepage_visited', { authenticated: !!user })
}, [user])
```

---

## 🧪 **Testing Patterns**

### **Authentication Testing**
```typescript
// ✅ Good: Authentication Test Pattern
describe('Authentication Flow', () => {
  it('should redirect unauthenticated users to auth page', () => {
    render(<HomePage />)
    expect(screen.getByText('Sign In')).toBeInTheDocument()
  })

  it('should show dashboard for authenticated users', () => {
    mockUser({ authenticated: true })
    render(<HomePage />)
    expect(screen.getByText('Welcome back!')).toBeInTheDocument()
  })

  it('should handle sign in form submission', async () => {
    render(<AuthPage />)
    
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'test@example.com' }
    })
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123' }
    })
    
    fireEvent.click(screen.getByText('Sign In'))
    
    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123')
    })
  })
})
```

### **Form Testing**
```typescript
// ✅ Good: Form Test Pattern
describe('Sign Up Form', () => {
  it('should validate password confirmation', async () => {
    render(<SignUpForm />)
    
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123' }
    })
    fireEvent.change(screen.getByLabelText('Confirm Password'), {
      target: { value: 'different123' }
    })
    
    fireEvent.click(screen.getByText('Create Account'))
    
    await waitFor(() => {
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument()
    })
  })
})
```

---

## 📋 **Implementation Checklist**

### **Authentication Setup**
- [ ] **Supabase Auth configured** with email/password and Google OAuth
- [ ] **Authentication context** implemented with proper state management
- [ ] **Protected routes** implemented with route guards
- [ ] **Session persistence** configured with localStorage
- [ ] **Error handling** implemented for all authentication flows

### **UI Components**
- [ ] **Authentication forms** implemented with validation
- [ ] **Loading states** implemented for all async operations
- [ ] **Error states** implemented with user-friendly messages
- [ ] **Success states** implemented with appropriate feedback
- [ ] **Responsive design** implemented for mobile devices

### **User Experience**
- [ ] **Progressive disclosure** implemented for onboarding
- [ ] **Contextual help** implemented for user guidance
- [ ] **Navigation flow** implemented with proper redirects
- [ ] **Toast notifications** implemented for user feedback
- [ ] **Accessibility** implemented with proper ARIA labels

### **Security**
- [ ] **Input validation** implemented for all forms
- [ ] **Password requirements** implemented with visual feedback
- [ ] **Session management** implemented with timeout handling
- [ ] **CSRF protection** implemented where needed
- [ ] **XSS prevention** implemented with input sanitization

### **Testing**
- [ ] **Unit tests** implemented for authentication logic
- [ ] **Integration tests** implemented for authentication flow
- [ ] **E2E tests** implemented for complete user journey
- [ ] **Accessibility tests** implemented for UI components
- [ ] **Performance tests** implemented for authentication operations

---

## 🚀 **Best Practices**

### **Authentication Best Practices**
- **Always validate inputs** on both client and server side
- **Use secure password requirements** with visual feedback
- **Implement proper error handling** with user-friendly messages
- **Use loading states** to provide feedback during async operations
- **Implement session timeout** for security

### **UI/UX Best Practices**
- **Progressive disclosure** to avoid overwhelming users
- **Contextual help** to guide users through the process
- **Consistent navigation** across all pages
- **Responsive design** for all device sizes
- **Accessibility compliance** for all users

### **Security Best Practices**
- **Never store passwords** in plain text
- **Use HTTPS** for all authentication requests
- **Implement rate limiting** for authentication attempts
- **Use secure session management** with proper expiration
- **Validate all inputs** to prevent injection attacks

---

## 📚 **Resources & References**

### **Documentation**
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [React Router Documentation](https://reactrouter.com/)
- [React Hook Form Documentation](https://react-hook-form.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

### **Security Resources**
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [Web Security Best Practices](https://web.dev/security/)
- [React Security Best Practices](https://react.dev/learn/security)

### **UI/UX Resources**
- [Material Design Guidelines](https://material.io/design)
- [Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Mobile-First Design](https://web.dev/responsive-web-design-basics/)

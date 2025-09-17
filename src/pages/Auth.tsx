import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Building2, Loader2, Home, Chrome } from 'lucide-react'
import { Navbar } from '@/components/Navbar'
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const Auth = () => {
  const { user, loading, signIn, signUp, signInWithGoogle } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showEmailVerification, setShowEmailVerification] = useState(false)
  const [verificationEmail, setVerificationEmail] = useState('')
  const [currentTab, setCurrentTab] = useState('signin')

  // Redirect to homepage if user is already authenticated
  useEffect(() => {
    if (user && !loading) {
      navigate('/')
    }
  }, [user, loading, navigate])

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
        // Show email verification state instead of navigating
        setVerificationEmail(email)
        setShowEmailVerification(true)
        // Clear form data
        setEmail('')
        setPassword('')
        setConfirmPassword('')
      } else {
        // Stay on current screen if signup fails
        toast({
          title: "Error",
          description: result.error?.message || 'Failed to sign up',
          variant: "destructive",
        })
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign up';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSignIn = async () => {
    setIsSubmitting(true)
    
    try {
      const result = await signIn(email, password)
      if (result.success) {
        toast({
          title: "Success",
          description: "Signed in successfully!",
        })
        // Only navigate on successful signin
        navigate('/')
      } else {
        // Stay on current screen if signin fails
        toast({
          title: "Error",
          description: result.error?.message || 'Failed to sign in',
          variant: "destructive",
        })
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign in';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGoogle = async () => {
    setIsSubmitting(true)
    try {
      const isSignUpMode = currentTab === 'signup'
      const result = await signInWithGoogle(isSignUpMode)
      if (result.success) {
        // The popup will handle the authentication flow
        // No need to show additional notifications here as they're handled in the hook
      } else {
        // Stay on current screen if Google signin fails
        toast({
          title: "Error",
          description: result.error?.message || 'Failed to sign in with Google',
          variant: "destructive",
        })
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign in with Google';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResendVerification = async () => {
    if (!verificationEmail) {
      toast({
        title: "Error",
        description: "No email address found",
        variant: "destructive",
      })
      return
    }
    
    setIsSubmitting(true)
    try {
      // Resend verification email using Supabase's resend method
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: verificationEmail,
      })
      
      if (error) {
        toast({
          title: "Error",
          description: error.message || "Failed to resend verification email",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Verification email resent",
          description: "A new verification email has been sent to your inbox.",
        })
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to resend verification email";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBackToSignUp = () => {
    setShowEmailVerification(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Show email verification screen if signup was successful
  if (showEmailVerification) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
        <Navbar />
        <div className="pt-20 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <Card className="bg-card/80 backdrop-blur-sm border-border shadow-elegant">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <CardTitle className="text-xl text-green-600">Account Created Successfully! 🎉</CardTitle>
                <CardDescription className="text-center mt-2">
                  Your account has been created and a verification email has been sent to <strong>{verificationEmail}</strong>.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">Next Steps:</h4>
                  <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                    <li>Check your email inbox (and spam folder)</li>
                    <li>Click the verification link in the email</li>
                    <li>Return to this app to sign in</li>
                  </ol>
                  <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                    💡 <strong>Tip:</strong> If you don't see the email, check your spam/junk folder
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Button
                    onClick={handleResendVerification}
                    className="w-full"
                    disabled={isSubmitting}
                    variant="outline"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Resending...
                      </>
                    ) : (
                      'Resend Verification Email'
                    )}
                  </Button>
                  
                  <Button
                    onClick={handleBackToSignUp}
                    className="w-full"
                    variant="ghost"
                  >
                    Back to Sign Up
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  // User will be automatically redirected by useEffect if authenticated

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
      <Navbar />
      <div className="pt-20 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gradient mb-2">PromptForge</h1>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-2">
              <Building2 className="w-4 h-4" />
              <span>ZeroXTech | Chaitanya</span>
            </div>
            <p className="text-muted-foreground">Welcome to the future of prompt engineering</p>
          </div>

          <Card className="bg-card/80 backdrop-blur-sm border-border shadow-elegant">
            <CardHeader>
              <CardTitle className="text-center text-xl">Get Started</CardTitle>
              <CardDescription className="text-center">
                Sign in to your account or create a new one
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="signin" value={currentTab} onValueChange={setCurrentTab} className="space-y-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="signin">Sign In</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>
                
                <TabsContent value="signin" className="space-y-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGoogle}
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    <Chrome className="w-4 h-4 mr-2" />
                    {isSubmitting ? 'Signing in...' : 'Sign in with Google'}
                  </Button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">Or sign in with email</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
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
                    />
                  </div>
                  <Button 
                    onClick={handleSignIn} 
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Signing In...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </Button>
                </TabsContent>
                
                <TabsContent value="signup" className="space-y-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGoogle}
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    <Chrome className="w-4 h-4 mr-2" />
                    {isSubmitting ? 'Signing up...' : 'Sign up with Google'}
                  </Button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">Or sign up with email</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
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
                    />
                  </div>
                  <Button 
                    onClick={handleSignUp} 
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </Button>
                </TabsContent>
              </Tabs>
              
            </CardContent>
          </Card>
          
          <div className="text-center mt-6">
            <p className="text-xs text-muted-foreground">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Auth

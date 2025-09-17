import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'

interface AuthError {
  message: string;
  code?: string;
}

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null; success: boolean }>
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null; success: boolean }>
  signInWithGoogle: (isSignUp?: boolean) => Promise<{ error: AuthError | null; success: boolean }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)

        if (event === 'SIGNED_IN') {
          // Check if this is a new user (first time signing in)
          const isNewUser = session?.user?.user_metadata?.provider === 'google' && 
                           session?.user?.created_at === session?.user?.last_sign_in_at
          
          if (isNewUser) {
            toast({
              title: "Welcome to PromptForge! 🎉",
              description: "Your Google account has been successfully connected and you're now signed in.",
            })
          } else {
            toast({
              title: "Welcome back! 👋",
              description: "You've successfully signed in with Google.",
            })
          }
        } else if (event === 'SIGNED_OUT') {
          toast({
            title: "Signed out",
            description: "You've been signed out successfully.",
          })
        }
      }
    )

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [toast])

  const signUp = async (email: string, password: string) => {
    const redirectUrl = `${window.location.origin}/`
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl
      }
    })
    
    if (error) {
      toast({
        variant: "destructive",
        title: "Sign up failed",
        description: error.message,
      })
    } else {
      toast({
        title: "Account created successfully! 🎉",
        description: "Please check your email and click the verification link to complete your signup. The confirmation email has been sent to your inbox.",
      })
    }
    
    return { error, success: !error }
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) {
      toast({
        variant: "destructive",
        title: "Sign in failed",
        description: error.message,
      })
    } else {
      toast({
        title: "Welcome back! 👋",
        description: "You've successfully signed in.",
      })
    }
    
    return { error, success: !error }
  }

  const signInWithGoogle = async (isSignUp: boolean = false) => {
    try {
      const action = isSignUp ? "sign up" : "sign in"
      
      // Show initial notification
      toast({
        title: `Google ${action} initiated`,
        description: `Opening Google authentication in new tab for ${action}...`,
      })

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          skipBrowserRedirect: false, // This enables new tab mode instead of popup
          redirectTo: `${window.location.origin}/`,
        }
      })

      if (error) {
        toast({
          variant: "destructive",
          title: `Google ${action} failed`,
          description: error.message,
        })
        return { error, success: false }
      }

      if (data?.url) {
        // Open Google sign-in in a new tab
        window.open(data.url, '_blank')
        
        // Show additional notification about the new tab
        toast({
          title: `Google ${action} opened`,
          description: `A new tab has opened for Google authentication. Please complete the ${action} process there.`,
        })
        
        // Return success since the new tab is now open
        return { error: null, success: true }
      }

      return { error: null, success: false }
    } catch (err: unknown) {
      const action = isSignUp ? "sign up" : "sign in"
      const errorMessage = err instanceof Error ? err.message : `Unexpected error starting Google ${action}`
      toast({
        variant: "destructive",
        title: `Google ${action} error`,
        description: errorMessage,
      })
      return { error: { message: errorMessage }, success: false }
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

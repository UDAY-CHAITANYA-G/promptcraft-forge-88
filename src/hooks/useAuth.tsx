import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string) => Promise<{ error: any }>
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signInWithGoogle: () => Promise<{ error: any }>
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
          toast({
            title: "Welcome back!",
            description: "You've successfully signed in.",
          })
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
        title: "Check your email",
        description: "We've sent you a confirmation link to complete your signup.",
      })
    }
    
    return { error }
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
    }
    
    return { error }
  }

  const signInWithGoogle = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          skipBrowserRedirect: true,
          redirectTo: `${window.location.origin}/`,
        }
      })

      if (error) {
        toast({
          variant: "destructive",
          title: "Google sign-in failed",
          description: error.message,
        })
        return { error }
      }

      if (data?.url) {
        const popup = window.open(
          data.url,
          'supabase_google_oauth',
          'width=520,height=640,top=' + (window.screenY + (window.outerHeight - 640) / 2) + ',left=' + (window.screenX + (window.outerWidth - 520) / 2) + ',resizable,scrollbars=yes,status=1'
        )

        // Poll for session while the popup is open
        await new Promise<void>((resolve) => {
          const interval = setInterval(async () => {
            const { data: sessionData } = await supabase.auth.getSession()
            const isClosed = !popup || popup.closed
            if (sessionData.session || isClosed) {
              clearInterval(interval)
              if (!isClosed) popup?.close()
              resolve()
            }
          }, 500)
        })
      }

      return { error: null }
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Google sign-in error",
        description: err?.message || 'Unexpected error starting Google auth',
      })
      return { error: err }
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
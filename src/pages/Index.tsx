import React from 'react'
import { useNavigate } from 'react-router-dom'
import { HeroSection } from '@/components/HeroSection'
import { FeaturesSection } from '@/components/FeaturesSection'
import { ProcessFlow } from '@/components/ProcessFlow'
import { Footer } from '@/components/Footer'
import { Navbar } from '@/components/Navbar'
import { LeftSidebar } from '@/components/LeftSidebar'
import { useAuth } from '@/hooks/useAuth'
import { useApiConfig } from '@/hooks/useApiConfig'
import { useToast } from '@/hooks/use-toast'

const Index = () => {
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  const { hasAnyConfig, loading: configLoading } = useApiConfig()
  const { toast } = useToast()

  // Show loading state while authentication is being checked
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  const handleStartCreatingPrompts = () => {
    if (!user) {
      // If user is not authenticated, navigate to auth page
      toast({
        title: "Authentication Required",
        description: "Please sign in to start creating prompts",
      })
      navigate('/auth')
      return
    }

    if (configLoading) {
      // If still loading, wait
      return
    }

    if (hasAnyConfig) {
      // If user has API keys configured, navigate to prompt generator
      toast({
        title: "Welcome Back!",
        description: "Taking you to the prompt generator",
      })
      navigate('/prompt-generator')
    } else {
      // If user is new or has no API keys, navigate to API config
      toast({
        title: "Setup Required",
        description: "Let's configure your API keys first",
      })
      navigate('/api-config')
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20">
        <LeftSidebar showNavigation={false} />
        <HeroSection 
          onStartCreatingPrompts={handleStartCreatingPrompts}
          isLoading={configLoading}
          user={user}
        />
        <ProcessFlow />
        <FeaturesSection />
        <Footer />
      </div>
    </div>
  );
};

export default Index;

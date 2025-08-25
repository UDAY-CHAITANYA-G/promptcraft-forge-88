import React from 'react'
import { useNavigate } from 'react-router-dom'
import { HeroSection } from '@/components/HeroSection'
import { FeaturesSection } from '@/components/FeaturesSection'
import { Footer } from '@/components/Footer'
import { Navbar } from '@/components/Navbar'
import { LeftSidebar } from '@/components/LeftSidebar'
import { useAuth } from '@/hooks/useAuth'
import { useApiConfig } from '@/hooks/useApiConfig'
import { useToast } from '@/hooks/use-toast'

const Index = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { hasAnyConfig, loading } = useApiConfig()
  const { toast } = useToast()

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

    if (loading) {
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
          isLoading={loading}
          user={user}
        />
        <FeaturesSection />
        <Footer />
      </div>
    </div>
  );
};

export default Index;

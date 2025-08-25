import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Building2, User } from "lucide-react"
import heroImage from "@/assets/hero-ai-prompt.jpg"

interface HeroSectionProps {
  onStartCreatingPrompts: () => void
  isLoading: boolean
  user?: any
}

export function HeroSection({ onStartCreatingPrompts, isLoading, user }: HeroSectionProps) {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-hero">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroImage} 
          alt="AI-powered prompt engineering interface with neural networks and data flows"
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-hero/80" />
      </div>
      
      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-secondary/10 rounded-full blur-2xl animate-float" style={{ animationDelay: '4s' }} />
      </div>
      
      {/* Main Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 text-center space-y-8">
        <div className="space-y-4">
          <Badge 
            variant="outline" 
            className="border-primary/30 bg-primary/10 text-primary-glow animate-pulse-glow text-sm px-4 py-2"
          >
            ✨ AI-Powered Prompt Engineering
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-bold leading-tight">
            <span className="text-gradient">PromptForge</span>
            <br />
            <span className="text-foreground">Intelligent Prompts,</span>
            <br />
            <span className="text-foreground">Exceptional Results</span>
          </h1>
          
          {/* Company Branding */}
          <div className="flex items-center justify-center gap-2 text-lg md:text-xl text-muted-foreground mt-4">
            <Building2 className="w-5 h-5 md:w-6 md:h-6" />
            <span className="font-medium">ZeroXTech</span>
            <span className="opacity-70">|</span>
            <span className="opacity-70">Chaitanya</span>
          </div>
        </div>
        
        <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          {user ? (
            <>
              Welcome back! Transform your AI interactions with framework-based prompt generation. 
              Generate strategic, high-quality prompts using proven methodologies and intelligent agent assistance.
            </>
          ) : (
            <>
              Transform your AI interactions with framework-based prompt generation. 
              Generate strategic, high-quality prompts using proven methodologies and intelligent agent assistance.
            </>
          )}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button 
            variant="hero" 
            size="xl" 
            className="text-lg group"
            onClick={onStartCreatingPrompts}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading...
              </>
            ) : (
              <>
                {user ? 'Continue Creating Prompts' : 'Start Creating Prompts'}
                <svg 
                  className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </>
            )}
          </Button>
          
          <Button variant="outline" size="xl" className="text-lg">
            View Frameworks
          </Button>
        </div>
        
        <div className="pt-8 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="space-y-2">
            <div className="text-3xl font-bold text-primary">9+</div>
            <div className="text-sm text-muted-foreground">Proven Frameworks</div>
          </div>
          <div className="space-y-2">
            <div className="text-3xl font-bold text-primary">∞</div>
            <div className="text-sm text-muted-foreground">Prompt Variations</div>
          </div>
          <div className="space-y-2">
            <div className="text-3xl font-bold text-primary">AI</div>
            <div className="text-sm text-muted-foreground">Intelligent Assistance</div>
          </div>
        </div>
      </div>
    </section>
  )
}
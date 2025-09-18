import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Building2, Sparkles, Bot, Zap, ArrowRight, CheckCircle, Star, Users, Globe } from "lucide-react"
import heroImage from "@/assets/hero-ai-prompt.jpg"

interface User {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
    name?: string;
  };
}

interface HeroSectionProps {
  onStartCreatingPrompts: () => void
  isLoading: boolean
  user?: User
}

export function HeroSection({ onStartCreatingPrompts, isLoading, user }: HeroSectionProps) {
  const handlePointerMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    e.currentTarget.style.setProperty('--x', `${x}px`)
    e.currentTarget.style.setProperty('--y', `${y}px`)
  }
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background with gradient overlay */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-muted/20" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
      </div>
      
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating orbs */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-r from-secondary/20 to-primary/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-gradient-to-r from-accent/20 to-secondary/20 rounded-full blur-2xl animate-float" style={{ animationDelay: '4s' }} />
        
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] dark:bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)]" />
      </div>
      
      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-0 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Column - Hero Content */}
          <div className="space-y-8 text-center lg:text-left">
            {/* Badge */}
            <div className="flex justify-center lg:justify-start">
              <Badge 
                variant="outline" 
                className="border-primary/30 bg-primary/10 text-primary animate-pulse-glow text-sm px-4 py-2 backdrop-blur-sm"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                AI-Powered Prompt Engineering
              </Badge>
            </div>
            
            {/* Main Heading */}
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
                <span className="text-gradient bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                  PromptForge
                </span>
                <br />
                <span className="text-foreground">
                  Intelligent Prompts,
                </span>
                <br />
                <span className="text-foreground">
                  Exceptional Results
                </span>
              </h1>
              
              {/* Company Branding */}
              <div className="flex items-center justify-center lg:justify-start gap-2 text-lg md:text-xl text-muted-foreground">
                <Building2 className="w-5 h-5 md:w-6 md:h-6" />
                <span className="font-medium">ZeroXTech</span>
                <span className="opacity-70">|</span>
                <span className="opacity-70">Chaitanya</span>
              </div>
            </div>
            
            {/* Description */}
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl leading-relaxed">
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
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button 
                size="lg"
                className="relative overflow-hidden text-lg group bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                onClick={onStartCreatingPrompts}
                disabled={isLoading}
                onMouseMove={handlePointerMove}
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background:
                      'radial-gradient(160px circle at var(--x) var(--y), rgba(255,255,255,0.25), transparent 60%)'
                  }}
                />
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3" />
                    Loading...
                  </>
                ) : (
                  <>
                    {user ? 'Continue Creating Prompts' : 'Start Creating Prompts'}
                    <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </Button>
              
              <Button 
                variant="outline" 
                size="lg" 
                className="relative overflow-hidden text-lg border-2 hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                onMouseMove={handlePointerMove}
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background:
                      'radial-gradient(160px circle at var(--x) var(--y), hsl(var(--primary)), transparent 60%)'
                  }}
                />
                <Sparkles className="mr-2 w-5 h-5" />
                View Frameworks
              </Button>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">9+</div>
                <div className="text-sm text-muted-foreground">Proven Frameworks</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">∞</div>
                <div className="text-sm text-muted-foreground">Prompt Variations</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">AI</div>
                <div className="text-sm text-muted-foreground">Intelligent Assistance</div>
              </div>
            </div>
          </div>
          
          {/* Right Column - Feature Cards */}
          <div className="space-y-6">
            {/* Main Feature Card */}
            <Card className="relative overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-card to-card/80 backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5" />
              <CardContent className="relative p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-gradient-to-r from-primary to-accent rounded-xl shadow-lg">
                    <Bot className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-foreground">Multi-AI Model Support</h3>
                    <p className="text-muted-foreground">ChatGPT, Gemini, Claude</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-success" />
                    <span className="text-foreground">9 Proven Frameworks</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-success" />
                    <span className="text-foreground">Secure API Management</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-success" />
                    <span className="text-foreground">Real-time Generation</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Secondary Feature Cards */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="border-0 shadow-lg bg-gradient-to-br from-secondary/20 to-secondary/10 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-secondary rounded-lg">
                      <Zap className="w-5 h-5 text-secondary-foreground" />
                    </div>
                    <h4 className="font-semibold text-foreground">Lightning Fast</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">Generate prompts in seconds with our optimized AI models</p>
                </CardContent>
              </Card>
              
              <Card className="border-0 shadow-lg bg-gradient-to-br from-accent/20 to-accent/10 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-accent rounded-lg">
                      <Globe className="w-5 h-5 text-accent-foreground" />
                    </div>
                    <h4 className="font-semibold text-foreground">Enterprise Ready</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">Secure, scalable, and designed for professional use</p>
                </CardContent>
              </Card>
            </div>
                        
          </div>
        </div>
      </div>
    </section>
  )
}

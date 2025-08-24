import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const features = [
  {
    icon: "🧠",
    title: "AI-Powered Generation",
    description: "Intelligent agent assistance guides you through the prompt creation process using advanced AI algorithms.",
    badge: "Smart"
  },
  {
    icon: "🎯", 
    title: "Framework-Based Approach",
    description: "9 proven methodologies including R.O.S.E.S, A.P.E, T.A.G, and more for structured prompt engineering.",
    badge: "Proven"
  },
  {
    icon: "🔄",
    title: "Multi-Model Support", 
    description: "Works seamlessly with ChatGPT, Gemini Flash, and Gemini Pro with unified optimization.",
    badge: "Compatible"
  },
  {
    icon: "⚡",
    title: "Lightning Fast",
    description: "Generate optimized prompts in under 3 seconds with intelligent caching and preprocessing.",
    badge: "Fast"
  },
  {
    icon: "🔒",
    title: "Secure & Private",
    description: "Your API keys are encrypted with AES-256 and never stored in plain text. Zero-knowledge architecture.",
    badge: "Secure"
  },
  {
    icon: "📊",
    title: "Analytics & Insights",
    description: "Track prompt performance, token usage, and costs across different AI models with detailed analytics.",
    badge: "Insightful"
  }
]

export function FeaturesSection() {
  return (
    <section className="py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold text-gradient">
            Powerful Features
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Everything you need to create exceptional AI prompts with professional-grade tools and intelligent assistance.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="group hover:shadow-accent hover:border-primary/50 transition-smooth border-border bg-card/50 backdrop-blur-sm"
            >
              <CardHeader className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-4xl group-hover:scale-110 transition-bounce">
                    {feature.icon}
                  </div>
                  <Badge 
                    variant="outline" 
                    className="border-primary/30 bg-primary/10 text-primary-glow"
                  >
                    {feature.badge}
                  </Badge>
                </div>
                <CardTitle className="text-xl group-hover:text-primary transition-smooth">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
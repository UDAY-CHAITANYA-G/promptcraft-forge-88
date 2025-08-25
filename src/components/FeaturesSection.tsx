import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Key, Sparkles, Brain, Zap, Shield, Users } from "lucide-react"
import { Link } from "react-router-dom"

const features = [
  {
    icon: Key,
    title: "Multi-Model API Support",
    description: "Configure API keys for ChatGPT, Gemini, and Claude models. Use one, some, or all models simultaneously for maximum flexibility.",
    action: "Configure APIs",
    link: "/api-config"
  },
  {
    icon: Sparkles,
    title: "Smart Prompt Generation",
    description: "Generate structured prompts using 9 proven frameworks. Our AI-powered system creates optimized prompts based on your specific needs.",
    action: "Generate Prompts",
    link: "/prompt-generator"
  },
  {
    icon: Brain,
    title: "Proven Frameworks",
    description: "Choose from R.O.S.E.S, A.P.E, T.A.G, E.R.A, R.A.C.E, R.I.S.E, C.A.R.E, C.O.A.S.T, and T.R.A.C.E frameworks.",
    action: "Learn More",
    link: "/"
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Generate professional prompts in seconds. Our streamlined interface makes prompt engineering accessible to everyone.",
    action: "Get Started",
    link: "/api-config"
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description: "Your API keys are stored locally and never shared. Enterprise-grade security for your AI interactions.",
    action: "Learn More",
    link: "/"
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Share frameworks and prompts with your team. Build a library of effective AI prompts together.",
    action: "Coming Soon",
    link: "/"
  }
]

export function FeaturesSection() {
  return (
    <section className="py-20 px-6 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold text-gradient">
            Powerful Features for AI Success
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Everything you need to create effective AI prompts and manage multiple AI models in one place.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/20">
                <CardHeader className="pb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Link to={feature.link}>
                      {feature.action}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
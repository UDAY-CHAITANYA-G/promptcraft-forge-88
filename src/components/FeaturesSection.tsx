import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Key, Sparkles, Brain, Zap, Shield, Users, ArrowRight, CheckCircle, Star, Globe, Cpu, Lock } from "lucide-react"
import { Link } from "react-router-dom"

const features = [
  {
    icon: Key,
    title: "Multi-Model API Support",
    description: "Configure API keys for ChatGPT, Gemini, and Claude models. Use one, some, or all models simultaneously for maximum flexibility.",
    action: "Configure APIs",
    link: "/api-config",
    gradient: "from-blue-500 to-cyan-500",
    bgGradient: "from-blue-500/10 to-cyan-500/10",
    borderGradient: "from-blue-500/20 to-cyan-500/20"
  },
  {
    icon: Sparkles,
    title: "Smart Prompt Generation",
    description: "Generate structured prompts using 9 proven frameworks. Our AI-powered system creates optimized prompts based on your specific needs.",
    action: "Generate Prompts",
    link: "/prompt-generator",
    gradient: "from-purple-500 to-pink-500",
    bgGradient: "from-purple-500/10 to-pink-500/10",
    borderGradient: "from-purple-500/20 to-pink-500/20"
  },
  {
    icon: Brain,
    title: "Proven Frameworks",
    description: "Choose from R.O.S.E.S, A.P.E, T.A.G, E.R.A, R.A.C.E, R.I.S.E, C.A.R.E, C.O.A.S.T, and T.R.A.C.E frameworks.",
    action: "Learn More",
    link: "/",
    gradient: "from-emerald-500 to-teal-500",
    bgGradient: "from-emerald-500/10 to-teal-500/10",
    borderGradient: "from-emerald-500/20 to-teal-500/20"
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Generate professional prompts in seconds. Our streamlined interface makes prompt engineering accessible to everyone.",
    action: "Get Started",
    link: "/api-config",
    gradient: "from-yellow-500 to-orange-500",
    bgGradient: "from-yellow-500/10 to-orange-500/10",
    borderGradient: "from-yellow-500/20 to-orange-500/20"
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description: "Your API keys are stored locally and never shared. Enterprise-grade security for your AI interactions.",
    action: "Learn More",
    link: "/",
    gradient: "from-green-500 to-emerald-500",
    bgGradient: "from-green-500/10 to-emerald-500/10",
    borderGradient: "from-green-500/20 to-emerald-500/20"
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Share frameworks and prompts with your team. Build a library of effective AI prompts together.",
    action: "Provide Feedback",
    link: "mailto:zeroxchaitanya@gmail.com?subject=Team Collaboration Feature Feedback&body=Hi, I'm interested in the Team Collaboration feature. Here's my feedback:",
    gradient: "from-indigo-500 to-purple-500",
    bgGradient: "from-indigo-500/10 to-purple-500/10",
    borderGradient: "from-indigo-500/20 to-purple-500/20"
  }
]

const stats = [
  {
    icon: Cpu,
    value: "9+",
    label: "AI Frameworks",
    description: "Proven methodologies"
  },
  {
    icon: Sparkles,
    value: "∞",
    label: "Prompt Variations",
    description: "Unlimited possibilities"
  },
  {
    icon: Globe,
    value: "3",
    label: "AI Providers",
    description: "ChatGPT, Gemini, Claude"
  },
  {
    icon: Lock,
    value: "100%",
    label: "Secure",
    description: "Enterprise-grade security"
  }
]

export function FeaturesSection() {
  return (
    <section className="py-24 px-6 bg-gradient-to-b from-background to-muted/20">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-20 space-y-6">
          <Badge 
            variant="outline" 
            className="border-primary/30 bg-primary/10 text-primary text-sm px-4 py-2"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Powerful Features
          </Badge>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold">
            <span className="text-gradient bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Everything You Need
            </span>
            <br />
            <span className="text-foreground">for AI Success</span>
          </h2>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Everything you need to create effective AI prompts and manage multiple AI models in one place.
          </p>
        </div>
        
        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <Card key={index} className="border-0 shadow-lg bg-gradient-to-br from-card to-card/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <div className="flex justify-center mb-4">
                    <div className="p-3 bg-gradient-to-r from-primary to-accent rounded-xl shadow-lg">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-primary mb-2">{stat.value}</div>
                  <div className="text-sm font-semibold text-foreground mb-1">{stat.label}</div>
                  <div className="text-xs text-muted-foreground">{stat.description}</div>
                </CardContent>
              </Card>
            )
          })}
        </div>
        
        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Card 
                key={index} 
                className={`group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 bg-gradient-to-br from-card to-card/80 backdrop-blur-sm`}
              >
                {/* Gradient overlay */}
                <div className={`absolute inset-0 bg-gradient-to-r ${feature.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                
                {/* Border gradient */}
                <div className={`absolute inset-0 bg-gradient-to-r ${feature.borderGradient} rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                
                <CardHeader className="relative pb-4">
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`p-3 bg-gradient-to-r ${feature.gradient} rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-xl group-hover:text-primary transition-colors duration-300">
                        {feature.title}
                      </CardTitle>
                    </div>
                  </div>
                  <CardDescription className="text-base leading-relaxed text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="relative">
                  <Button 
                    asChild 
                    variant="outline" 
                    className={`w-full group-hover:bg-gradient-to-r ${feature.gradient} group-hover:text-white group-hover:border-transparent transition-all duration-300`}
                  >
                    {feature.link.startsWith('mailto:') ? (
                      <a href={feature.link} className="flex items-center justify-center gap-2">
                        {feature.action}
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                      </a>
                    ) : (
                      <Link to={feature.link} className="flex items-center justify-center gap-2">
                        {feature.action}
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                      </Link>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
        
        {/* CTA Section */}
        <div className="mt-20 text-center">
          <Card className="border-0 shadow-2xl bg-gradient-to-r from-primary/10 to-accent/10 backdrop-blur-sm">
            <CardContent className="p-12">
              <div className="max-w-2xl mx-auto space-y-6">
                <div className="flex justify-center mb-6">
                  <div className="p-4 bg-gradient-to-r from-primary to-accent rounded-2xl shadow-lg">
                    <Star className="w-8 h-8 text-white" />
                  </div>
                </div>
                
                <h3 className="text-3xl md:text-4xl font-bold text-foreground">
                  Ready to Transform Your AI Experience?
                </h3>
                
                <p className="text-xl text-muted-foreground leading-relaxed">
                  Join thousands of developers and professionals who are already using PromptForge to create better AI prompts.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
                  <Button 
                    size="lg"
                    className="text-lg bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    <Sparkles className="mr-2 w-5 h-5" />
                    Get Started Free
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="text-lg border-2 hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                  >
                    <Globe className="mr-2 w-5 h-5" />
                    View Documentation
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}

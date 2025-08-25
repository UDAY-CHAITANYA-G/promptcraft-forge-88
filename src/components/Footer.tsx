import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Building2, Sparkles, Github, Twitter, Linkedin, Mail, Heart, ArrowUp } from "lucide-react"
import { Link } from "react-router-dom"

export function Footer() {
  const currentYear = new Date().getFullYear()

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="relative bg-gradient-to-b from-muted/20 to-background border-t border-border/50">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute bottom-0 left-1/4 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute top-0 right-1/4 w-40 h-40 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          
          {/* Brand Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-primary to-accent rounded-lg shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gradient bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  PromptForge
                </h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Building2 className="w-4 h-4" />
                  <span>ZeroXTech | Chaitanya</span>
                </div>
              </div>
            </div>
            
            <p className="text-muted-foreground leading-relaxed max-w-md">
              Transform your AI interactions with framework-based prompt generation. 
              Generate strategic, high-quality prompts using proven methodologies and intelligent agent assistance.
            </p>
            
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">
                <Sparkles className="w-3 h-3 mr-1" />
                AI-Powered
              </Badge>
              <Badge variant="outline" className="border-success/30 bg-success/10 text-success">
                <Heart className="w-3 h-3 mr-1" />
                Open Source
              </Badge>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-foreground">Quick Links</h4>
            <div className="space-y-3">
              <Link to="/" className="block text-muted-foreground hover:text-primary transition-colors">
                Home
              </Link>
              <Link to="/api-config" className="block text-muted-foreground hover:text-primary transition-colors">
                API Configuration
              </Link>
              <Link to="/prompt-generator" className="block text-muted-foreground hover:text-primary transition-colors">
                Prompt Generator
              </Link>
              <Link to="/auth" className="block text-muted-foreground hover:text-primary transition-colors">
                Sign In
              </Link>
            </div>
          </div>

          {/* Resources */}
          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-foreground">Resources</h4>
            <div className="space-y-3">
              <a href="#" className="block text-muted-foreground hover:text-primary transition-colors">
                Documentation
              </a>
              <a href="#" className="block text-muted-foreground hover:text-primary transition-colors">
                API Reference
              </a>
              <a href="#" className="block text-muted-foreground hover:text-primary transition-colors">
                Frameworks Guide
              </a>
              <a href="#" className="block text-muted-foreground hover:text-primary transition-colors">
                Best Practices
              </a>
            </div>
          </div>
        </div>

        {/* Social Links & Newsletter */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-8 border-t border-border/50">
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-foreground">Connect With Us</h4>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" className="rounded-full w-10 h-10 p-0 hover:bg-primary hover:text-primary-foreground transition-all duration-300">
                <Github className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" className="rounded-full w-10 h-10 p-0 hover:bg-primary hover:text-primary-foreground transition-all duration-300">
                <Twitter className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" className="rounded-full w-10 h-10 p-0 hover:bg-primary hover:text-primary-foreground transition-all duration-300">
                <Linkedin className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" className="rounded-full w-10 h-10 p-0 hover:bg-primary hover:text-primary-foreground transition-all duration-300">
                <Mail className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-foreground">Stay Updated</h4>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300"
              />
              <Button size="sm" className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground">
                Subscribe
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-border/50">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>© {currentYear} PromptForge. Made with</span>
            <Heart className="w-4 h-4 text-red-500 fill-red-500" />
            <span>by ZeroXTech</span>
          </div>
          
          <div className="flex items-center gap-6 text-sm">
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
              Terms of Service
            </a>
            <Button
              variant="outline"
              size="sm"
              onClick={scrollToTop}
              className="rounded-full w-8 h-8 p-0 hover:bg-primary hover:text-primary-foreground transition-all duration-300"
            >
              <ArrowUp className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </footer>
  )
}
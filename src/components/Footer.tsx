import { Badge } from "@/components/ui/badge"
import { Building2, Heart } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-card/30 border-t border-border/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="text-2xl font-bold text-gradient">PromptForge</h3>
              <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary-glow text-xs">
                Beta
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Building2 className="w-4 h-4" />
              <span className="font-medium">ZeroXTech | Chaitanya</span>
            </div>
            <p className="text-muted-foreground">
              Intelligent prompt engineering for the modern AI era.
            </p>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Frameworks</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-smooth">R.O.S.E.S</a></li>
              <li><a href="#" className="hover:text-primary transition-smooth">A.P.E</a></li>
              <li><a href="#" className="hover:text-primary transition-smooth">T.A.G</a></li>
              <li><a href="#" className="hover:text-primary transition-smooth">All Frameworks</a></li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-smooth">About ZeroXTech</a></li>
              <li><a href="#" className="hover:text-primary transition-smooth">Our Mission</a></li>
              <li><a href="#" className="hover:text-primary transition-smooth">Contact Us</a></li>
              <li><a href="#" className="hover:text-primary transition-smooth">Careers</a></li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Support</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-smooth">Documentation</a></li>
              <li><a href="#" className="hover:text-primary transition-smooth">API Reference</a></li>
              <li><a href="#" className="hover:text-primary transition-smooth">Help Center</a></li>
              <li><a href="#" className="hover:text-primary transition-smooth">Community</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border/50 mt-8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>© 2024 ZeroXTech | Chaitanya. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <a href="#" className="hover:text-primary transition-smooth">Privacy Policy</a>
            <a href="#" className="hover:text-primary transition-smooth">Terms of Service</a>
            <a href="#" className="hover:text-primary transition-smooth">Cookie Policy</a>
          </div>
        </div>
        
        <div className="text-center mt-6 pt-6 border-t border-border/30">
          <p className="text-xs text-muted-foreground flex items-center justify-center gap-2">
            Made with <Heart className="w-3 h-3 text-red-500" /> by 
            <span className="font-medium text-primary">ZeroXTech | Chaitanya</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
import { Badge } from "@/components/ui/badge"

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
            <h4 className="font-semibold text-foreground">AI Models</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-smooth">ChatGPT</a></li>
              <li><a href="#" className="hover:text-primary transition-smooth">Gemini Flash</a></li>
              <li><a href="#" className="hover:text-primary transition-smooth">Gemini Pro</a></li>
              <li><a href="#" className="hover:text-primary transition-smooth">Coming Soon</a></li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Resources</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-smooth">Documentation</a></li>
              <li><a href="#" className="hover:text-primary transition-smooth">API Reference</a></li>
              <li><a href="#" className="hover:text-primary transition-smooth">Best Practices</a></li>
              <li><a href="#" className="hover:text-primary transition-smooth">Community</a></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-border/50 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © 2025 PromptForge. Built with intelligent AI assistance.
          </p>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-primary transition-smooth">Privacy</a>
            <a href="#" className="hover:text-primary transition-smooth">Terms</a>
            <a href="#" className="hover:text-primary transition-smooth">Security</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
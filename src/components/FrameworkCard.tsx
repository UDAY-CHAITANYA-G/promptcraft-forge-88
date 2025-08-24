import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface FrameworkCardProps {
  framework: {
    id: string
    name: string
    description: string
    components: string[]
    bestFor: string
    isDefault?: boolean
  }
  isSelected: boolean
  onSelect: () => void
}

export function FrameworkCard({ framework, isSelected, onSelect }: FrameworkCardProps) {
  return (
    <Card 
      className={`relative overflow-hidden transition-smooth cursor-pointer ${
        isSelected 
          ? 'border-primary shadow-glow bg-card-hover' 
          : 'border-border hover:border-primary/50 hover:bg-card-hover hover:shadow-accent'
      }`}
      onClick={onSelect}
    >
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-bold text-gradient">
              {framework.name}
            </h3>
            {framework.isDefault && (
              <Badge variant="outline" className="border-primary text-primary">
                Recommended
              </Badge>
            )}
          </div>
          {isSelected && (
            <div className="w-3 h-3 rounded-full bg-gradient-primary animate-pulse-glow" />
          )}
        </div>
        
        <p className="text-muted-foreground leading-relaxed">
          {framework.description}
        </p>
        
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {framework.components.map((component, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className="text-xs bg-muted/50 text-foreground border-border"
              >
                {component}
              </Badge>
            ))}
          </div>
          
          <div className="pt-2 border-t border-border/50">
            <p className="text-xs text-accent font-medium">
              Best for: {framework.bestFor}
            </p>
          </div>
        </div>
      </div>
      
      {isSelected && (
        <div className="absolute inset-0 bg-gradient-primary/5 pointer-events-none" />
      )}
    </Card>
  )
}
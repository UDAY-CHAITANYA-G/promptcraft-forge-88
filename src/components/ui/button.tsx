import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "relative overflow-hidden inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 after:pointer-events-none after:absolute after:inset-0 after:bg-[radial-gradient(400px_circle_at_var(--x)_var(--y),_rgba(255,255,255,0.15),_transparent_45%)] after:opacity-0 hover:after:opacity-100 after:transition-opacity after:duration-300",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/95 shadow-md hover:shadow-glow active:shadow-sm active:translate-y-px",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 active:bg-destructive/95 active:translate-y-px",
        outline:
          "border border-border bg-transparent hover:bg-card-hover hover:text-foreground active:bg-card-hover/70 active:translate-y-px",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 active:bg-secondary/90 active:translate-y-px",
        ghost: "hover:bg-card-hover hover:text-foreground active:bg-card-hover/80 active:translate-y-px",
        link: "text-primary underline-offset-4 hover:underline active:opacity-80",
        hero: "bg-gradient-primary text-primary-foreground hover:shadow-glow hover:scale-105 active:scale-95 transition-bounce font-semibold",
        glow: "bg-gradient-primary text-primary-foreground shadow-glow hover:shadow-accent active:shadow-accent/70 animate-pulse-glow",
        framework: "bg-card border border-border hover:border-primary hover:bg-card-hover hover:shadow-accent active:bg-card-hover/80 active:border-primary/60 transition-smooth text-left justify-start h-auto p-6",
        apiPrimary: "bg-gradient-to-r from-primary to-accent text-primary-foreground hover:from-primary/90 hover:to-accent/90 active:from-primary/95 active:to-accent/95 shadow-lg hover:shadow-xl active:shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 font-semibold",
        apiSecondary: "border-2 border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/50 active:bg-primary/15 active:border-primary/60 transition-all duration-300 transform hover:scale-105 active:scale-95 font-semibold"
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-lg px-8",
        xl: "h-14 rounded-xl px-10 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, onMouseMove, onMouseLeave, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"

    const handleMove: React.MouseEventHandler<HTMLElement> = (e) => {
      if (onMouseMove) onMouseMove(e as any)
      const target = e.currentTarget as HTMLElement
      const rect = target.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      target.style.setProperty("--x", `${x}px`)
      target.style.setProperty("--y", `${y}px`)
    }

    const handleLeave: React.MouseEventHandler<HTMLElement> = (e) => {
      if (onMouseLeave) onMouseLeave(e as any)
      const target = e.currentTarget as HTMLElement
      // Move the highlight out to fade naturally
      target.style.setProperty("--x", `-1000px`)
      target.style.setProperty("--y", `-1000px`)
    }

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        data-pf-button
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }

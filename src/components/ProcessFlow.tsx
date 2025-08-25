import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, KeyRound, LayoutGrid, ClipboardCheck, Settings2 } from "lucide-react"

export function ProcessFlow() {
  const steps = [
    {
      title: "Step 1: Sign Up & Configure",
      percent: "25%",
      points: [
        "User registration and API key setup",
        "Integration with Supabase Auth"
      ],
      icon: KeyRound,
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      title: "Step 2: Select Framework & Model",
      percent: "25%",
      points: [
        "Framework selection from 9 options",
        "AI model preference setting"
      ],
      icon: LayoutGrid,
      gradient: "from-purple-500 to-pink-500"
    },
    {
      title: "Step 3: Enter Task Description",
      percent: "25%",
      points: [
        "User input interface",
        "Context and requirement specification"
      ],
      icon: Settings2,
      gradient: "from-emerald-500 to-teal-500"
    },
    {
      title: "Step 4: Generate Structured Prompt",
      percent: "25%",
      points: [
        "AI-powered prompt generation",
        "Copy-to-clipboard functionality"
      ],
      icon: ClipboardCheck,
      gradient: "from-yellow-500 to-orange-500"
    }
  ] as const

  return (
    <section className="py-24 px-6 bg-gradient-to-b from-muted/20 to-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary text-sm px-4 py-2">
            Process Flow
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold">
            <span className="text-gradient bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              How It Works
            </span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Data Source: User workflow logic and <code>userPreferencesService.ts</code>. Priority: High — Educational and conversion-focused.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <Card key={index} className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-card to-card/80 backdrop-blur-sm">
                <div className={`absolute inset-0 bg-gradient-to-r ${step.gradient} opacity-5`} />
                <CardHeader className="relative pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold pr-3">{step.title}</CardTitle>
                    <div className={`p-2 rounded-xl bg-gradient-to-r ${step.gradient}`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="relative space-y-3">
                  <div className="text-sm font-medium text-primary">{step.percent} of the journey</div>
                  <ul className="space-y-2">
                    {step.points.map((p, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default ProcessFlow



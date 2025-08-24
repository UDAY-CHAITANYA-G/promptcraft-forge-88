import { useState } from "react"
import { FrameworkCard } from "./FrameworkCard"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import { useApiConfig } from "@/hooks/useApiConfig"

const frameworks = [
  {
    id: "roses",
    name: "R.O.S.E.S",
    description: "Role, Objective, Scenario, Expected output, Short form. A comprehensive framework perfect for complex prompts requiring detailed context and specific outcomes.",
    components: ["Role", "Objective", "Scenario", "Expected output", "Short form"],
    bestFor: "Complex tasks requiring detailed context",
    isDefault: true
  },
  {
    id: "ape",
    name: "A.P.E",
    description: "Action, Purpose, Expectation. A streamlined approach that focuses on what needs to be done, why it matters, and what you expect to receive.",
    components: ["Action", "Purpose", "Expectation"],
    bestFor: "Quick, action-oriented tasks"
  },
  {
    id: "tag",
    name: "T.A.G",
    description: "Task, Action, Goal. Simple yet effective framework that clearly defines the task, required actions, and desired outcome.",
    components: ["Task", "Action", "Goal"],
    bestFor: "Straightforward problem-solving"
  },
  {
    id: "era",
    name: "E.R.A",
    description: "Expectation, Role, Action. Starts with clear expectations, defines the role, then specifies the action to be taken.",
    components: ["Expectation", "Role", "Action"],
    bestFor: "Role-playing scenarios"
  },
  {
    id: "race",
    name: "R.A.C.E",
    description: "Role, Action, Context, Expectation. Balanced framework that provides role clarity, action steps, contextual information, and clear expectations.",
    components: ["Role", "Action", "Context", "Expectation"],
    bestFor: "Professional and business contexts"
  },
  {
    id: "rise",
    name: "R.I.S.E",
    description: "Role, Input, Steps, Expectation. Methodical approach that defines the role, required inputs, step-by-step process, and expected outcomes.",
    components: ["Role", "Input", "Steps", "Expectation"],
    bestFor: "Process-driven tasks"
  },
  {
    id: "care",
    name: "C.A.R.E",
    description: "Context, Action, Result, Example. Provides comprehensive context, clear actions, expected results, and helpful examples for clarity.",
    components: ["Context", "Action", "Result", "Example"],
    bestFor: "Educational and training content"
  },
  {
    id: "coast",
    name: "C.O.A.S.T",
    description: "Context, Objective, Actions, Scenario, Task. Extensive framework for complex scenarios requiring thorough context and multiple action steps.",
    components: ["Context", "Objective", "Actions", "Scenario", "Task"],
    bestFor: "Complex multi-step processes"
  },
  {
    id: "trace",
    name: "T.R.A.C.E",
    description: "Task, Role, Action, Context, Example. Comprehensive framework that covers all essential elements with practical examples for better understanding.",
    components: ["Task", "Role", "Action", "Context", "Example"],
    bestFor: "Detailed instruction-based prompts"
  }
]

export function FrameworkSelection() {
  const [selectedFramework, setSelectedFramework] = useState(frameworks[0].id)
  const navigate = useNavigate()
  const { user } = useAuth()
  const { hasAnyConfig } = useApiConfig()
  
  const handleGeneratePrompt = () => {
    if (!user) {
      navigate('/auth')
      return
    }

    if (hasAnyConfig) {
      navigate('/prompt-generator')
    } else {
      navigate('/api-config')
    }
  }
  
  return (
    <section className="py-20 px-6 bg-gradient-surface/50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold text-gradient">
            Choose Your Framework
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Select from 9 proven prompt engineering frameworks. Each framework is designed for specific use cases and optimized for different types of AI interactions.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {frameworks.map((framework) => (
            <FrameworkCard
              key={framework.id}
              framework={framework}
              isSelected={selectedFramework === framework.id}
              onSelect={() => setSelectedFramework(framework.id)}
            />
          ))}
        </div>
        
        <div className="text-center">
          <Button 
            variant="hero" 
            size="lg" 
            className="text-lg"
            onClick={handleGeneratePrompt}
          >
            Generate Prompt with {frameworks.find(f => f.id === selectedFramework)?.name}
          </Button>
        </div>
      </div>
    </section>
  )
}
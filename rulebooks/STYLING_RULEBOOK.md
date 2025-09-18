# PromptCraft Forge - Styling Rulebook

## 📋 **Overview**
This rulebook defines the styling standards, design system, and visual guidelines for the PromptCraft Forge application. It ensures consistent visual identity, accessibility, and maintainable styling across the entire codebase.

---

## 🎨 **Design System Foundation**

### **Brand Identity**
- **Primary Color**: Purple (`hsl(262 83% 58%)`) - Modern AI platform aesthetic
- **Secondary Color**: Blue-gray (`hsl(210 40% 96%)`) - Professional and trustworthy
- **Accent Color**: Light purple (`hsl(280 70% 60%)`) - Highlights and interactions
- **Typography**: Clean, modern sans-serif fonts with proper hierarchy
- **Border Radius**: `0.75rem` (12px) for consistent rounded corners

### **Color Philosophy**
- **Light Mode**: Clean, minimal white backgrounds with subtle grays
- **Dark Mode**: Deep dark backgrounds with high contrast text
- **Accessibility**: WCAG AA compliant color contrasts
- **Semantic Colors**: Success (green), warning (orange), destructive (red)

---

## 🎯 **CSS Architecture**

### **CSS Variables System**
All colors and design tokens are defined as CSS custom properties for consistency and theming.

#### **Color Variables Structure**
```css
/* ✅ Good: CSS Variable Pattern */
:root {
  /* Base Colors */
  --background: 0 0% 100%;
  --foreground: 240 10% 3.9%;
  
  /* Brand Colors */
  --primary: 262 83% 58%;
  --primary-foreground: 0 0% 98%;
  --primary-glow: 262 100% 70%;
  
  /* Surface Colors */
  --card: 0 0% 100%;
  --card-foreground: 240 10% 3.9%;
  --card-hover: 240 5% 96%;
  
  /* Status Colors */
  --success: 142 76% 36%;
  --warning: 38 92% 50%;
  --destructive: 0 84.2% 60.2%;
}
```

#### **Gradient Variables**
```css
/* ✅ Good: Gradient Pattern */
:root {
  --gradient-primary: linear-gradient(135deg, hsl(262 83% 58%), hsl(280 70% 60%));
  --gradient-secondary: linear-gradient(135deg, hsl(210 40% 96%), hsl(262 83% 58%));
  --gradient-surface: linear-gradient(135deg, hsl(0 0% 100%), hsl(240 4.8% 95.9%));
  --gradient-hero: linear-gradient(135deg, hsl(0 0% 100%), hsl(240 4.8% 95.9%));
}
```

#### **Shadow Variables**
```css
/* ✅ Good: Shadow Pattern */
:root {
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --shadow-glow: 0 0 40px hsl(262 83% 58% / 0.15);
  --shadow-accent: 0 0 30px hsl(280 70% 60% / 0.1);
}
```

---

## 🎨 **Tailwind CSS Configuration**

### **Custom Color System**
```typescript
// ✅ Good: Tailwind Color Configuration
export default {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
          glow: 'hsl(var(--primary-glow))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
          glow: 'hsl(var(--secondary-glow))'
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
          hover: 'hsl(var(--card-hover))'
        }
      }
    }
  }
}
```

### **Custom Utilities**
```css
/* ✅ Good: Custom Utility Classes */
@layer utilities {
  .text-gradient {
    background: var(--gradient-primary);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  .bg-gradient-primary {
    background: var(--gradient-primary);
  }
  
  .bg-gradient-secondary {
    background: var(--gradient-secondary);
  }
  
  .bg-gradient-surface {
    background: var(--gradient-surface);
  }
  
  .bg-gradient-hero {
    background: var(--gradient-hero);
  }
  
  .shadow-glow {
    box-shadow: var(--shadow-glow);
  }
  
  .shadow-accent {
    box-shadow: var(--shadow-accent);
  }
  
  .transition-smooth {
    transition: var(--transition-smooth);
  }
  
  .transition-bounce {
    transition: var(--transition-bounce);
  }
  
  .animate-float {
    animation: float 6s ease-in-out infinite;
  }
  
  .animate-glow {
    animation: var(--animation-glow);
  }
  
  .animate-pulse-glow {
    animation: pulse-glow 2s ease-in-out infinite;
  }
}
```

### **Common Gradient Patterns**
```typescript
// ✅ Good: Gradient Color Combinations
const gradientPatterns = {
  blue: "from-blue-500 to-cyan-500",
  purple: "from-purple-500 to-pink-500", 
  emerald: "from-emerald-500 to-teal-500",
  yellow: "from-yellow-500 to-orange-500",
  red: "from-red-500 to-pink-500",
  indigo: "from-indigo-500 to-purple-500"
}

// Usage in components
<div className={`bg-gradient-to-r ${gradientPatterns.blue} rounded-xl`}>
  <Icon className="w-6 h-6 text-white" />
</div>
```

---

## 🧩 **Component Styling Patterns**

### **Button Component Styling**

#### **Button Variants**
```typescript
// ✅ Good: Button Variant Pattern
const buttonVariants = cva(
  "relative overflow-hidden inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/95 shadow-md hover:shadow-glow active:shadow-sm active:translate-y-px",
        hero: "bg-gradient-primary text-primary-foreground hover:shadow-glow hover:scale-105 active:scale-95 transition-bounce font-semibold",
        glow: "bg-gradient-primary text-primary-foreground shadow-glow hover:shadow-accent active:shadow-accent/70 animate-pulse-glow",
        framework: "bg-card border border-border hover:border-primary hover:bg-card-hover hover:shadow-accent active:bg-card-hover/80 active:border-primary/60 transition-smooth text-left justify-start h-auto p-6"
      }
    }
  }
)
```

#### **Button Size Standards**
- **Small**: `h-9 rounded-md px-3` - Compact actions
- **Default**: `h-10 px-4 py-2` - Standard buttons
- **Large**: `h-11 rounded-lg px-8` - Primary actions
- **Extra Large**: `h-14 rounded-xl px-10 text-base` - Hero buttons
- **Icon**: `h-10 w-10` - Icon-only buttons
- **Icon Small**: `h-8 w-8 p-0` - Small icon buttons for mobile menus

### **Card Component Styling**

#### **Card Structure**
```typescript
// ✅ Good: Card Component Pattern
const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-lg border bg-card text-card-foreground shadow-sm",
        className
      )}
      {...props}
    />
  )
)

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex flex-col space-y-1.5 p-6", className)}
      {...props}
    />
  )
)
```

#### **Card Spacing Standards**
- **Header**: `p-6` with `space-y-1.5` for title and description
- **Content**: `p-6 pt-0` to connect with header
- **Footer**: `p-6 pt-0` with `flex items-center` for actions

### **Input Component Styling**

#### **Input Standards**
```typescript
// ✅ Good: Input Component Pattern
const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
```

### **Form Validation Patterns**
```typescript
// ✅ Good: Form Validation Pattern
const [formData, setFormData] = useState({
  taskDescription: '',
  tone: 'professional',
  length: 'medium'
});

const [errors, setErrors] = useState<Record<string, string>>({});

const validateForm = () => {
  const newErrors: Record<string, string> = {};
  
  if (!formData.taskDescription.trim()) {
    newErrors.taskDescription = 'Task description is required';
  }
  
  if (formData.taskDescription.length < 10) {
    newErrors.taskDescription = 'Task description must be at least 10 characters';
  }
  
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

// ✅ Good: Input with Validation
<div className="space-y-2">
  <Label htmlFor="taskDescription">Task Description</Label>
  <Textarea
    id="taskDescription"
    placeholder="Describe what you want to create..."
    value={formData.taskDescription}
    onChange={(e) => setFormData(prev => ({ ...prev, taskDescription: e.target.value }))}
    className={errors.taskDescription ? "border-destructive" : ""}
  />
  {errors.taskDescription && (
    <p className="text-sm text-destructive">{errors.taskDescription}</p>
  )}
</div>
```

### **Database Form Patterns**
```typescript
// ✅ Good: Database Form with Loading State
const [saving, setSaving] = useState(false);
const [saveError, setSaveError] = useState<string | null>(null);

const handleSave = async () => {
  setSaving(true);
  setSaveError(null);
  
  try {
    const success = await databaseService.saveData(userId, formData);
    if (success) {
      toast({
        title: "Success",
        description: "Data saved successfully",
      });
    } else {
      setSaveError("Failed to save data");
    }
  } catch (error) {
    setSaveError("An error occurred while saving");
  } finally {
    setSaving(false);
  }
};

// ✅ Good: Form with Database Integration
<form onSubmit={handleSave} className="space-y-4">
  {/* Form fields */}
  
  {saveError && (
    <Alert className="border-red-500/50 bg-red-500/5">
      <AlertCircle className="h-4 w-4 text-red-500" />
      <AlertDescription className="text-red-600 text-sm">
        {saveError}
      </AlertDescription>
    </Alert>
  )}
  
  <Button type="submit" disabled={saving} className="w-full">
    {saving ? (
      <>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Saving...
      </>
    ) : (
      <>
        <Save className="mr-2 h-4 w-4" />
        Save
      </>
    )}
  </Button>
</form>
```

### **Badge Component Styling**

#### **Badge Variants**
```typescript
// ✅ Good: Badge Component Pattern
const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)
```

### **Alert Component Styling**

#### **Alert Variants**
```typescript
// ✅ Good: Alert Component Pattern
const alertVariants = cva(
  "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        destructive: "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)
```

---

## 🎭 **Animation & Interaction Patterns**

### **Transition Standards**
```css
/* ✅ Good: Transition Variables */
:root {
  --transition-smooth: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  --transition-bounce: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}
```

### **Animation Keyframes**
```css
/* ✅ Good: Animation Patterns */
@keyframes glow {
  from {
    box-shadow: 0 0 20px hsl(var(--primary-glow) / 0.2);
  }
  to {
    box-shadow: 0 0 40px hsl(var(--primary-glow) / 0.4);
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes pulse-glow {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}
```

### **Interactive Effects**
- **Hover States**: Subtle scale and shadow changes
- **Active States**: Pressed effect with `translate-y-px`
- **Focus States**: Ring outline with primary color
- **Loading States**: Pulse animations for async operations

---

## 📱 **Responsive Design Standards**

### **Breakpoint System**
- **Mobile**: `< 768px` - Single column, stacked layout
- **Tablet**: `768px - 1024px` - Two column, adjusted spacing
- **Desktop**: `1024px - 1400px` - Multi-column, full features
- **Large Desktop**: `> 1400px` - Centered container with max-width

### **Container Standards**
```typescript
// ✅ Good: Container Configuration
container: {
  center: true,
  padding: '2rem',
  screens: {
    '2xl': '1400px'
  }
}
```

### **Responsive Patterns**
- **Mobile-First**: Start with mobile styles, enhance for larger screens
- **Flexible Grids**: Use CSS Grid and Flexbox for responsive layouts
- **Adaptive Typography**: Scale text sizes appropriately
- **Touch-Friendly**: Minimum 44px touch targets on mobile

### **Mobile-Specific Patterns**
```typescript
// ✅ Good: Mobile Menu Pattern
const [showMobileMenu, setShowMobileMenu] = useState(false);

// Mobile menu button - visible only on small screens
<div className="lg:hidden">
  <Button
    variant="ghost"
    size="sm"
    className="h-8 w-8 p-0"
    onClick={() => setShowMobileMenu(!showMobileMenu)}
    title="Menu"
  >
    <Settings className="h-4 w-4" />
  </Button>
</div>

// ✅ Good: Responsive Layout Pattern
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full max-w-7xl mx-auto">
  {/* Left Side - Task Input with Menu */}
  <div className="relative h-full">
    {/* Menu positioned to the left of the task card - hidden on small screens */}
    <div className="absolute -left-16 top-0 z-10 hidden lg:block">
      <LeftSidebar showNavigation={true} />
    </div>
    
    <Card className="h-full">
      {/* Content */}
    </Card>
  </div>
</div>

// ✅ Good: Responsive Button Layout
<div className="flex flex-col sm:flex-row gap-3 justify-center">
  <Button variant="default" className="w-full sm:w-auto">
    Primary Action
  </Button>
  <Button variant="outline" className="w-full sm:w-auto">
    Secondary Action
  </Button>
</div>
```

---

## 🌙 **Dark Mode Implementation**

### **Dark Mode Variables**
```css
/* ✅ Good: Dark Mode Pattern */
.dark {
  --background: 240 10% 3.9%;
  --foreground: 0 0% 98%;
  --card: 240 10% 3.9%;
  --card-foreground: 0 0% 98%;
  --card-hover: 240 5.9% 10%;
  --border: 240 3.7% 15.9%;
  --input: 240 3.7% 15.9%;
}
```

### **Dark Mode Standards**
- [ ] **Consistent contrast** - Maintain WCAG AA compliance
- [ ] **Preserve brand colors** - Keep primary colors consistent
- [ ] **Smooth transitions** - Animate between light/dark modes
- [ ] **System preference** - Respect user's OS setting
- [ ] **Manual toggle** - Provide user control

---

## 🎨 **Layout & Spacing Standards**

### **Spacing Scale**
- **xs**: `0.25rem` (4px) - Fine details
- **sm**: `0.5rem` (8px) - Small gaps
- **md**: `1rem` (16px) - Standard spacing
- **lg**: `1.5rem` (24px) - Section spacing
- **xl**: `2rem` (32px) - Large sections
- **2xl**: `3rem` (48px) - Page sections

### **Layout Patterns**

#### **Page Layout Structure**
```typescript
// ✅ Good: Standard Page Layout Pattern
<div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
  <Navbar />
  <div className="pt-20">
    <LeftSidebar showNavigation={false} />
    <main className="ml-64 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Page content */}
      </div>
    </main>
  </div>
</div>
```

#### **Grid Layout Patterns**
```typescript
// ✅ Good: Grid Layout Patterns
// Two-column layout
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full max-w-7xl mx-auto">

// Three-column feature grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

// Four-column process grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
```

### **Grid Systems**
- **Card Grids**: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`
- **Feature Grids**: `grid grid-cols-1 lg:grid-cols-2 gap-8`
- **Form Layouts**: `space-y-6` for form sections

---

## 🎯 **Typography Standards**

### **Font Hierarchy**
- **H1**: `text-4xl md:text-5xl font-bold` - Page titles
- **H2**: `text-3xl md:text-4xl font-semibold` - Section titles
- **H3**: `text-2xl font-semibold` - Subsection titles
- **H4**: `text-xl font-medium` - Card titles
- **Body**: `text-base` - Regular text
- **Small**: `text-sm text-muted-foreground` - Secondary text

### **Text Utilities**
```css
/* ✅ Good: Typography Utilities */
.text-gradient {
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

---

## 🎨 **Component-Specific Styling**

### **Hero Section Styling**
```typescript
// ✅ Good: Hero Section Pattern
<div className="relative min-h-screen bg-gradient-hero flex items-center justify-center">
  <div className="container mx-auto px-4 text-center">
    <h1 className="text-4xl md:text-6xl font-bold text-gradient mb-6">
      AI-Powered Prompt Generation
    </h1>
    <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
      Create perfect prompts with our intelligent framework system
    </p>
    <Button variant="hero" size="xl" className="animate-float">
      Get Started
    </Button>
  </div>
</div>
```

### **Feature Card Styling**
```typescript
// ✅ Good: Feature Card Pattern
<Card className="group hover:shadow-glow transition-smooth">
  <CardHeader>
    <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4">
      <Icon className="w-6 h-6 text-primary-foreground" />
    </div>
    <CardTitle>Feature Title</CardTitle>
    <CardDescription>
      Feature description with clear benefits
    </CardDescription>
  </CardHeader>
  <CardContent>
    <Button variant="framework" className="w-full">
      Learn More
    </Button>
  </CardContent>
</Card>
```

### **API Configuration Styling**
```typescript
// ✅ Good: API Config Pattern
<Card className="border-2 border-primary/20 hover:border-primary/40 transition-smooth">
  <CardHeader>
    <div className="flex items-center justify-between">
      <CardTitle className="flex items-center gap-2">
        <Icon className="w-5 h-5" />
        Provider Name
      </CardTitle>
      <Badge variant="secondary">Active</Badge>
    </div>
  </CardHeader>
  <CardContent className="space-y-4">
    <div className="space-y-2">
      <Label>API Key</Label>
      <Input type="password" placeholder="Enter your API key" />
    </div>
    <div className="flex gap-2">
      <Button variant="apiPrimary" className="flex-1">
        Save Configuration
      </Button>
      <Button variant="apiSecondary" className="flex-1">
        Test Connection
      </Button>
    </div>
  </CardContent>
</Card>
```

### **Feature Card Styling with Gradients**
```typescript
// ✅ Good: Feature Card with Gradient Pattern
<Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 bg-gradient-to-br from-card to-card/80 backdrop-blur-sm">
  {/* Gradient overlay */}
  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
  
  {/* Border gradient */}
  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
  
  <CardHeader className="relative pb-4">
    <div className="flex items-center gap-4 mb-4">
      <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
        <Icon className="w-6 h-6 text-white" />
      </div>
      <CardTitle className="text-xl group-hover:text-primary transition-colors duration-300">
        Feature Title
      </CardTitle>
    </div>
  </CardHeader>
</Card>
```

### **Process Flow Card Styling**
```typescript
// ✅ Good: Process Flow Card Pattern
<Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-card to-card/80 backdrop-blur-sm">
  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-cyan-500/5" />
  <CardHeader className="relative pb-2">
    <div className="flex items-center justify-between">
      <CardTitle className="text-lg font-semibold pr-3">Step Title</CardTitle>
      <div className="p-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500">
        <Icon className="w-5 h-5 text-white" />
      </div>
    </div>
  </CardHeader>
  <CardContent className="relative space-y-3">
    <div className="text-sm font-medium text-primary">25% of the journey</div>
    <ul className="space-y-2">
      <li className="flex items-start gap-2 text-sm text-foreground">
        <CheckCircle className="w-4 h-4 text-primary mt-0.5" />
        <span>Feature description</span>
      </li>
    </ul>
  </CardContent>
</Card>
```

---

## 🎨 **Status & Feedback Styling**

### **Status Colors**
- **Success**: `bg-success text-success-foreground` - Green for positive actions
- **Warning**: `bg-warning text-warning-foreground` - Orange for cautions
- **Destructive**: `bg-destructive text-destructive-foreground` - Red for errors
- **Info**: `bg-primary text-primary-foreground` - Purple for information

### **Loading States**
```typescript
// ✅ Good: Loading State Pattern
<Button disabled={isLoading}>
  {isLoading ? (
    <>
      <Loader2 className="w-4 h-4 animate-spin" />
      Loading...
    </>
  ) : (
    'Submit'
  )}
</Button>

// ✅ Good: Database Loading State
{loading ? (
  <div className="flex items-center justify-center p-8">
    <div className="text-center space-y-4">
      <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
      <p className="text-muted-foreground">Loading data...</p>
    </div>
  </div>
) : data.length === 0 ? (
  <div className="text-center p-8 text-muted-foreground">
    <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
    <p>No data available</p>
  </div>
) : (
  <div className="space-y-4">
    {/* Data content */}
  </div>
)}

// ✅ Good: Loading Button with Icons
<Button disabled={isGenerating} className="w-full">
  {isGenerating ? (
    <>
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      Generating...
    </>
  ) : (
    <>
      <Sparkles className="mr-2 h-4 w-4" />
      Generate Prompt
    </>
  )}
</Button>

// ✅ Good: Loading State with Skeleton
{loading ? (
  <div className="space-y-4">
    <div className="h-4 bg-muted rounded animate-pulse" />
    <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
    <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
  </div>
) : (
  <div>
    {/* Actual content */}
  </div>
)}

// ✅ Good: Conditional Loading States
{isGenerating ? (
  <div className="flex items-center justify-center p-8">
    <div className="text-center space-y-4">
      <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
      <p className="text-muted-foreground">Generating your prompt...</p>
    </div>
  </div>
) : lastResponse ? (
  <div className="space-y-4">
    {/* Generated content */}
  </div>
) : (
  <div className="text-center p-8 text-muted-foreground">
    <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
    <p>Enter your task description to get started</p>
  </div>
)}
```

### **Error State Styling**
```typescript
// ✅ Good: Error Alert Pattern
<Alert className="border-red-500/50 bg-red-500/5 backdrop-blur-sm">
  <Database className="h-4 w-4 text-red-500" />
  <AlertDescription className="text-red-600 text-sm">
    <span className="font-semibold">Database Connection Issue:</span> Error message
    <Button 
      variant="outline" 
      size="sm" 
      className="ml-2 mt-1 border-red-500/30 text-red-600 hover:bg-red-500/10 text-xs h-6 px-2"
      onClick={retryAction}
    >
      Retry Connection
    </Button>
  </AlertDescription>
</Alert>
```

### **Success State Styling**
```typescript
// ✅ Good: Success Badge Pattern
<Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-primary/20">
  Vibe Coding Enabled
</Badge>
```

### **Toast Notifications**
```typescript
// ✅ Good: Toast Pattern
toast({
  title: "Success",
  description: "Your prompt has been generated successfully!",
  variant: "default"
})

toast({
  title: "Error",
  description: "Failed to generate prompt. Please try again.",
  variant: "destructive"
})

// ✅ Good: Toast with Dynamic Content
toast({
  title: "Success!",
  description: `Prompt generated using ${response.model?.toUpperCase()} and ${response.framework?.toUpperCase()} framework`,
})

// ✅ Good: Toast with Warning
toast({
  title: "API Key Warning",
  description: `The ${provider} API key has warnings: ${isValid.warnings.join(', ')}`,
  variant: "default"
})
```

### **User Feedback Patterns**
```typescript
// ✅ Good: Loading State with Toast
const handleAction = async () => {
  try {
    setLoading(true);
    const result = await service.performAction();
    
    toast({
      title: "Success",
      description: "Action completed successfully!",
    });
  } catch (error) {
    toast({
      title: "Error",
      description: "Failed to complete action. Please try again.",
      variant: "destructive"
    });
  } finally {
    setLoading(false);
  }
};

// ✅ Good: Confirmation Dialog
const handleDelete = async () => {
  if (window.confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
    try {
      await service.deleteItem(id);
      toast({
        title: "Success",
        description: "Item deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete item",
        variant: "destructive"
      });
    }
  }
};
```

### **Copy Functionality Patterns**
```typescript
// ✅ Good: Copy to Clipboard Pattern
const [copied, setCopied] = useState(false);

const handleCopy = async () => {
  try {
    await navigator.clipboard.writeText(generatedPrompt);
    setCopied(true);
    toast({
      title: "Copied!",
      description: "Prompt copied to clipboard",
    });
    
    // Reset copied state after 2 seconds
    setTimeout(() => setCopied(false), 2000);
  } catch (error) {
    toast({
      title: "Error",
      description: "Failed to copy to clipboard",
      variant: "destructive"
    });
  }
};

// ✅ Good: Copy Button with State
<Button
  variant="outline"
  size="sm"
  onClick={handleCopy}
  className="flex items-center gap-2"
>
  {copied ? (
    <>
      <CheckCircle className="h-4 w-4 text-green-500" />
      Copied!
    </>
  ) : (
    <>
      <Copy className="h-4 w-4" />
      Copy
    </>
  )}
</Button>
```

---

## 🎨 **Icon & Visual Element Patterns**

### **Icon Usage Standards**
- **Size**: `w-4 h-4` for small icons, `w-5 h-5` for medium, `w-6 h-6` for large
- **Color**: Use semantic colors (`text-primary`, `text-muted-foreground`, `text-destructive`)
- **Spacing**: `gap-2` for icon + text, `gap-4` for larger spacing
- **Alignment**: `items-center` for horizontal alignment, `items-start` for list items

### **Icon Container Patterns**
```typescript
// ✅ Good: Icon Container Patterns
// Small icon button
<Button variant="ghost" size="sm" className="h-8 w-8 p-0">
  <Settings className="h-4 w-4" />
</Button>

// Icon with gradient background
<div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-lg">
  <Icon className="w-6 h-6 text-white" />
</div>

// Icon in card header
<div className="flex items-center gap-2">
  <Bot className="w-5 h-5" />
  <span className="text-lg font-semibold">Title</span>
</div>
```

### **Visual Hierarchy Patterns**
```typescript
// ✅ Good: Visual Hierarchy
// Page title with gradient
<h1 className="text-8xl font-bold text-gradient">404</h1>

// Section title
<h2 className="text-2xl font-semibold text-foreground">Page Not Found</h2>

// Description text
<p className="text-muted-foreground">Description text</p>

// Brand attribution
<div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
  <Building2 className="w-4 h-4" />
  <span className="font-medium">ZeroXTech | Chaitanya</span>
</div>
```

---

## 🎨 **Accessibility Standards**

### **Color Contrast**
- [ ] **WCAG AA compliance** - Minimum 4.5:1 contrast ratio
- [ ] **Focus indicators** - Visible focus rings on all interactive elements
- [ ] **Color independence** - Information not conveyed by color alone
- [ ] **High contrast mode** - Support for system high contrast settings

### **Interactive Elements**
- [ ] **Touch targets** - Minimum 44px for mobile devices
- [ ] **Keyboard navigation** - All functionality accessible via keyboard
- [ ] **Screen reader support** - Proper ARIA labels and descriptions
- [ ] **Motion preferences** - Respect `prefers-reduced-motion`

### **Semantic HTML**
```typescript
// ✅ Good: Semantic HTML Pattern
<main className="min-h-screen bg-background">
  <header className="sticky top-0 z-50">
    <Navbar />
  </header>
  <section className="container mx-auto px-4 py-8">
    <h1 className="text-4xl font-bold mb-8">Page Title</h1>
    <article className="prose max-w-none">
      <p>Content goes here</p>
    </article>
  </section>
</main>
```

---

## 🎨 **Performance Optimization**

### **CSS Optimization**
- [ ] **Critical CSS** - Inline critical styles for above-the-fold content
- [ ] **Unused CSS removal** - Purge unused Tailwind classes
- [ ] **CSS minification** - Minify CSS in production builds
- [ ] **CSS splitting** - Split CSS by route for better caching

### **Animation Performance**
- [ ] **GPU acceleration** - Use `transform` and `opacity` for animations
- [ ] **Reduced motion** - Respect user's motion preferences
- [ ] **Animation duration** - Keep animations under 300ms for UI feedback
- [ ] **Easing functions** - Use appropriate easing for natural feel

---

## 🎨 **Styling Best Practices**

### **Class Organization**
```typescript
// ✅ Good: Class Organization
<div className={cn(
  // Base styles
  "flex items-center justify-center",
  // Conditional styles
  isActive && "bg-primary text-primary-foreground",
  // Size variants
  size === "large" ? "h-12 px-6" : "h-10 px-4",
  // Custom classes
  className
)}>
```

### **Component Styling Patterns**
- [ ] **Use shadcn/ui components** as base
- [ ] **Extend with Tailwind classes** for customization
- [ ] **Use CSS variables** for theming
- [ ] **Consistent spacing** using design system tokens
- [ ] **Semantic class names** that describe purpose, not appearance

### **Responsive Design**
- [ ] **Mobile-first approach** - Start with mobile styles
- [ ] **Progressive enhancement** - Add features for larger screens
- [ ] **Flexible layouts** - Use CSS Grid and Flexbox
- [ ] **Adaptive typography** - Scale text appropriately

---

## 🚨 **Common Styling Anti-Patterns**

### **❌ Don't Do This**
```typescript
// ❌ Bad: Inline styles
<div style={{ color: 'red', fontSize: '16px' }}>

// ❌ Bad: Hardcoded colors
<div className="bg-purple-500 text-white">

// ❌ Bad: Inconsistent spacing
<div className="mt-4 mb-2 ml-8 mr-3">

// ❌ Bad: Missing responsive design
<div className="grid grid-cols-3 gap-4">

// ❌ Bad: Poor contrast
<div className="bg-gray-300 text-gray-400">

// ❌ Bad: Missing hover states
<Button className="bg-primary text-white">

// ❌ Bad: Inconsistent icon sizes
<Icon className="w-3 h-3" />
<Icon className="w-8 h-8" />

// ❌ Bad: Missing focus states
<input className="border border-gray-300" />
```

### **✅ Do This Instead**
```typescript
// ✅ Good: Tailwind classes
<div className="text-destructive text-base">

// ✅ Good: Design system colors
<div className="bg-primary text-primary-foreground">

// ✅ Good: Consistent spacing
<div className="p-6 space-y-4">

// ✅ Good: Responsive design
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

// ✅ Good: Proper contrast
<div className="bg-background text-foreground">

// ✅ Good: Complete hover states
<Button className="bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/95">

// ✅ Good: Consistent icon sizes
<Icon className="w-4 h-4" />
<Icon className="w-5 h-5" />

// ✅ Good: Proper focus states
<input className="border border-input focus-visible:ring-2 focus-visible:ring-ring" />
```

---

## 📚 **Styling Resources**

### **Design System Tools**
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [CSS Custom Properties](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

### **Color Tools**
- [Coolors.co](https://coolors.co/) - Color palette generator
- [Contrast Checker](https://webaim.org/resources/contrastchecker/) - WCAG compliance
- [HSL Color Picker](https://hslpicker.com/) - HSL color values

### **Animation Resources**
- [Cubic Bezier](https://cubic-bezier.com/) - Easing function generator
- [Animista](https://animista.net/) - CSS animation library
- [Framer Motion](https://www.framer.com/motion/) - React animation library

---

**Last Updated**: September 18th, 2025  
**Version**: 1.0  
**Maintainer**: Development Team

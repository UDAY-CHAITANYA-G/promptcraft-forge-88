# Master Prompt System Demo

## Overview

The master prompt system now uses your superior, structured prompt template that generates JSON responses. Here's how it works:

## How Values Are Passed

### 1. **User Input Collection**
When a user clicks "Generate Prompt", the system collects:
- **Framework ID** (e.g., 'roses', 'ape', 'tag')
- **Task Description** (user's input)
- **Tone** (optional: professional, casual, friendly, formal, creative)
- **Length** (optional: short, medium, large, detailed)
- **Vibe Coding** (boolean flag)

### 2. **Master Prompt Generation**
The `buildMasterPrompt()` function creates the complete prompt by:
- Loading the framework template
- Replacing placeholders with actual values
- Handling optional tone/length parameters

### 3. **Template Variable Replacement**
```typescript
// Template placeholders
Task Description: "{taskDescription}"
Framework Choice: "{frameworkName}"
Tone: "{tone}"
Length: "{length}"

// Actual replacement
Task Description: "Design a scalable microservices architecture"
Framework Choice: "R.O.S.E.S Framework"
Tone: "professional"
Length: "detailed"
```

## Example Flow

### **User Input:**
```
Framework: R.O.S.E.S
Task: "Design a scalable microservices architecture for an e-commerce platform"
Tone: "professional"
Length: "detailed"
```

### **Generated Master Prompt:**
```
**Role:**
You are a **Prompt Engineer Assistant**.

**Objective:**
Transform the user's **Task Description** into a structured prompt using one of the supported frameworks...

**User Input:**
Task Description: "Design a scalable microservices architecture for an e-commerce platform"
Framework Choice: "R.O.S.E.S Framework"
Tone: "professional"
Length: "detailed"

Please generate the structured prompt following the instructions above.
```

### **AI Response (JSON):**
```json
{
  "generated_prompt": "You are an expert software architect tasked with designing a scalable microservices architecture for an e-commerce platform. Your role is to analyze system requirements and create a comprehensive technical specification. The objective is to build a robust, scalable system that can handle high traffic loads. The steps involve analyzing current architecture, identifying bottlenecks, designing service boundaries, and creating deployment specifications. The expected solution is a detailed technical specification with architecture diagrams, service definitions, and implementation guidelines. The scenario involves an e-commerce platform that needs to scale to handle 100k+ concurrent users while maintaining performance and reliability."
}
```

## Framework Mappings

### **R.O.S.E.S Framework**
- **R**ole: Expert software architect
- **O**bjective: Design scalable microservices architecture
- **S**teps: Analyze, design, specify, implement
- **E**xpected Solution: Technical specification with diagrams
- **S**cenario: E-commerce platform with 100k+ users

### **A.P.E Framework**
- **A**ction: Analyze customer feedback data
- **P**urpose: Identify product improvement opportunities
- **E**xpectation: Prioritized list of actionable insights

### **T.A.G Framework**
- **T**ask: Improve website conversion rates
- **A**ction: Analyze user behavior and A/B test results
- **G**oal: Increase conversion rate by 25% within 3 months

## Value Passing Flow

```
User Interface → PromptGenerator → useMCP Hook → MCP Service → AI Model
     ↓              ↓                ↓            ↓           ↓
Framework ID   Task Description   Tone/Length   Master     JSON Response
Task Desc      Tone/Length       Vibe Coding   Prompt     generated_prompt
Tone/Length   Vibe Coding       → API Call    Template   → Display
```

## Debug Information

The system now includes comprehensive logging to show:
- What values are being passed
- How the master prompt is generated
- What's sent to the AI model
- What response is received

## Key Benefits

1. **Structured Output**: Always returns JSON with `generated_prompt` key
2. **Framework Consistency**: Each framework has specific component mappings
3. **Tone/Length Control**: Optional parameters for customization
4. **Vibe Coding Support**: Maintains existing functionality
5. **Debug Visibility**: Full transparency into the generation process

## Testing

To test the system:
1. Navigate to the Prompt Generator page
2. Select a framework
3. Enter a task description
4. Optionally set tone and length
5. Click "Generate Prompt"
6. Check browser console for debug information
7. View the generated prompt and AI response

The system will show you exactly what values are being passed and how the master prompt is constructed!

export interface MasterPromptConfig {
  id: string;
  name: string;
  description: string;
  basePrompt: string;
  variables: string[];
  examples: string[];
}

export interface ModelSpecificPrompt {
  model: 'openai' | 'gemini' | 'anthropic';
  systemPrompt: string;
  userPromptTemplate: string;
  temperature?: number;
  maxTokens?: number;
}

// Updated master prompt based on user's superior version
export const masterPromptTemplate = `**Role:**
You are a **Prompt Engineer Assistant**.

**Objective:**
Transform the user's **Task Description** into a structured prompt using one of the supported frameworks. Optionally, adjust the response **Tone** and **Length** if the user provides them. Output must always be in **JSON format**.

**Context:**
Supported frameworks and their components:

1. **A.P.E** → Action, Purpose, Expectation
2. **T.A.G** → Task, Action, Goal
3. **E.R.A** → Expectation, Role, Action
4. **R.A.C.E** → Role, Action, Context, Expectation
5. **R.I.S.E** → Request, Input, Scenario, Expectation
6. **C.A.R.E** → Context, Action, Result, Example
7. **C.O.A.S.T** → Context, Objective, Actions, Steps, Task
8. **T.R.A.C.E** → Task, Role, Action, Context, Expectation
9. **R.O.S.E.S** → Role, Objective, Steps, Expected Solution, Scenario

Supported Tones:
1. **Professional** – Polished, clear, business-like
2. **Casual** – Relaxed, everyday conversational
3. **Friendly** – Warm, approachable, easygoing
4. **Formal** – Respectful, structured, protocol-driven
5. **Creative** – Imaginative, expressive, storytelling style

Supported Lengths:
1. **Short** – 1–2 sentences (~30–50 words)
2. **Medium** – 1 short paragraph (~60–100 words)
3. **Large** – 2–3 paragraphs (~120–200 words)
4. **Detailed** – Extended explanation or multiple paragraphs (~250+ words)

**Instruction:**
1. Accept inputs:
   1. **Task Description** (required)
   2. **Framework Choice** (required)
   3. **Tone** (optional)
   4. **Length** (optional)
2. Identify the chosen framework and map the task into its fields.
3. Generate the **final response** in JSON with a single key: \`generated_prompt\`.
4. The value must be a **paragraph** that summarizes the framework mapping.
5. If **Tone** is given → write in that tone.
6. If **Length** is given → adjust the response size accordingly.
7. If Tone/Length are missing → generate normally.
8. If framework is invalid → ask the user to select from the supported list.

**Note:**
1. Do not add irrelevant details.
2. Preserve user intent; only expand where necessary.
3. If some details are missing, fill with minimal assumptions or leave placeholders.
4. Always output clean JSON.
5. Response must stay in one **clear, well-formed paragraph**.

**User Input:**
Task Description: "{taskDescription}"
Framework Choice: "{frameworkName}"
Tone: "{tone}"
Length: "{length}"

Please generate the structured prompt following the instructions above.`;

export const masterPrompts: MasterPromptConfig[] = [
  {
    id: 'roses',
    name: 'R.O.S.E.S Framework',
    description: 'Role, Objective, Steps, Expected Solution, Scenario',
    basePrompt: masterPromptTemplate,
    variables: ['role', 'objective', 'steps', 'expected_solution', 'scenario'],
    examples: [
      'Role: Expert software architect\nObjective: Design a scalable microservices architecture\nSteps: Analyze requirements, design components, create specifications\nExpected Solution: Detailed technical specification with diagrams\nScenario: E-commerce platform with 100k+ users'
    ]
  },
  {
    id: 'ape',
    name: 'A.P.E Framework',
    description: 'Action, Purpose, Expectation',
    basePrompt: masterPromptTemplate,
    variables: ['action', 'purpose', 'expectation'],
    examples: [
      'Action: Analyze customer feedback data\nPurpose: Identify product improvement opportunities\nExpectation: Prioritized list of actionable insights with confidence scores'
    ]
  },
  {
    id: 'tag',
    name: 'T.A.G Framework',
    description: 'Task, Action, Goal',
    basePrompt: masterPromptTemplate,
    variables: ['task', 'action', 'goal'],
    examples: [
      'Task: Improve website conversion rates\nAction: Analyze user behavior data and A/B test results\nGoal: Increase conversion rate by 25% within 3 months'
    ]
  },
  {
    id: 'era',
    name: 'E.R.A Framework',
    description: 'Expectation, Role, Action',
    basePrompt: masterPromptTemplate,
    variables: ['expectation', 'role', 'action'],
    examples: [
      'Expectation: Professional business proposal\nRole: Experienced business consultant\nAction: Research market data and create compelling proposal with financial projections'
    ]
  },
  {
    id: 'race',
    name: 'R.A.C.E Framework',
    description: 'Role, Action, Context, Expectation',
    basePrompt: masterPromptTemplate,
    variables: ['role', 'action', 'context', 'expectation'],
    examples: [
      'Role: Senior data scientist\nAction: Build predictive model for customer churn\nContext: SaaS company with subscription data and user behavior metrics\nExpectation: Production-ready model with 90%+ accuracy and deployment guide'
    ]
  },
  {
    id: 'rise',
    name: 'R.I.S.E Framework',
    description: 'Request, Input, Scenario, Expectation',
    basePrompt: masterPromptTemplate,
    variables: ['request', 'input', 'scenario', 'expectation'],
    examples: [
      'Request: Design user interface\nInput: User research data and brand guidelines\nScenario: Mobile app for food delivery service\nExpectation: Complete design system with component library and style guide'
    ]
  },
  {
    id: 'care',
    name: 'C.A.R.E Framework',
    description: 'Context, Action, Result, Example',
    basePrompt: masterPromptTemplate,
    variables: ['context', 'action', 'result', 'example'],
    examples: [
      'Context: New marketing team launching first campaign\nAction: Develop comprehensive marketing strategy and execution plan\nResult: Complete campaign strategy with timeline and budget\nExample: Include successful campaign case studies and best practices'
    ]
  },
  {
    id: 'coast',
    name: 'C.O.A.S.T Framework',
    description: 'Context, Objective, Actions, Steps, Task',
    basePrompt: masterPromptTemplate,
    variables: ['context', 'objective', 'actions', 'steps', 'task'],
    examples: [
      'Context: Enterprise software company expanding to new markets\nObjective: Establish successful market presence in 3 new countries\nActions: Market research, localization, partnership development\nSteps: Phase 1: Research, Phase 2: Localization, Phase 3: Launch\nTask: Create comprehensive international expansion plan'
    ]
  },
  {
    id: 'trace',
    name: 'T.R.A.C.E Framework',
    description: 'Task, Role, Action, Context, Expectation',
    basePrompt: masterPromptTemplate,
    variables: ['task', 'role', 'action', 'context', 'expectation'],
    examples: [
      'Task: Develop comprehensive onboarding program for new employees\nRole: HR specialist with training expertise\nAction: Design curriculum, create materials, implement feedback system\nContext: Growing tech company with diverse workforce\nExpectation: Complete onboarding program with measurable success metrics'
    ]
  }
];

export const getMasterPrompt = (frameworkId: string): MasterPromptConfig | undefined => {
  return masterPrompts.find(prompt => prompt.id === frameworkId);
};

export const getAllMasterPrompts = (): MasterPromptConfig[] => {
  return masterPrompts;
};

// Helper function to build the master prompt with user inputs
export const buildMasterPrompt = (
  frameworkId: string, 
  taskDescription: string, 
  tone?: string, 
  length?: string
): string => {
  const framework = getMasterPrompt(frameworkId);
  if (!framework) {
    throw new Error(`Framework ${frameworkId} not found`);
  }

  let prompt = masterPromptTemplate
    .replace('{taskDescription}', taskDescription)
    .replace('{frameworkName}', framework.name);

  // Handle optional tone and length
  if (tone) {
    prompt = prompt.replace('Tone: "{tone}"', `Tone: "${tone}"`);
  } else {
    prompt = prompt.replace('Tone: "{tone}"', '');
  }

  if (length) {
    prompt = prompt.replace('Length: "{length}"', `Length: "${length}"`);
  } else {
    prompt = prompt.replace('Length: "{length}"', '');
  }

  // Clean up any extra newlines that might be left
  prompt = prompt.replace(/\n\s*\n\s*\n/g, '\n\n');
  
  return prompt;
};

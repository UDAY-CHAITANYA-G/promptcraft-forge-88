/**
 * Dynamic Master Prompt Configuration
 * 
 * This service provides dynamic prompt configuration using the new configuration system.
 * It replaces hardcoded framework definitions with configurable settings.
 */

import { appConfig, getFrameworkConfig } from '@/config';

export interface MasterPromptConfig {
  id: string;
  name: string;
  description: string;
  basePrompt: string;
  variables: string[];
  examples: string[];
  enabled: boolean;
}

export interface ModelSpecificPrompt {
  model: string;
  systemPrompt: string;
  userPromptTemplate: string;
  temperature?: number;
  maxTokens?: number;
}

// Master prompt template - now configurable
export const masterPromptTemplate = `**Role:**
You are a **Prompt Engineer Assistant**.

**Objective:**
Transform the user's **Task Description** into a structured prompt using one of the supported frameworks. Optionally, adjust the response **Tone** and **Length** if the user provides them. Output must always be in **JSON format**.

**Context:**
Supported frameworks and their components:

{{FRAMEWORKS_LIST}}

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

class DynamicMasterPromptService {
  // Get all available frameworks from configuration
  getAllFrameworks(): MasterPromptConfig[] {
    return Object.values(appConfig.frameworks)
      .filter(framework => framework.enabled)
      .map(framework => ({
        id: framework.id,
        name: framework.name,
        description: framework.description,
        basePrompt: this.buildMasterPromptTemplate(),
        variables: framework.components,
        examples: this.getFrameworkExamples(framework.id),
        enabled: framework.enabled,
      }));
  }

  // Get a specific framework configuration
  getFramework(frameworkId: string): MasterPromptConfig | undefined {
    const framework = getFrameworkConfig(frameworkId);
    if (!framework || !framework.enabled) {
      return undefined;
    }

    return {
      id: framework.id,
      name: framework.name,
      description: framework.description,
      basePrompt: this.buildMasterPromptTemplate(),
      variables: framework.components,
      examples: this.getFrameworkExamples(framework.id),
      enabled: framework.enabled,
    };
  }

  // Build the master prompt template with dynamic framework list
  private buildMasterPromptTemplate(): string {
    const frameworksList = this.getAllFrameworks()
      .map((framework, index) => {
        const components = framework.variables.join(', ');
        return `${index + 1}. **${framework.name}** → ${components}`;
      })
      .join('\n');

    return masterPromptTemplate.replace('{{FRAMEWORKS_LIST}}', frameworksList);
  }

  // Get examples for a specific framework
  private getFrameworkExamples(frameworkId: string): string[] {
    const examples: { [key: string]: string[] } = {
      roses: [
        'Role: Expert software architect\nObjective: Design a scalable microservices architecture\nSteps: Analyze requirements, design components, create specifications\nExpected Solution: Detailed technical specification with diagrams\nScenario: E-commerce platform with 100k+ users'
      ],
      ape: [
        'Action: Analyze customer feedback data\nPurpose: Identify product improvement opportunities\nExpectation: Prioritized list of actionable insights with confidence scores'
      ],
      tag: [
        'Task: Improve website conversion rates\nAction: Analyze user behavior data and A/B test results\nGoal: Increase conversion rate by 25% within 3 months'
      ],
      era: [
        'Expectation: Professional business proposal\nRole: Experienced business consultant\nAction: Research market data and create compelling proposal with financial projections'
      ],
      race: [
        'Role: Senior data scientist\nAction: Build predictive model for customer churn\nContext: SaaS company with subscription data and user behavior metrics\nExpectation: Production-ready model with 90%+ accuracy and deployment guide'
      ],
      rise: [
        'Request: Design user interface\nInput: User research data and brand guidelines\nScenario: Mobile app for food delivery service\nExpectation: Complete design system with component library and style guide'
      ],
      care: [
        'Context: New marketing team launching first campaign\nAction: Develop comprehensive marketing strategy and execution plan\nResult: Complete campaign strategy with timeline and budget\nExample: Include successful campaign case studies and best practices'
      ],
      coast: [
        'Context: Enterprise software company expanding to new markets\nObjective: Establish successful market presence in 3 new countries\nActions: Market research, localization, partnership development\nSteps: Phase 1: Research, Phase 2: Localization, Phase 3: Launch\nTask: Create comprehensive international expansion plan'
      ],
      trace: [
        'Task: Develop comprehensive onboarding program for new employees\nRole: HR specialist with training expertise\nAction: Design curriculum, create materials, implement feedback system\nContext: Growing tech company with diverse workforce\nExpectation: Complete onboarding program with measurable success metrics'
      ],
    };

    return examples[frameworkId] || [];
  }

  // Build the master prompt with user inputs
  buildMasterPrompt(
    frameworkId: string,
    taskDescription: string,
    tone?: string,
    length?: string
  ): string {
    const framework = this.getFramework(frameworkId);
    if (!framework) {
      throw new Error(`Framework ${frameworkId} not found or disabled`);
    }

    let prompt = this.buildMasterPromptTemplate()
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
  }

  // Get available tones
  getAvailableTones(): string[] {
    return [
      'Professional',
      'Casual',
      'Friendly',
      'Formal',
      'Creative'
    ];
  }

  // Get available lengths
  getAvailableLengths(): string[] {
    return [
      'Short',
      'Medium',
      'Large',
      'Detailed'
    ];
  }

  // Validate framework ID
  isValidFramework(frameworkId: string): boolean {
    const framework = getFrameworkConfig(frameworkId);
    return !!(framework && framework.enabled);
  }

  // Get framework components
  getFrameworkComponents(frameworkId: string): string[] {
    const framework = getFrameworkConfig(frameworkId);
    return framework?.components || [];
  }
}

// Export service instance
export const dynamicMasterPromptService = new DynamicMasterPromptService();

// Export legacy functions for backward compatibility
export const getMasterPrompt = (frameworkId: string): MasterPromptConfig | undefined => {
  return dynamicMasterPromptService.getFramework(frameworkId);
};

export const getAllMasterPrompts = (): MasterPromptConfig[] => {
  return dynamicMasterPromptService.getAllFrameworks();
};

export const buildMasterPrompt = (
  frameworkId: string,
  taskDescription: string,
  tone?: string,
  length?: string
): string => {
  return dynamicMasterPromptService.buildMasterPrompt(frameworkId, taskDescription, tone, length);
};

// Export the frameworks array for backward compatibility
export const masterPrompts = dynamicMasterPromptService.getAllFrameworks();

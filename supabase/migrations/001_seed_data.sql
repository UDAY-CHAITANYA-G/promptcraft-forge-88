-- ============================================================================
-- SEED DATA MIGRATION
-- ============================================================================
-- This migration populates the database with initial seed data

-- ============================================================================
-- API PROVIDERS SEED DATA
-- ============================================================================

INSERT INTO public.api_providers (name, display_name, base_url, api_key_pattern, is_enabled, max_requests_per_minute, max_requests_per_day, supported_models, validation_rules) VALUES
(
    'openai',
    'OpenAI',
    'https://api.openai.com/v1',
    '^sk-(proj-)?[a-zA-Z0-9_-]{32,}$',
    true,
    60,
    1000,
    '["gpt-3.5-turbo", "gpt-4", "gpt-4-turbo"]'::jsonb,
    '{"minLength": 35, "maxLength": 100, "requiredPrefix": "sk-", "description": "OpenAI API key format"}'::jsonb
),
(
    'gemini',
    'Google Gemini',
    'https://generativelanguage.googleapis.com/v1',
    '^AIza[a-zA-Z0-9_-]{35}$',
    true,
    60,
    1000,
    '["gemini-pro", "gemini-pro-vision"]'::jsonb,
    '{"minLength": 39, "maxLength": 39, "requiredPrefix": "AIza", "description": "Google Gemini API key format"}'::jsonb
),
(
    'anthropic',
    'Anthropic Claude',
    'https://api.anthropic.com/v1',
    '^sk-ant-[a-zA-Z0-9]{32,}$',
    true,
    60,
    1000,
    '["claude-3-sonnet", "claude-3-opus", "claude-3-haiku"]'::jsonb,
    '{"minLength": 40, "maxLength": 100, "requiredPrefix": "sk-ant-", "description": "Anthropic API key format"}'::jsonb
)
ON CONFLICT (name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    base_url = EXCLUDED.base_url,
    api_key_pattern = EXCLUDED.api_key_pattern,
    is_enabled = EXCLUDED.is_enabled,
    max_requests_per_minute = EXCLUDED.max_requests_per_minute,
    max_requests_per_day = EXCLUDED.max_requests_per_day,
    supported_models = EXCLUDED.supported_models,
    validation_rules = EXCLUDED.validation_rules,
    updated_at = timezone('utc'::text, now());

-- ============================================================================
-- PROMPT FRAMEWORKS SEED DATA
-- ============================================================================

INSERT INTO public.prompt_frameworks (name, display_name, description, components, template, examples, is_enabled, sort_order) VALUES
(
    'roses',
    'R.O.S.E.S Framework',
    'Role, Objective, Steps, Expected Solution, Scenario',
    '["role", "objective", "steps", "expected_solution", "scenario"]'::jsonb,
    'You are a {role}. Your objective is to {objective}. Follow these steps: {steps}. The expected solution should be {expected_solution}. Consider this scenario: {scenario}.',
    '["Role: Expert software architect\nObjective: Design a scalable microservices architecture\nSteps: Analyze requirements, design components, create specifications\nExpected Solution: Detailed technical specification with diagrams\nScenario: E-commerce platform with 100k+ users"]'::jsonb,
    true,
    1
),
(
    'ape',
    'A.P.E Framework',
    'Action, Purpose, Expectation',
    '["action", "purpose", "expectation"]'::jsonb,
    'Perform this action: {action}. The purpose is to {purpose}. The expectation is {expectation}.',
    '["Action: Analyze customer feedback data\nPurpose: Identify product improvement opportunities\nExpectation: Prioritized list of actionable insights with confidence scores"]'::jsonb,
    true,
    2
),
(
    'tag',
    'T.A.G Framework',
    'Task, Action, Goal',
    '["task", "action", "goal"]'::jsonb,
    'Your task is to {task}. Take this action: {action}. The goal is to {goal}.',
    '["Task: Improve website conversion rates\nAction: Analyze user behavior data and A/B test results\nGoal: Increase conversion rate by 25% within 3 months"]'::jsonb,
    true,
    3
),
(
    'era',
    'E.R.A Framework',
    'Expectation, Role, Action',
    '["expectation", "role", "action"]'::jsonb,
    'The expectation is {expectation}. You are acting as a {role}. Take this action: {action}.',
    '["Expectation: Professional business proposal\nRole: Experienced business consultant\nAction: Research market data and create compelling proposal with financial projections"]'::jsonb,
    true,
    4
),
(
    'race',
    'R.A.C.E Framework',
    'Role, Action, Context, Expectation',
    '["role", "action", "context", "expectation"]'::jsonb,
    'You are a {role}. Take this action: {action}. The context is {context}. The expectation is {expectation}.',
    '["Role: Senior data scientist\nAction: Build predictive model for customer churn\nContext: SaaS company with subscription data and user behavior metrics\nExpectation: Production-ready model with 90%+ accuracy and deployment guide"]'::jsonb,
    true,
    5
),
(
    'rise',
    'R.I.S.E Framework',
    'Request, Input, Scenario, Expectation',
    '["request", "input", "scenario", "expectation"]'::jsonb,
    'The request is: {request}. Use this input: {input}. Consider this scenario: {scenario}. The expectation is {expectation}.',
    '["Request: Design user interface\nInput: User research data and brand guidelines\nScenario: Mobile app for food delivery service\nExpectation: Complete design system with component library and style guide"]'::jsonb,
    true,
    6
),
(
    'care',
    'C.A.R.E Framework',
    'Context, Action, Result, Example',
    '["context", "action", "result", "example"]'::jsonb,
    'In this context: {context}. Take this action: {action}. The expected result is {result}. Here is an example: {example}.',
    '["Context: New marketing team launching first campaign\nAction: Develop comprehensive marketing strategy and execution plan\nResult: Complete campaign strategy with timeline and budget\nExample: Include successful campaign case studies and best practices"]'::jsonb,
    true,
    7
),
(
    'coast',
    'C.O.A.S.T Framework',
    'Context, Objective, Actions, Steps, Task',
    '["context", "objective", "actions", "steps", "task"]'::jsonb,
    'In this context: {context}. The objective is {objective}. These are the actions: {actions}. Follow these steps: {steps}. Your task is {task}.',
    '["Context: Enterprise software company expanding to new markets\nObjective: Establish successful market presence in 3 new countries\nActions: Market research, localization, partnership development\nSteps: Phase 1: Research, Phase 2: Localization, Phase 3: Launch\nTask: Create comprehensive international expansion plan"]'::jsonb,
    true,
    8
),
(
    'trace',
    'T.R.A.C.E Framework',
    'Task, Role, Action, Context, Expectation',
    '["task", "role", "action", "context", "expectation"]'::jsonb,
    'Your task is {task}. You are acting as a {role}. Take this action: {action}. The context is {context}. The expectation is {expectation}.',
    '["Task: Develop comprehensive onboarding program for new employees\nRole: HR specialist with training expertise\nAction: Design curriculum, create materials, implement feedback system\nContext: Growing tech company with diverse workforce\nExpectation: Complete onboarding program with measurable success metrics"]'::jsonb,
    true,
    9
)
ON CONFLICT (name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    components = EXCLUDED.components,
    template = EXCLUDED.template,
    examples = EXCLUDED.examples,
    is_enabled = EXCLUDED.is_enabled,
    sort_order = EXCLUDED.sort_order,
    updated_at = timezone('utc'::text, now());

-- ============================================================================
-- SAMPLE PROMPT TEMPLATES
-- ============================================================================

INSERT INTO public.prompt_templates (user_id, name, description, framework_id, template_content, variables, is_public, is_active) VALUES
(
    NULL, -- System template
    'Business Analysis Template',
    'Template for business analysis using R.O.S.E.S framework',
    'roses',
    'You are a {role} with expertise in business analysis. Your objective is to {objective}. Follow these steps: {steps}. The expected solution should be {expected_solution}. Consider this scenario: {scenario}.',
    '["role", "objective", "steps", "expected_solution", "scenario"]'::jsonb,
    true,
    true
),
(
    NULL, -- System template
    'Technical Documentation Template',
    'Template for technical documentation using A.P.E framework',
    'ape',
    'Perform this action: {action}. The purpose is to {purpose}. The expectation is {expectation}.',
    '["action", "purpose", "expectation"]'::jsonb,
    true,
    true
),
(
    NULL, -- System template
    'Marketing Strategy Template',
    'Template for marketing strategy using T.A.G framework',
    'tag',
    'Your task is to {task}. Take this action: {action}. The goal is to {goal}.',
    '["task", "action", "goal"]'::jsonb,
    true,
    true
)
ON CONFLICT DO NOTHING;


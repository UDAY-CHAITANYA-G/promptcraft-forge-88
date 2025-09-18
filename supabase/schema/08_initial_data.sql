-- ============================================================================
-- INITIAL DATA AND SEED DATA
-- ============================================================================
-- This file contains initial data for the application

-- ============================================================================
-- API PROVIDERS SEED DATA
-- ============================================================================

-- Insert default API providers
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

-- Insert default prompt frameworks
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
-- FEEDBACK CATEGORIES SEED DATA
-- ============================================================================

-- Insert default feedback categories
INSERT INTO public.feedback_categories (name, display_name, description, color, is_active, sort_order) VALUES
(
    'general',
    'General Feedback',
    'General feedback and suggestions',
    '#3B82F6',
    true,
    1
),
(
    'bug_report',
    'Bug Report',
    'Report bugs and technical issues',
    '#EF4444',
    true,
    2
),
(
    'feature_request',
    'Feature Request',
    'Request new features and improvements',
    '#10B981',
    true,
    3
),
(
    'improvement',
    'Improvement',
    'Suggestions for existing features',
    '#F59E0B',
    true,
    4
),
(
    'complaint',
    'Complaint',
    'Complaints and concerns',
    '#DC2626',
    true,
    5
),
(
    'praise',
    'Praise',
    'Positive feedback and compliments',
    '#059669',
    true,
    6
)
ON CONFLICT (name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    color = EXCLUDED.color,
    is_active = EXCLUDED.is_active,
    sort_order = EXCLUDED.sort_order,
    updated_at = timezone('utc'::text, now());

-- ============================================================================
-- SAMPLE PROMPT TEMPLATES
-- ============================================================================

-- Insert sample prompt templates (these will be created by users, but we can add some defaults)
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

-- ============================================================================
-- SYSTEM CONFIGURATION
-- ============================================================================

-- Create system configuration table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.system_config (
    id UUID DEFAULT public.generate_uuid_v4() PRIMARY KEY,
    config_key VARCHAR(100) NOT NULL UNIQUE,
    config_value TEXT NOT NULL,
    config_type VARCHAR(50) DEFAULT 'string' CHECK (config_type IN ('string', 'number', 'boolean', 'json')),
    description TEXT,
    is_encrypted BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.system_config ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for system config (admin only)
CREATE POLICY "Admins can manage system config" ON public.system_config
    FOR ALL USING (public.is_admin());

-- Insert default system configuration
INSERT INTO public.system_config (config_key, config_value, config_type, description, is_encrypted) VALUES
(
    'app_name',
    'PromptCraft Forge',
    'string',
    'Application name',
    false
),
(
    'app_version',
    '1.0.0',
    'string',
    'Application version',
    false
),
(
    'max_prompt_history_days',
    '30',
    'number',
    'Maximum days to keep prompt history',
    false
),
(
    'max_api_requests_per_minute',
    '60',
    'number',
    'Maximum API requests per minute per user',
    false
),
(
    'enable_analytics',
    'false',
    'boolean',
    'Enable analytics collection',
    false
),
(
    'default_theme',
    'light',
    'string',
    'Default application theme',
    false
),
(
    'maintenance_mode',
    'false',
    'boolean',
    'Enable maintenance mode',
    false
),
(
    'encryption_key',
    'promptforge-secure-key-2024',
    'string',
    'Default encryption key (change in production)',
    true
)
ON CONFLICT (config_key) DO UPDATE SET
    config_value = EXCLUDED.config_value,
    config_type = EXCLUDED.config_type,
    description = EXCLUDED.description,
    is_encrypted = EXCLUDED.is_encrypted,
    updated_at = timezone('utc'::text, now());

-- Create trigger for updated_at
CREATE TRIGGER update_system_config_updated_at
    BEFORE UPDATE ON public.system_config
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- UTILITY FUNCTIONS FOR SYSTEM CONFIG
-- ============================================================================

-- Function to get system configuration value
CREATE OR REPLACE FUNCTION public.get_system_config(config_key_param VARCHAR(100))
RETURNS TEXT AS $$
DECLARE
    config_value TEXT;
BEGIN
    SELECT 
        CASE 
            WHEN is_encrypted THEN public.decrypt_sensitive_data(sc.config_value)
            ELSE sc.config_value
        END
    INTO config_value
    FROM public.system_config sc
    WHERE sc.config_key = config_key_param;
    
    RETURN config_value;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to set system configuration value
CREATE OR REPLACE FUNCTION public.set_system_config(
    config_key_param VARCHAR(100),
    config_value_param TEXT,
    config_type_param VARCHAR(50) DEFAULT 'string',
    description_param TEXT DEFAULT NULL,
    is_encrypted_param BOOLEAN DEFAULT false
)
RETURNS BOOLEAN AS $$
BEGIN
    INSERT INTO public.system_config (config_key, config_value, config_type, description, is_encrypted)
    VALUES (
        config_key_param,
        CASE 
            WHEN is_encrypted_param THEN public.encrypt_sensitive_data(config_value_param)
            ELSE config_value_param
        END,
        config_type_param,
        description_param,
        is_encrypted_param
    )
    ON CONFLICT (config_key) DO UPDATE SET
        config_value = CASE 
            WHEN is_encrypted_param THEN public.encrypt_sensitive_data(config_value_param)
            ELSE config_value_param
        END,
        config_type = config_type_param,
        description = COALESCE(description_param, system_config.description),
        is_encrypted = is_encrypted_param,
        updated_at = timezone('utc'::text, now());
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

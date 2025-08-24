import { supabase } from '@/integrations/supabase/client';

export interface UserPreferences {
  selected_model: 'openai' | 'gemini' | 'anthropic';
  selected_framework: 'roses' | 'ape' | 'tag' | 'era' | 'race' | 'rise' | 'care' | 'coast' | 'trace';
}

export interface FrameworkInfo {
  id: string;
  name: string;
  description: string;
  components: string[];
  bestFor: string;
  isDefault?: boolean;
}

export const frameworks: FrameworkInfo[] = [
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
];

class UserPreferencesService {
  // Get user preferences
  async getUserPreferences(): Promise<UserPreferences | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return null;
      }

      const { data, error } = await supabase
        .from('user_preferences')
        .select('selected_model, selected_framework')
        .eq('user_id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') { // No rows returned
          return null;
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching user preferences:', error);
      return null;
    }
  }

  // Save or update user preferences
  async saveUserPreferences(preferences: Partial<UserPreferences>): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Check if preferences already exist
      const { data: existingPrefs, error: checkError } = await supabase
        .from('user_preferences')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        throw checkError;
      }

      if (existingPrefs) {
        // Update existing preferences
        const { error } = await supabase
          .from('user_preferences')
          .update(preferences)
          .eq('id', existingPrefs.id);

        if (error) {
          throw error;
        }
      } else {
        // Insert new preferences with defaults
        const newPreferences: UserPreferences = {
          selected_model: preferences.selected_model || 'openai',
          selected_framework: preferences.selected_framework || 'roses'
        };

        const { error } = await supabase
          .from('user_preferences')
          .insert({
            user_id: user.id,
            ...newPreferences
          });

        if (error) {
          throw error;
        }
      }

      return true;
    } catch (error) {
      console.error('Error saving user preferences:', error);
      return false;
    }
  }

  // Get default model based on available API configurations
  async getDefaultModel(): Promise<'openai' | 'gemini' | 'anthropic' | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return null;
      }

      const { data, error } = await supabase
        .from('api_configurations')
        .select('provider')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: true })
        .limit(1);

      if (error || !data || data.length === 0) {
        return null;
      }

      return data[0].provider as 'openai' | 'gemini' | 'anthropic';
    } catch (error) {
      console.error('Error getting default model:', error);
      return null;
    }
  }

  // Initialize user preferences with smart defaults
  async initializePreferences(): Promise<boolean> {
    try {
      const defaultModel = await this.getDefaultModel();
      if (defaultModel) {
        return await this.saveUserPreferences({
          selected_model: defaultModel,
          selected_framework: 'roses'
        });
      }
      return false;
    } catch (error) {
      console.error('Error initializing preferences:', error);
      return false;
    }
  }
}

export const userPreferencesService = new UserPreferencesService();

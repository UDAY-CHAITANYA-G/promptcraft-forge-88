import { supabase } from '@/integrations/supabase/client';

export interface PromptHistoryEntry {
  id: string;
  framework_id: string;
  framework_name: string;
  model: string;
  user_input: string;
  ai_response: string;
  tone?: string;
  length?: string;
  vibe_coding: boolean;
  status: 'generating' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
}

export interface PromptHistoryStats {
  totalPrompts: number;
  frameworksUsed: { [key: string]: number };
  modelsUsed: { [key: string]: number };
  dailyUsage: { [key: string]: number };
  averageResponseLength: number;
}

export interface SavePromptHistoryParams {
  framework_id: string;
  framework_name: string;
  model: string;
  user_input: string;
  ai_response: string;
  tone?: string;
  length?: string;
  vibe_coding: boolean;
}

export interface SavePromptHistoryInputParams {
  framework_id: string;
  framework_name: string;
  model: string;
  user_input: string;
  tone?: string;
  length?: string;
  vibe_coding: boolean;
}

export interface SavePromptHistoryInputResult {
  success: boolean;
  entryId?: string;
  error?: string;
}

class PromptHistoryService {
  // STEP 1: Save input details immediately when generate is clicked
  async savePromptHistoryInput(params: SavePromptHistoryInputParams): Promise<SavePromptHistoryInputResult> {
    try {
      console.log('🔍 [HistoryService] Starting input save operation...');
      
      // Test database connection first
      console.log('🔍 [HistoryService] Testing database connection...');
      const { data: testData, error: testError } = await supabase
        .from('prompt_history')
        .select('count')
        .limit(1);
      
      if (testError) {
        console.error('❌ [HistoryService] Database connection test failed:', testError);
        return { success: false, error: `Database connection failed: ${testError.message}` };
      }
      
      console.log('✅ [HistoryService] Database connection test successful');
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('❌ [HistoryService] User not authenticated');
        return { success: false, error: 'User not authenticated' };
      }
      
      console.log('✅ [HistoryService] User authenticated:', user.id);

      const insertData = {
        user_id: user.id,
        ...params,
        ai_response: 'Generating...', // Placeholder until we get the response
        status: 'generating' // Add status to track incomplete entries
      };
      
      console.log('📝 [HistoryService] Inserting input data:', insertData);

      const { data, error } = await supabase
        .from('prompt_history')
        .insert(insertData)
        .select();

      if (error) {
        console.error('❌ [HistoryService] Database error:', error);
        console.error('❌ [HistoryService] Error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        return { success: false, error: error.message };
      }

      console.log('✅ [HistoryService] Input data saved successfully:', data);
      return { 
        success: true, 
        entryId: data[0]?.id 
      };
    } catch (error) {
      console.error('❌ [HistoryService] Error saving input data:', error);
      return { success: false, error: 'Unknown error occurred' };
    }
  }

  // STEP 2: Update the history entry with AI response
  async updatePromptHistoryResponse(entryId: string, aiResponse: string): Promise<boolean> {
    try {
      console.log('🔍 [HistoryService] Updating with AI response...');
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('❌ [HistoryService] User not authenticated');
        return false;
      }

      const { error } = await supabase
        .from('prompt_history')
        .update({
          ai_response: aiResponse,
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', entryId)
        .eq('user_id', user.id);

      if (error) {
        console.error('❌ [HistoryService] Database update error:', error);
        return false;
      }

      console.log('✅ [HistoryService] AI response updated successfully');
      return true;
    } catch (error) {
      console.error('❌ [HistoryService] Error updating AI response:', error);
      return false;
    }
  }

  // Update history entry status (for failed generations)
  async updatePromptHistoryStatus(entryId: string, status: 'generating' | 'completed' | 'failed', errorMessage?: string): Promise<boolean> {
    try {
      console.log('🔍 [HistoryService] Updating status to:', status);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('❌ [HistoryService] User not authenticated');
        return false;
      }

      const updateData: {
        status: string;
        updated_at: string;
        ai_response?: string;
      } = {
        status: status,
        updated_at: new Date().toISOString()
      };

      // If failed, update the AI response with error message
      if (status === 'failed' && errorMessage) {
        updateData.ai_response = `Generation failed: ${errorMessage}`;
      }

      const { error } = await supabase
        .from('prompt_history')
        .update(updateData)
        .eq('id', entryId)
        .eq('user_id', user.id);

      if (error) {
        console.error('❌ [HistoryService] Database status update error:', error);
        return false;
      }

      console.log('✅ [HistoryService] Status updated successfully to:', status);
      return true;
    } catch (error) {
      console.error('❌ [HistoryService] Error updating status:', error);
      return false;
    }
  }

  // Save a complete prompt history entry (legacy method)
  async savePromptHistory(params: SavePromptHistoryParams): Promise<boolean> {
    try {
      console.log('🔍 [HistoryService] Starting save operation...');
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('❌ [HistoryService] User not authenticated');
        throw new Error('User not authenticated');
      }
      
      console.log('✅ [HistoryService] User authenticated:', user.id);

      const insertData = {
        user_id: user.id,
        ...params
      };
      
      console.log('📝 [HistoryService] Inserting data:', insertData);

      const { data, error } = await supabase
        .from('prompt_history')
        .insert(insertData)
        .select();

      if (error) {
        console.error('❌ [HistoryService] Database error:', error);
        throw error;
      }

      console.log('✅ [HistoryService] Data saved successfully:', data);
      return true;
    } catch (error) {
      console.error('❌ [HistoryService] Error saving prompt history:', error);
      return false;
    }
  }

  // Get user's prompt history (last 7 days)
  async getPromptHistory(limit: number = 50): Promise<PromptHistoryEntry[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return [];
      }

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data, error } = await supabase
        .from('prompt_history')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching prompt history:', error);
      return [];
    }
  }

  // Get prompt history statistics for charts
  async getPromptHistoryStats(): Promise<PromptHistoryStats> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return {
          totalPrompts: 0,
          frameworksUsed: {},
          modelsUsed: {},
          dailyUsage: {},
          averageResponseLength: 0
        };
      }

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data, error } = await supabase
        .from('prompt_history')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', sevenDaysAgo.toISOString());

      if (error) {
        throw error;
      }

      const entries = data || [];
      
      // Calculate statistics
      const frameworksUsed: { [key: string]: number } = {};
      const modelsUsed: { [key: string]: number } = {};
      const dailyUsage: { [key: string]: number } = {};
      let totalResponseLength = 0;

      entries.forEach(entry => {
        // Count frameworks
        frameworksUsed[entry.framework_name] = (frameworksUsed[entry.framework_name] || 0) + 1;
        
        // Count models
        modelsUsed[entry.model] = (modelsUsed[entry.model] || 0) + 1;
        
        // Count daily usage
        const date = new Date(entry.created_at).toLocaleDateString();
        dailyUsage[date] = (dailyUsage[date] || 0) + 1;
        
        // Calculate response length
        totalResponseLength += entry.ai_response.length;
      });

      // Calculate average response length
      const averageResponseLength = entries.length > 0 ? Math.round(totalResponseLength / entries.length) : 0;

      return {
        totalPrompts: entries.length,
        frameworksUsed,
        modelsUsed,
        dailyUsage,
        averageResponseLength
      };
    } catch (error) {
      console.error('Error fetching prompt history stats:', error);
      return {
        totalPrompts: 0,
        frameworksUsed: {},
        modelsUsed: {},
        dailyUsage: {},
        averageResponseLength: 0
      };
    }
  }

  // Delete a specific prompt history entry
  async deletePromptHistory(id: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('prompt_history')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error deleting prompt history:', error);
      return false;
    }
  }

  // Clear all user's prompt history
  async clearAllPromptHistory(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('prompt_history')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error clearing prompt history:', error);
      return false;
    }
  }

  // Manually trigger cleanup of old records (for testing or manual execution)
  async cleanupOldRecords(): Promise<boolean> {
    try {
      const { error } = await supabase.rpc('cleanup_old_prompt_history');
      
      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error cleaning up old records:', error);
      return false;
    }
  }
}

export const promptHistoryService = new PromptHistoryService();

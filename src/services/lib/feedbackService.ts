import { supabase } from '@/integrations/supabase/client';
import { emailService } from './emailService';
import { User } from '@supabase/supabase-js';

export interface FeedbackData {
  message: string;
}

export interface StoredFeedback {
  id: string;
  user_id: string;
  message: string;
  created_at: string;
  updated_at: string;
}

export const feedbackService = {
  /**
   * Store feedback in the database and send email notification
   * @param feedbackData - The feedback data
   * @param user - The authenticated user
   * @returns Promise<{ success: boolean; feedbackId?: string; error?: string }>
   */
  submitFeedback: async (
    feedbackData: FeedbackData, 
    user: User
  ): Promise<{ success: boolean; feedbackId?: string; error?: string }> => {
    try {
      // First, store feedback in the database
      const { data: feedback, error: dbError } = await supabase
        .from('feedback')
        .insert({
          user_id: user.id,
          message: feedbackData.message
        })
        .select()
        .single();

      if (dbError) {
        console.error('Database error:', dbError);
        return { success: false, error: 'Failed to store feedback' };
      }

      // Fetch user's display name from profiles
      let displayName: string | undefined = undefined;
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('display_name')
          .eq('user_id', user.id)
          .single();
        displayName = profile?.display_name || undefined;
      } catch (_err) {
        // Ignore profile fetch errors for email purposes
      }

      // Then, send email notification (optional - can fail without affecting feedback storage)
      try {
        await emailService.sendFeedback(feedbackData, user, displayName);
      } catch (emailError) {
        console.warn('Email notification failed, but feedback was stored:', emailError);
        // Don't fail the entire operation if email fails
      }

      return { success: true, feedbackId: feedback.id };
    } catch (error) {
      console.error('Feedback submission error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  },

  /**
   * Get feedback history for the current user
   * @param user - The authenticated user
   * @returns Promise<StoredFeedback[]>
   */
  getUserFeedback: async (user: User): Promise<StoredFeedback[]> => {
    try {
      const { data: feedback, error } = await supabase
        .from('feedback')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching feedback:', error);
        return [];
      }

      return feedback || [];
    } catch (error) {
      console.error('Error fetching user feedback:', error);
      return [];
    }
  },

  /**
   * Delete a feedback entry
   * @param feedbackId - The ID of the feedback to delete
   * @param user - The authenticated user
   * @returns Promise<boolean>
   */
  deleteFeedback: async (feedbackId: string, user: User): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('feedback')
        .delete()
        .eq('id', feedbackId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting feedback:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting feedback:', error);
      return false;
    }
  }
};

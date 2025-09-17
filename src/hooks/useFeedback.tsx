import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';
import { feedbackService, type FeedbackData, type StoredFeedback } from '@/services/services';
import { useToast } from './use-toast';

interface FeedbackState {
  isSubmitting: boolean;
  error: string | null;
}

export function useFeedback() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [state, setState] = useState<FeedbackState>({
    isSubmitting: false,
    error: null,
  });

  // Submit feedback
  const submitFeedback = useCallback(async (feedbackData: FeedbackData) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to submit feedback",
        variant: "destructive",
      });
      return { success: false, error: "User not authenticated" };
    }

    if (!feedbackData.message.trim()) {
      toast({
        title: "Error",
        description: "Please provide a feedback message",
        variant: "destructive",
      });
      return { success: false, error: "Empty feedback message" };
    }

    try {
      setState(prev => ({
        ...prev,
        isSubmitting: true,
        error: null,
      }));

      const result = await feedbackService.submitFeedback(feedbackData, user);
      
      if (result.success) {
        toast({
          title: "Thank you! 🙏",
          description: "Your feedback has been submitted successfully. We appreciate your input!",
        });
        return result;
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to submit feedback",
          variant: "destructive",
        });
        return result;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit feedback';
      setState(prev => ({
        ...prev,
        error: errorMessage,
      }));

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });

      return { success: false, error: errorMessage };
    } finally {
      setState(prev => ({
        ...prev,
        isSubmitting: false,
      }));
    }
  }, [user, toast]);

  // Get user feedback history
  const getUserFeedback = useCallback(async (): Promise<StoredFeedback[]> => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to view feedback history",
        variant: "destructive",
      });
      return [];
    }

    try {
      const feedback = await feedbackService.getUserFeedback(user);
      return feedback;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load feedback history';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return [];
    }
  }, [user, toast]);

  // Delete feedback entry
  const deleteFeedback = useCallback(async (feedbackId: string) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to delete feedback",
        variant: "destructive",
      });
      return false;
    }

    try {
      const success = await feedbackService.deleteFeedback(feedbackId, user);
      if (success) {
        toast({
          title: "Success",
          description: "Feedback entry deleted successfully",
        });
        return true;
      } else {
        toast({
          title: "Error",
          description: "Failed to delete feedback entry",
          variant: "destructive",
        });
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete feedback entry';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    }
  }, [user, toast]);

  // Clear error state
  const clearError = useCallback(() => {
    setState(prev => ({
      ...prev,
      error: null,
    }));
  }, []);

  return {
    isSubmitting: state.isSubmitting,
    error: state.error,
    submitFeedback,
    getUserFeedback,
    deleteFeedback,
    clearError,
  };
}

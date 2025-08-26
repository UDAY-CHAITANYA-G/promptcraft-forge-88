import emailjs from '@emailjs/browser';
import { emailConfig } from './emailConfig';
import { User } from '@supabase/supabase-js';

export interface FeedbackData {
  message: string;
}

export const emailService = {
  /**
   * Send feedback email using EmailJS
   * @param feedbackData - The feedback form data
   * @param user - Optional user object to get email from
   * @param displayName - Optional display name for the user
   * @returns Promise<boolean> - True if email sent successfully, false otherwise
   */
  sendFeedback: async (
    feedbackData: FeedbackData,
    user?: User,
    displayName?: string
  ): Promise<boolean> => {
    try {
      // Initialize EmailJS with your public key
      emailjs.init(emailConfig.publicKey);

      // Derive best available name and email
      const userEmail = user?.email || (user?.user_metadata as any)?.email || 'no-reply@example.com';
      const userName =
        displayName ||
        (user?.user_metadata as any)?.full_name ||
        (user?.user_metadata as any)?.name ||
        (userEmail && typeof userEmail === 'string' ? userEmail.split('@')[0] : 'User');

      // Prepare template parameters
      const templateParams = {
        to_email: emailConfig.recipientEmail,
        from_name: userName,
        from_email: userEmail,
        message: feedbackData.message,
        subject: 'PromptForge Feedback',
      };

      // Send email using EmailJS
      const response = await emailjs.send(
        emailConfig.serviceId,
        emailConfig.templateId,
        templateParams
      );

      console.log('Email sent successfully:', response);
      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  },

  /**
   * Check if EmailJS is properly configured
   * @returns boolean - True if all required IDs are set
   */
  isConfigured: (): boolean => {
    return !(
      emailConfig.serviceId === 'YOUR_SERVICE_ID' ||
      emailConfig.templateId === 'YOUR_TEMPLATE_ID' ||
      emailConfig.publicKey === 'YOUR_PUBLIC_KEY'
    );
  },

  /**
   * Get configuration status message
   * @returns string - Status message for configuration
   */
  getConfigStatus: (): string => {
    if (emailService.isConfigured()) {
      return 'EmailJS is properly configured';
    }
    return 'EmailJS needs configuration - please update the service file with your EmailJS credentials';
  }
};

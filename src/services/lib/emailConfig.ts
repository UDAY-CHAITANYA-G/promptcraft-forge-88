// EmailJS Configuration
// This file now uses environment variables for configuration
// To use this service, you need to:
// 1. Sign up at https://www.emailjs.com/
// 2. Create an email service (Gmail, Outlook, etc.)
// 3. Create an email template
// 4. Set the environment variables in your .env file

import { envConfig } from '@/config';

export const emailConfig = {
  // EmailJS credentials from environment configuration
  serviceId: envConfig.emailjs.serviceId,
  templateId: envConfig.emailjs.templateId,
  publicKey: envConfig.emailjs.publicKey,
  recipientEmail: envConfig.emailjs.recipientEmail,
  
  // Email template variables that should match your EmailJS template
  templateVariables: {
    to_email: envConfig.emailjs.recipientEmail,
    from_name: '{{from_name}}',
    from_email: '{{from_email}}',
    message: '{{message}}',
    subject: 'PromptForge Feedback',
  }
};

// Example EmailJS template structure:
/*
Subject: {{subject}}
From: {{from_name}} <{{from_email}}>
Message: {{message}}

This is a feedback message from PromptForge.
Name: {{from_name}}
Email: {{from_email}}
Message: {{message}}
*/

// EmailJS Configuration
// This file imports private credentials from emailConfig.private.ts
// To use this service, you need to:
// 1. Sign up at https://www.emailjs.com/
// 2. Create an email service (Gmail, Outlook, etc.)
// 3. Create an email template
// 4. Update the credentials in emailConfig.private.ts

import { emailConfigPrivate } from './emailConfig.private';

export const emailConfig = {
  // EmailJS credentials imported from private config
  serviceId: emailConfigPrivate.serviceId,
  templateId: emailConfigPrivate.templateId,
  publicKey: emailConfigPrivate.publicKey,
  recipientEmail: emailConfigPrivate.recipientEmail,
  
  // Email template variables that should match your EmailJS template
  templateVariables: {
    to_email: emailConfigPrivate.recipientEmail,
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

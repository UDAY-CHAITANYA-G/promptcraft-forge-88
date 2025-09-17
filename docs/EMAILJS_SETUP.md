# EmailJS Setup Guide

This guide will help you set up EmailJS to send feedback emails from your PromptForge application.

## What is EmailJS?

EmailJS is a service that allows you to send emails directly from your frontend JavaScript code without needing a backend server. It's perfect for contact forms and feedback systems.

## Security & Configuration

This implementation uses a **private configuration approach** to keep your EmailJS credentials secure:
- Sensitive credentials are stored in a separate private file (`emailConfig.private.ts`)
- The private file is automatically ignored by Git (added to `.gitignore`)
- A template file is provided for easy setup
- Main configuration imports from the private file

## Setup Steps

### 1. Sign Up for EmailJS

1. Go to [https://www.emailjs.com/](https://www.emailjs.com/)
2. Click "Sign Up" and create a free account
3. Verify your email address

### 2. Create an Email Service

1. In your EmailJS dashboard, go to "Email Services"
2. Click "Add New Service"
3. Choose your email provider (Gmail, Outlook, etc.)
4. Follow the authentication steps for your chosen provider
5. Note down the **Service ID** - you'll need this later

### 3. Create an Email Template

1. Go to "Email Templates" in your dashboard
2. Click "Create New Template"
3. Design your email template with these variables:
   - `{{from_name}}` - The sender's name
   - `{{from_email}}` - The sender's email
   - `{{message}}` - The feedback message
   - `{{subject}}` - The email subject
4. Save the template and note down the **Template ID**

### 4. Get Your Public Key

1. Go to "Account" → "API Keys" in your dashboard
2. Copy your **Public Key**

### 5. Update Configuration

1. Copy the template file to create your private configuration:
   ```bash
   cp src/lib/emailConfig.private.template.ts src/lib/emailConfig.private.ts
   ```

2. Open `src/lib/emailConfig.private.ts` and replace the placeholder values with your actual credentials:

```typescript
export const emailConfigPrivate = {
  serviceId: 'your_actual_service_id_here',
  templateId: 'your_actual_template_id_here',
  publicKey: 'your_actual_public_key_here',
  recipientEmail: 'zeroxchaitanya@gmail.com',
};
```

**Important:** The private configuration file is automatically ignored by Git, so your credentials won't be committed to version control.

### 6. Test the Setup

1. Start your development server
2. Go to the footer section of your app
3. Fill out the feedback form and submit
4. Check if you receive the email at `zeroxchaitanya@gmail.com`

## Email Template Example

Here's a simple email template you can use:

**Subject:** `{{subject}}`

**Body:**
```
New feedback received from PromptForge

Name: {{from_name}}
Email: {{from_email}}
Message: {{message}}

---
This email was sent from the PromptForge feedback form.
```

## Troubleshooting

### Common Issues

1. **"EmailJS is not configured" error**
   - Make sure you've updated all three values in `emailConfig.ts`
   - Check that there are no extra spaces or quotes

2. **"Failed to send email" error**
   - Verify your EmailJS service is properly connected
   - Check that your template variables match exactly
   - Ensure your public key is correct

3. **Emails not being received**
   - Check your spam folder
   - Verify the recipient email address is correct
   - Check your EmailJS dashboard for any error logs

### Getting Help

- EmailJS Documentation: [https://www.emailjs.com/docs/](https://www.emailjs.com/docs/)
- EmailJS Support: [https://www.emailjs.com/support/](https://www.emailjs.com/support/)

## Security Notes

- The public key is safe to expose in frontend code
- EmailJS handles rate limiting and spam protection
- Consider implementing CAPTCHA for production use
- Monitor your EmailJS usage to stay within free tier limits

## Free Tier Limits

- EmailJS free tier includes 200 emails per month
- Additional emails cost $0.10 each
- Upgrade to paid plans for higher limits and priority support

// EmailJS Configuration Template
// Copy this file to emailConfig.private.ts and update with your actual credentials
// DO NOT commit the actual private config file to version control

export const emailConfigPrivate = {
  // Your EmailJS service ID (found in EmailJS dashboard under Email Services)
  serviceId: 'YOUR_SERVICE_ID',
  
  // Your EmailJS template ID (found in EmailJS dashboard under Email Templates)
  templateId: 'YOUR_TEMPLATE_ID',
  
  // Your EmailJS public key (found in EmailJS dashboard under Account > API Keys)
  publicKey: 'YOUR_PUBLIC_KEY',
  
  // The email address where feedback will be sent
  recipientEmail: 'zeroxchaitanya@gmail.com',
};

// Setup Instructions:
// 1. Copy this file: cp emailConfig.private.template.ts emailConfig.private.ts
// 2. Update the values in emailConfig.private.ts with your actual EmailJS credentials
// 3. The private file is already in .gitignore, so it won't be committed

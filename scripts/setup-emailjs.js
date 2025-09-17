#!/usr/bin/env node

/**
 * EmailJS Setup Script
 * This script helps you set up your private EmailJS configuration
 */

const fs = require('fs');
const path = require('path');

const templatePath = path.join(__dirname, 'src', 'lib', 'emailConfig.private.template.ts');
const privatePath = path.join(__dirname, 'src', 'lib', 'emailConfig.private.ts');

console.log('🚀 Setting up EmailJS configuration...\n');

// Check if private config already exists
if (fs.existsSync(privatePath)) {
  console.log('⚠️  Private configuration file already exists!');
  console.log('   If you want to recreate it, delete the existing file first.\n');
  process.exit(0);
}

// Check if template exists
if (!fs.existsSync(templatePath)) {
  console.log('❌ Template file not found!');
  console.log('   Make sure you run this script from the project root directory.\n');
  process.exit(1);
}

try {
  // Copy template to private config
  const templateContent = fs.readFileSync(templatePath, 'utf8');
  fs.writeFileSync(privatePath, templateContent);
  
  console.log('✅ Private configuration file created successfully!');
  console.log('   File: src/lib/emailConfig.private.ts\n');
  
  console.log('📝 Next steps:');
  console.log('   1. Open src/lib/emailConfig.private.ts');
  console.log('   2. Replace the placeholder values with your actual EmailJS credentials');
  console.log('   3. Save the file');
  console.log('   4. Test the feedback form in your application\n');
  
  console.log('🔒 Security note:');
  console.log('   The private config file is automatically ignored by Git');
  console.log('   Your credentials will not be committed to version control.\n');
  
} catch (error) {
  console.log('❌ Error creating private configuration file:');
  console.log('   ' + error.message);
  process.exit(1);
}

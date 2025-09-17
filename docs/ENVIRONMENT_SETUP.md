# Environment Configuration Setup

## 🔧 **Required Environment Variables**

To run this application, you need to set up the following environment variables:

### 1. **Supabase Configuration**
```bash
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 2. **EmailJS Configuration**
```bash
VITE_EMAILJS_SERVICE_ID=your_emailjs_service_id_here
VITE_EMAILJS_TEMPLATE_ID=your_emailjs_template_id_here
VITE_EMAILJS_PUBLIC_KEY=your_emailjs_public_key_here
VITE_EMAILJS_RECIPIENT_EMAIL=your_recipient_email_here
```

### 3. **Application Configuration**
```bash
VITE_APP_NAME=PromptForge
VITE_APP_VERSION=1.0.0
VITE_APP_ENVIRONMENT=development
```

## 📋 **Setup Instructions**

1. **Create Environment File**
   ```bash
   cp .env.example .env
   ```

2. **Update Values**
   - Replace all placeholder values with your actual credentials
   - Never commit the `.env` file to version control

3. **Restart Development Server**
   ```bash
   npm run dev
   ```

## 🔒 **Security Notes**

- The `.env` file is already in `.gitignore`
- Private configuration files are also ignored
- Never share your actual credentials
- Use different credentials for development and production

## 🚨 **Current Status**

The application currently has hardcoded credentials in:
- `src/integrations/supabase/client.ts`
- `src/services/lib/emailConfig.private.ts`

These should be moved to environment variables for better security.

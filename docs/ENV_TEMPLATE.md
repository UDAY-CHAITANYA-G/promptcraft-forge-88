# Environment Configuration Template

Copy this content to a `.env` file in your project root and update with your actual values.

```bash
# Environment Configuration Template
# Copy this file to .env and update with your actual values

# ============================================================================
# APPLICATION CONFIGURATION
# ============================================================================

# Application Information
VITE_APP_NAME=PromptForge
VITE_APP_VERSION=1.0.0
VITE_APP_ENVIRONMENT=development
VITE_APP_DEBUG=true

# ============================================================================
# SUPABASE CONFIGURATION
# ============================================================================

# Supabase Project URL (required)
VITE_SUPABASE_URL=your_supabase_url_here

# Supabase Anonymous Key (required)
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# ============================================================================
# EMAILJS CONFIGURATION
# ============================================================================

# EmailJS Service ID (optional - for feedback feature)
VITE_EMAILJS_SERVICE_ID=your_emailjs_service_id_here

# EmailJS Template ID (optional - for feedback feature)
VITE_EMAILJS_TEMPLATE_ID=your_emailjs_template_id_here

# EmailJS Public Key (optional - for feedback feature)
VITE_EMAILJS_PUBLIC_KEY=your_emailjs_public_key_here

# EmailJS Recipient Email (optional - for feedback feature)
VITE_EMAILJS_RECIPIENT_EMAIL=your_recipient_email_here

# ============================================================================
# SECURITY CONFIGURATION
# ============================================================================

# Encryption Key (change this in production!)
VITE_ENCRYPTION_KEY=promptforge-secure-key-2024

# JWT Secret (optional)
VITE_JWT_SECRET=your_jwt_secret_here

# ============================================================================
# API CONFIGURATION
# ============================================================================

# API Timeout (milliseconds)
VITE_API_TIMEOUT=30000

# API Retry Attempts
VITE_API_RETRY_ATTEMPTS=3

# API Base URLs (optional - uses defaults if not set)
VITE_OPENAI_BASE_URL=https://api.openai.com/v1
VITE_GEMINI_BASE_URL=https://generativelanguage.googleapis.com/v1
VITE_ANTHROPIC_BASE_URL=https://api.anthropic.com/v1

# ============================================================================
# FEATURE FLAGS
# ============================================================================

# Enable/disable specific features
VITE_FEATURE_HISTORY=true
VITE_FEATURE_FEEDBACK=true
VITE_FEATURE_ANALYTICS=false
VITE_FEATURE_EXPORT=true
VITE_FEATURE_IMPORT=false

# ============================================================================
# PROVIDER CONFIGURATION
# ============================================================================

# Comma-separated list of enabled providers
VITE_ENABLED_PROVIDERS=openai,gemini,anthropic

# ============================================================================
# FRAMEWORK CONFIGURATION
# ============================================================================

# Comma-separated list of enabled frameworks
VITE_ENABLED_FRAMEWORKS=roses,ape,tag,era,race,rise,care,coast,trace

# ============================================================================
# DEVELOPMENT CONFIGURATION
# ============================================================================

# Enable logging in development
VITE_ENABLE_LOGGING=true

# Enable debug mode
VITE_DEBUG_MODE=true

# Mock API responses for testing
VITE_MOCK_API_RESPONSES=false
```

## Setup Instructions

1. **Create Environment File:**
   ```bash
   cp docs/ENV_TEMPLATE.md .env
   ```

2. **Update Values:**
   - Replace all placeholder values with your actual credentials
   - Never commit the `.env` file to version control

3. **Restart Development Server:**
   ```bash
   npm run dev
   ```

## Security Notes

- The `.env` file is already in `.gitignore`
- Private configuration files are also ignored
- Never share your actual credentials
- Use different credentials for development and production
- Change the default encryption key in production


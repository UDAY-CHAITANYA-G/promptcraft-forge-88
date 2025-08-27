# Google OAuth Setup for Supabase

To enable Google authentication in your Supabase project, follow these steps:

## 1. Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Choose "Web application" as the application type
6. Add your Supabase project URL to the authorized redirect URIs:
   - `https://[YOUR_PROJECT_REF].supabase.co/auth/v1/callback`
   - `http://localhost:54321/auth/v1/callback` (for local development)

## 2. Supabase Dashboard Configuration

1. Go to your [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Go to "Authentication" → "Providers"
4. Find "Google" and click "Enable"
5. Enter your Google OAuth credentials:
   - **Client ID**: From Google Cloud Console
   - **Client Secret**: From Google Cloud Console
6. Save the configuration

## 3. Environment Variables

Make sure your Supabase environment variables are properly configured in your `.env.local` file:

```env
VITE_SUPABASE_URL=https://[YOUR_PROJECT_REF].supabase.co
VITE_SUPABASE_ANON_KEY=[YOUR_ANON_KEY]
```

## 4. Testing

After setup, you should be able to:
- Click "Sign in with Google" or "Sign up with Google" buttons
- See a new tab open for Google authentication
- Receive appropriate notifications based on the action (sign-in vs sign-up)
- Be automatically redirected after successful authentication

## Troubleshooting

- **New tab not opening**: Make sure popup blockers are not interfering with new tab creation
- **Redirect URI mismatch**: Verify the redirect URIs in Google Cloud Console match your Supabase project
- **CORS issues**: Ensure your domain is properly configured in Supabase

## Features Implemented

✅ **New tab-based authentication** instead of popups or page redirects
✅ **Context-aware notifications** (sign-in vs sign-up)
✅ **Automatic user detection** (new vs returning users)
✅ **Proper error handling** with user-friendly messages
✅ **Loading states** during authentication process
✅ **No popup blocker issues** - works reliably across all browsers

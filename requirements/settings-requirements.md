# Settings Screen Requirements

## Overview
This document outlines the comprehensive requirements for implementing a Settings screen in the PromptCraft Forge application. The settings screen will provide users with centralized access to manage their profile, preferences, security settings, and application configurations.

## Current Application Context
Based on the existing codebase analysis:
- **Authentication**: Supabase Auth with Google OAuth and email/password
- **User Profile**: Basic profile table with display_name and avatar_url
- **API Configuration**: Encrypted storage of OpenAI, Gemini, and Anthropic API keys
- **User Preferences**: Model selection, framework selection, and vibe coding toggle
- **UI Framework**: React with shadcn/ui components and Tailwind CSS

## Settings Screen Menu Structure

### 1. Profile Management
**Icon**: `User` (Lucide React)
**Description**: Manage personal information and account details

#### Features:
- **Personal Information**
  - Display Name (editable)
  - first and last name
  - Email Address (read-only, with change email option)
  - Profile Picture/Avatar (upload/change/remove)
  - Bio/Description (optional)

- **Account Information**
  - Account Creation Date
  - Last Login Date
  - Account Status
  - User ID (read-only)

- **Profile Actions**
  - Save Changes
  - Reset to Default
  - Export Profile Data

### 2. Security & Privacy
**Icon**: `Shield` (Lucide React)
**Description**: Manage security settings and privacy preferences

#### Features:
- **Password Management**
  - Change Password (for email/password users)
  - Password Strength Indicator
  - Password Requirements Display
  - Forgot Password Link

- **Two-Factor Authentication**
  - Enable/Disable 2FA
  - Setup Instructions
  - Recovery Codes
  - Backup Methods

- **Session Management**
  - Active Sessions List
  - Sign Out from All Devices
  - Session Timeout Settings

- **Privacy Settings**
  - Data Collection Preferences
  - Analytics Opt-in/out
  - Marketing Communications Toggle
  - Profile Visibility Settings

### 3. API Configuration
**Icon**: `Key` (Lucide React)
**Description**: Manage AI service API keys and configurations

#### Features:
- **API Key Management**
  - OpenAI API Key (add/edit/remove/test)
  - Google Gemini API Key (add/edit/remove/test)
  - Anthropic Claude API Key (add/edit/remove/test)
  - API Key Validation Status
  - Usage Statistics (if available)

- **API Settings**
  - Default Model Selection
  - Rate Limiting Preferences
  - Request Timeout Settings
  - Error Handling Preferences

- **Security Features**
  - API Key Encryption Status
  - Last Updated Timestamps
  - Usage Alerts/Notifications

### 4. Application Preferences
**Icon**: `Settings` (Lucide React)
**Description**: Customize application behavior and appearance

#### Features:
- **Theme & Appearance**
  - Light/Dark Theme Toggle
  - System Theme (Auto)
  - Accent Color Selection
  - Font Size Preferences
  - UI Density Settings

- **Prompt Generation Settings**
  - Default Framework Selection (R.O.S.E.S, A.P.E, T.A.G, etc.)
  - Vibe Coding Mode Toggle
  - Default Tone Selection
  - Default Length Selection
  - Auto-save Generated Prompts

- **Interface Preferences**
  - Sidebar Behavior (auto-hide, always visible)
  - Navigation Style
  - Tooltip Preferences
  - Animation Settings
  - Language/Locale Selection

### 5. Notifications
**Icon**: `Bell` (Lucide React)
**Description**: Manage notification preferences and alerts

#### Features:
- **Notification Types**
  - Email Notifications Toggle
  - In-App Notifications Toggle
  - Browser Push Notifications

- **Notification Categories**
  - Account Security Alerts
  - API Usage Warnings
  - Feature Updates
  - Marketing Communications
  - System Maintenance

- **Notification Timing**
  - Quiet Hours Settings
  - Frequency Preferences
  - Urgency Levels

### 6. Data & Storage
**Icon**: `Database` (Lucide React)
**Description**: Manage data storage and export options

#### Features:
- **Data Management**
  - Prompt History Management
  - Export All Data (JSON/CSV)
  - Import Data
  - Data Backup Options

- **Storage Information**
  - Used Storage Space
  - Storage Limits
  - Cleanup Options
  - Data Retention Settings

- **Privacy Controls**
  - Delete Account Option
  - Data Deletion Requests
  - GDPR Compliance Tools

### 7. Billing & Usage
**Icon**: `CreditCard` (Lucide React)
**Description**: Manage subscription and usage information

#### Features:
- **Usage Statistics**
  - API Calls Made
  - Tokens Used
  - Monthly Usage Trends
  - Cost Breakdown

- **Subscription Management**
  - Current Plan Details
  - Usage Limits
  - Upgrade/Downgrade Options
  - Billing History

- **Payment Information**
  - Payment Methods
  - Billing Address
  - Invoice Downloads
  - Payment History

### 8. Help & Support
**Icon**: `HelpCircle` (Lucide React)
**Description**: Access help resources and support options

#### Features:
- **Documentation**
  - User Guide
  - API Documentation
  - FAQ Section
  - Video Tutorials

- **Support Options**
  - Contact Support
  - Bug Report
  - Feature Request
  - Community Forum

- **System Information**
  - Application Version
  - Browser Information
  - System Requirements
  - Debug Information

## Technical Implementation Requirements

### Database Schema Extensions
```sql
-- Extend profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS website_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Create user_settings table
CREATE TABLE IF NOT EXISTS public.user_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    theme VARCHAR(20) DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
    language VARCHAR(10) DEFAULT 'en',
    timezone VARCHAR(50) DEFAULT 'UTC',
    notifications_enabled BOOLEAN DEFAULT true,
    email_notifications BOOLEAN DEFAULT true,
    push_notifications BOOLEAN DEFAULT false,
    auto_save_prompts BOOLEAN DEFAULT true,
    sidebar_behavior VARCHAR(20) DEFAULT 'auto' CHECK (sidebar_behavior IN ('auto', 'always', 'never')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id)
);

-- Create notification_preferences table
CREATE TABLE IF NOT EXISTS public.notification_preferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL,
    email_enabled BOOLEAN DEFAULT true,
    in_app_enabled BOOLEAN DEFAULT true,
    push_enabled BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, category)
);
```

### Component Structure
```
src/
├── pages/
│   └── Settings.tsx                 # Main settings page
├── components/
│   ├── settings/
│   │   ├── SettingsLayout.tsx       # Settings page layout
│   │   ├── SettingsSidebar.tsx      # Settings navigation sidebar
│   │   ├── ProfileSettings.tsx      # Profile management
│   │   ├── SecuritySettings.tsx     # Security & privacy
│   │   ├── ApiConfigSettings.tsx    # API configuration
│   │   ├── AppPreferences.tsx       # Application preferences
│   │   ├── NotificationSettings.tsx # Notification preferences
│   │   ├── DataSettings.tsx         # Data & storage
│   │   ├── BillingSettings.tsx      # Billing & usage
│   │   └── HelpSettings.tsx         # Help & support
│   └── ui/
│       ├── avatar-upload.tsx        # Avatar upload component
│       ├── theme-toggle.tsx         # Theme toggle component
│       └── settings-card.tsx        # Reusable settings card
├── hooks/
│   ├── useSettings.tsx              # Settings management hook
│   ├── useProfile.tsx               # Profile management hook
│   └── useNotifications.tsx         # Notification preferences hook
└── services/
    └── lib/
        ├── settingsService.ts       # Settings management service
        ├── profileService.ts        # Profile management service
        └── notificationService.ts   # Notification management service
```

### Navigation Integration
- Add "Settings" option to main navigation menu
- Implement breadcrumb navigation within settings
- Add quick access to frequently used settings
- Implement search functionality within settings

### Responsive Design
- Mobile-first approach with collapsible sidebar
- Touch-friendly interface elements
- Optimized for tablet and desktop views
- Consistent with existing design system

### Security Considerations
- All sensitive data encrypted at rest
- Secure file upload for avatars
- Rate limiting on settings updates
- Audit logging for security-related changes
- CSRF protection for all forms

### Performance Requirements
- Lazy loading of settings sections
- Optimistic updates for better UX
- Caching of user preferences
- Minimal API calls through efficient state management

### Accessibility
- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support
- Focus management

## User Experience Guidelines

### Navigation Flow
1. User clicks "Settings" from main navigation
2. Settings page loads with sidebar navigation
3. Default section (Profile) is displayed
4. User can navigate between sections using sidebar
5. Changes are auto-saved or require explicit save action
6. Success/error feedback provided for all actions

### Visual Design
- Consistent with existing application theme
- Clear section separation
- Prominent save/cancel actions
- Loading states for all async operations
- Confirmation dialogs for destructive actions

### Error Handling
- Graceful error messages
- Retry mechanisms for failed operations
- Offline state handling
- Validation feedback in real-time

## Implementation Priority

### Phase 1 (Core Settings)
1. Profile Management
2. API Configuration (enhance existing)
3. Application Preferences (theme, basic settings)

### Phase 2 (Security & Data)
1. Security & Privacy
2. Data & Storage
3. Notification Settings

### Phase 3 (Advanced Features)
1. Billing & Usage
2. Help & Support
3. Advanced customization options

## Success Metrics
- User engagement with settings (time spent, sections visited)
- Reduction in support tickets related to configuration
- User satisfaction scores for settings usability
- Completion rates for profile setup
- API key configuration success rates

## Future Enhancements
- Advanced theme customization
- Plugin/extension management
- Team/organization settings
- Advanced analytics and reporting
- Integration with external services
- Mobile app settings synchronization

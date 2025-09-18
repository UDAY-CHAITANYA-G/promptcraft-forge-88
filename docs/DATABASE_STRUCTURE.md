# Database Structure Documentation

This document provides a comprehensive overview of the restructured Supabase database for PromptCraft Forge.

## 🏗️ **Database Architecture Overview**

The database has been completely restructured into a logical, scalable, and maintainable system with the following key improvements:

### **Organized File Structure**
```
supabase/
├── schema/                          # Modular schema files
│   ├── 01_core_functions.sql        # Core database functions
│   ├── 02_user_management.sql       # User-related tables
│   ├── 03_api_management.sql        # API configuration and usage
│   ├── 04_prompt_management.sql     # Prompt frameworks and history
│   ├── 05_feedback_system.sql       # Feedback and support system
│   ├── 06_indexes_and_performance.sql # Performance optimizations
│   ├── 07_security_and_rls.sql      # Security and RLS policies
│   └── 08_initial_data.sql          # Seed data and initial setup
├── migrations/                      # Migration files
│   ├── 000_initial_schema.sql       # Complete initial schema
│   └── 001_seed_data.sql            # Initial seed data
└── config.toml                      # Supabase configuration
```

## 📊 **Database Schema Overview**

### **Core Tables**

#### **1. User Management**
- **`user_profiles`** - Extended user information
- **`user_preferences`** - User settings and preferences
- **`user_sessions`** - Session tracking (optional)

#### **2. API Management**
- **`api_providers`** - AI provider configurations
- **`api_configurations`** - User API keys (encrypted)
- **`api_usage_logs`** - API usage tracking and analytics

#### **3. Prompt Management**
- **`prompt_frameworks`** - Available prompt frameworks
- **`prompt_history`** - User prompt generation history
- **`prompt_templates`** - Reusable prompt templates

#### **4. Feedback System**
- **`feedback`** - User feedback and support tickets
- **`feedback_categories`** - Feedback categorization
- **`feedback_tags`** - Feedback tagging system
- **`feedback_analytics`** - Feedback metrics and trends

## 🔧 **Key Features**

### **1. Enhanced Security**
- **Row Level Security (RLS)** on all tables
- **Encrypted API keys** with configurable encryption
- **Comprehensive access policies** with user isolation
- **Audit logging** for security monitoring

### **2. Performance Optimization**
- **Strategic indexing** for common query patterns
- **Composite indexes** for multi-column queries
- **Partial indexes** for filtered data
- **Full-text search** capabilities
- **Materialized views** for complex analytics

### **3. Scalability Features**
- **Configurable providers** - Easy to add new AI providers
- **Dynamic frameworks** - Configurable prompt frameworks
- **Usage tracking** - API usage monitoring and rate limiting
- **Analytics system** - Comprehensive metrics and reporting

### **4. Data Integrity**
- **Comprehensive constraints** and validations
- **Referential integrity** with proper foreign keys
- **Data validation functions** for API keys and formats
- **Automatic cleanup** of old records

## 📋 **Table Details**

### **User Management Tables**

#### **user_profiles**
```sql
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key to auth.users)
- display_name (VARCHAR(100))
- avatar_url (TEXT)
- bio (TEXT)
- preferences (JSONB)
- is_active (BOOLEAN)
- last_login_at (TIMESTAMP)
- created_at, updated_at (TIMESTAMP)
```

#### **user_preferences**
```sql
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key to auth.users)
- selected_model (VARCHAR(50)) - AI model preference
- selected_framework (VARCHAR(50)) - Framework preference
- theme (VARCHAR(20)) - UI theme preference
- language (VARCHAR(10)) - Language preference
- enable_notifications (BOOLEAN)
- enable_analytics (BOOLEAN)
- enable_history (BOOLEAN)
- enable_feedback (BOOLEAN)
- max_history_days (INTEGER)
- auto_cleanup (BOOLEAN)
- created_at, updated_at (TIMESTAMP)
```

### **API Management Tables**

#### **api_providers**
```sql
- id (UUID, Primary Key)
- name (VARCHAR(50), Unique) - Provider identifier
- display_name (VARCHAR(100)) - Human-readable name
- base_url (TEXT) - API base URL
- api_key_pattern (TEXT) - Regex pattern for validation
- is_enabled (BOOLEAN) - Provider availability
- max_requests_per_minute (INTEGER) - Rate limiting
- max_requests_per_day (INTEGER) - Daily limits
- supported_models (JSONB) - Available models
- validation_rules (JSONB) - Validation configuration
- created_at, updated_at (TIMESTAMP)
```

#### **api_configurations**
```sql
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key to auth.users)
- provider (VARCHAR(50)) - Provider name
- api_key_encrypted (TEXT) - Encrypted API key
- is_active (BOOLEAN) - Configuration status
- is_validated (BOOLEAN) - Validation status
- last_validated_at (TIMESTAMP)
- validation_error (TEXT)
- usage_count (INTEGER) - Usage tracking
- last_used_at (TIMESTAMP)
- created_at, updated_at (TIMESTAMP)
```

#### **api_usage_logs**
```sql
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key to auth.users)
- provider (VARCHAR(50)) - Provider name
- endpoint (TEXT) - API endpoint used
- request_size (INTEGER) - Request size in bytes
- response_size (INTEGER) - Response size in bytes
- response_time_ms (INTEGER) - Response time
- status_code (INTEGER) - HTTP status code
- error_message (TEXT) - Error details
- created_at (TIMESTAMP)
```

### **Prompt Management Tables**

#### **prompt_frameworks**
```sql
- id (UUID, Primary Key)
- name (VARCHAR(50), Unique) - Framework identifier
- display_name (VARCHAR(100)) - Human-readable name
- description (TEXT) - Framework description
- components (JSONB) - Framework components
- template (TEXT) - Prompt template
- examples (JSONB) - Example prompts
- is_enabled (BOOLEAN) - Framework availability
- sort_order (INTEGER) - Display order
- created_at, updated_at (TIMESTAMP)
```

#### **prompt_history**
```sql
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key to auth.users)
- framework_id (VARCHAR(50)) - Framework used
- framework_name (VARCHAR(100)) - Framework display name
- model (VARCHAR(50)) - AI model used
- provider (VARCHAR(50)) - Provider used
- user_input (TEXT) - User's input
- ai_response (TEXT) - AI's response
- tone (VARCHAR(50)) - Prompt tone
- length (VARCHAR(50)) - Prompt length
- temperature (DECIMAL) - AI temperature setting
- max_tokens (INTEGER) - Token limit
- vibe_coding (BOOLEAN) - Vibe coding flag
- processing_time_ms (INTEGER) - Processing time
- tokens_used (INTEGER) - Tokens consumed
- cost_usd (DECIMAL) - Cost in USD
- status (VARCHAR(20)) - Generation status
- error_message (TEXT) - Error details
- error_code (VARCHAR(50)) - Error code
- created_at, updated_at (TIMESTAMP)
```

#### **prompt_templates**
```sql
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key to auth.users, nullable)
- name (VARCHAR(100)) - Template name
- description (TEXT) - Template description
- framework_id (VARCHAR(50)) - Framework used
- template_content (TEXT) - Template content
- variables (JSONB) - Template variables
- is_public (BOOLEAN) - Public visibility
- is_active (BOOLEAN) - Template status
- usage_count (INTEGER) - Usage tracking
- created_at, updated_at (TIMESTAMP)
```

### **Feedback System Tables**

#### **feedback**
```sql
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key to auth.users, nullable)
- message (TEXT) - Feedback message
- feedback_type (VARCHAR(50)) - Type of feedback
- priority (VARCHAR(20)) - Priority level
- status (VARCHAR(20)) - Status
- contact_email (VARCHAR(255)) - Contact email
- contact_name (VARCHAR(100)) - Contact name
- user_agent (TEXT) - Browser info
- browser_info (JSONB) - Browser details
- device_info (JSONB) - Device details
- admin_response (TEXT) - Admin response
- admin_user_id (UUID) - Admin who responded
- responded_at (TIMESTAMP) - Response time
- rating (INTEGER) - User rating (1-5)
- created_at, updated_at (TIMESTAMP)
```

## 🔐 **Security Features**

### **Row Level Security (RLS)**
- **User Isolation**: Users can only access their own data
- **Admin Access**: Admins can access all data for management
- **Public Resources**: Some resources are publicly readable
- **System Access**: System functions can insert logs and analytics

### **Data Encryption**
- **API Keys**: All API keys are encrypted before storage
- **Sensitive Data**: Configurable encryption for sensitive fields
- **Key Management**: Environment-based encryption keys

### **Access Control**
- **Authentication Required**: Most operations require authentication
- **Permission Validation**: Comprehensive permission checking
- **Audit Logging**: Security event logging and monitoring

## 📈 **Performance Features**

### **Indexing Strategy**
- **Primary Indexes**: On all primary keys and foreign keys
- **Composite Indexes**: For common multi-column queries
- **Partial Indexes**: For filtered data (active records, recent data)
- **Full-Text Search**: For searchable content

### **Query Optimization**
- **Materialized Views**: For complex analytics queries
- **Function-Based Indexes**: For computed columns
- **Covering Indexes**: To avoid table lookups

### **Maintenance**
- **Automatic Cleanup**: Old records are automatically cleaned up
- **Statistics Updates**: Regular statistics updates for query planning
- **Vacuum Operations**: Regular maintenance for optimal performance

## 🚀 **Migration Guide**

### **For New Installations**
1. Run `000_initial_schema.sql` to create the complete schema
2. Run `001_seed_data.sql` to populate initial data
3. Configure environment variables
4. Test the setup

### **For Existing Installations**
1. **Backup your data** before migration
2. Review the new schema structure
3. Plan data migration from old tables
4. Run migrations in order
5. Update application code to use new structure
6. Test thoroughly

### **Migration Steps**
```sql
-- 1. Create new schema
\i supabase/schema/01_core_functions.sql
\i supabase/schema/02_user_management.sql
\i supabase/schema/03_api_management.sql
\i supabase/schema/04_prompt_management.sql
\i supabase/schema/05_feedback_system.sql
\i supabase/schema/06_indexes_and_performance.sql
\i supabase/schema/07_security_and_rls.sql
\i supabase/schema/08_initial_data.sql

-- 2. Migrate existing data (if applicable)
-- 3. Drop old tables (after verification)
-- 4. Update application code
```

## 🔧 **Configuration**

### **Environment Variables**
```bash
# Database Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Security Configuration
VITE_ENCRYPTION_KEY=your_encryption_key

# Feature Flags
VITE_FEATURE_HISTORY=true
VITE_FEATURE_FEEDBACK=true
VITE_FEATURE_ANALYTICS=false
```

### **System Configuration**
The database includes a `system_config` table for runtime configuration:
- Application settings
- Feature flags
- Rate limits
- Maintenance settings

## 📊 **Analytics and Monitoring**

### **Built-in Analytics**
- **User Activity**: Login patterns, usage statistics
- **API Usage**: Request patterns, error rates, performance
- **Prompt Analytics**: Framework usage, success rates
- **Feedback Analytics**: Response times, satisfaction ratings

### **Monitoring Functions**
- **Health Checks**: Database and service health
- **Performance Metrics**: Query performance, index usage
- **Security Monitoring**: Suspicious activity detection
- **Data Integrity**: Validation and consistency checks

## 🛠️ **Maintenance**

### **Regular Maintenance Tasks**
```sql
-- Daily maintenance
SELECT public.daily_maintenance();

-- Analyze tables
SELECT public.analyze_all_tables();

-- Vacuum tables
SELECT public.vacuum_all_tables();

-- Get database statistics
SELECT * FROM public.get_database_stats();
```

### **Cleanup Operations**
- **Old Records**: Automatic cleanup of old logs and history
- **Orphaned Data**: Cleanup of orphaned records
- **Temporary Data**: Cleanup of temporary and cache data

## 📚 **Best Practices**

### **Development**
1. **Use Transactions**: Wrap related operations in transactions
2. **Validate Input**: Always validate data before insertion
3. **Handle Errors**: Implement proper error handling
4. **Use Prepared Statements**: For better performance and security

### **Production**
1. **Monitor Performance**: Regular performance monitoring
2. **Backup Regularly**: Automated backup strategies
3. **Update Statistics**: Regular statistics updates
4. **Security Audits**: Regular security reviews

### **Scaling**
1. **Index Optimization**: Monitor and optimize indexes
2. **Query Optimization**: Analyze and optimize slow queries
3. **Partitioning**: Consider table partitioning for large datasets
4. **Read Replicas**: Use read replicas for analytics queries

This restructured database provides a solid foundation for the PromptCraft Forge application with improved security, performance, and maintainability.


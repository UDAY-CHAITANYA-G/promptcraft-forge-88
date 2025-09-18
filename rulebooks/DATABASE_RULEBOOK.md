# PromptCraft Forge - Database Rulebook

## 📋 **Overview**
This rulebook defines the database architecture, patterns, and standards for the PromptCraft Forge application. It ensures consistent database design, secure data access, and maintainable database operations using Supabase PostgreSQL.

---

## 🏗️ **Database Architecture**

### **Database Technology Stack**
- **Database**: PostgreSQL (via Supabase)
- **ORM/Client**: Supabase JavaScript Client
- **Authentication**: Supabase Auth
- **Security**: Row Level Security (RLS) with comprehensive policies
- **Migrations**: Organized modular schema files
- **Type Safety**: Generated TypeScript types
- **Encryption**: Configurable encryption for sensitive data
- **Performance**: Strategic indexing and optimization

### **Restructured Database Organization**
The database has been completely restructured from scattered migration files into a logical, modular, and maintainable system:

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
├── cleanup_old_migrations.sql       # Cleanup script
└── README.md                        # Database documentation
```

### **Key Architectural Improvements**
- **Logical Grouping**: Related functionality organized into modules
- **Enhanced Security**: Comprehensive RLS policies and encryption
- **Performance Optimization**: Strategic indexing and query optimization
- **Scalability**: Configurable providers and dynamic frameworks
- **Maintainability**: Reusable functions and comprehensive constraints

### **Key Features**
- **9 Prompt Frameworks**: R.O.S.E.S, A.P.E, T.A.G, E.R.A, R.A.C.E, R.I.S.E, C.A.R.E, C.O.A.S.T, T.R.A.C.E
- **3 AI Providers**: OpenAI, Gemini, Anthropic with easy expansion
- **Comprehensive Analytics**: Usage tracking, performance metrics, and reporting
- **Advanced Security**: RLS policies, encryption, and audit logging
- **Performance Optimization**: Strategic indexing, materialized views, and query optimization
- **Feedback System**: Complete feedback collection and management system
- **Template Management**: Reusable prompt templates with variables
- **Usage Tracking**: API usage monitoring and rate limiting
- **Cost Tracking**: Token usage and cost monitoring
- **Health Monitoring**: Database health checks and diagnostics

---

## 🎯 **Database Design Standards**

### **Table Design Patterns**
- **UUID Primary Keys**: Use `UUID DEFAULT gen_random_uuid() PRIMARY KEY`
- **Timestamps**: Include `created_at` and `updated_at` with timezone
- **User References**: Foreign key to `auth.users(id)` with CASCADE delete
- **Constraints**: Use CHECK constraints for enum-like values
- **Indexes**: Create indexes for frequently queried columns

```sql
-- ✅ Good: Table Design Pattern
CREATE TABLE IF NOT EXISTS public.table_name (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, some_field) -- Composite unique constraints when needed
);
```

### **Row Level Security (RLS)**
- **Enable RLS**: All tables must have RLS enabled
- **User Isolation**: Users can only access their own data
- **CRUD Policies**: Separate policies for SELECT, INSERT, UPDATE, DELETE
- **Policy Naming**: Use descriptive policy names

```sql
-- ✅ Good: RLS Pattern
ALTER TABLE public.table_name ENABLE ROW LEVEL SECURITY;

-- SELECT policy
CREATE POLICY "Users can view own data" ON public.table_name
    FOR SELECT USING (auth.uid() = user_id);

-- INSERT policy
CREATE POLICY "Users can insert own data" ON public.table_name
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- UPDATE policy
CREATE POLICY "Users can update own data" ON public.table_name
    FOR UPDATE USING (auth.uid() = user_id);

-- DELETE policy
CREATE POLICY "Users can delete own data" ON public.table_name
    FOR DELETE USING (auth.uid() = user_id);
```

### **Indexing Strategy**
- **User ID Indexes**: Create indexes on `user_id` for all user-related tables
- **Timestamp Indexes**: Index `created_at` for time-based queries
- **Composite Indexes**: Create composite indexes for common query patterns
- **Foreign Key Indexes**: Index foreign key columns

```sql
-- ✅ Good: Indexing Pattern
CREATE INDEX IF NOT EXISTS idx_table_name_user_id ON public.table_name(user_id);
CREATE INDEX IF NOT EXISTS idx_table_name_created_at ON public.table_name(created_at);
CREATE INDEX IF NOT EXISTS idx_table_name_status ON public.table_name(status);
CREATE INDEX IF NOT EXISTS idx_table_name_user_status ON public.table_name(user_id, status);
```

---

## 🔧 **Database Tables**

### **Core Table Categories**

#### **1. User Management Tables**

##### **user_profiles**
- **Purpose**: Extended user information and profile data
- **Key Features**: Display name, avatar, bio, preferences, activity tracking

```sql
-- ✅ Good: User Profiles Table
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name VARCHAR(100),
    avatar_url TEXT,
    bio TEXT,
    preferences JSONB,
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id)
);
```

##### **user_preferences**
- **Purpose**: User settings and application preferences
- **Key Features**: Model selection, framework preference, theme, notifications

```sql
-- ✅ Good: User Preferences Table
CREATE TABLE IF NOT EXISTS public.user_preferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    selected_model VARCHAR(50) NOT NULL CHECK (selected_model IN ('openai', 'gemini', 'anthropic')),
    selected_framework VARCHAR(50) NOT NULL DEFAULT 'roses' CHECK (selected_framework IN ('roses', 'ape', 'tag', 'era', 'race', 'rise', 'care', 'coast', 'trace')),
    theme VARCHAR(20) DEFAULT 'dark' CHECK (theme IN ('light', 'dark', 'system')),
    language VARCHAR(10) DEFAULT 'en',
    enable_notifications BOOLEAN DEFAULT true,
    enable_analytics BOOLEAN DEFAULT true,
    enable_history BOOLEAN DEFAULT true,
    enable_feedback BOOLEAN DEFAULT true,
    max_history_days INTEGER DEFAULT 30,
    auto_cleanup BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id)
);
```

#### **2. API Management Tables**

##### **api_providers**
- **Purpose**: AI provider configurations and capabilities
- **Key Features**: Provider metadata, rate limits, supported models, validation rules

```sql
-- ✅ Good: API Providers Table
CREATE TABLE IF NOT EXISTS public.api_providers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    base_url TEXT NOT NULL,
    api_key_pattern TEXT,
    is_enabled BOOLEAN DEFAULT true,
    max_requests_per_minute INTEGER DEFAULT 60,
    max_requests_per_day INTEGER DEFAULT 1000,
    supported_models JSONB,
    validation_rules JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

##### **api_configurations**
- **Purpose**: User API key management with encryption
- **Key Features**: Encrypted storage, validation status, usage tracking

```sql
-- ✅ Good: API Configurations Table
CREATE TABLE IF NOT EXISTS public.api_configurations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL CHECK (provider IN ('openai', 'gemini', 'anthropic')),
    api_key_encrypted TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    is_validated BOOLEAN DEFAULT false,
    last_validated_at TIMESTAMP WITH TIME ZONE,
    validation_error TEXT,
    usage_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, provider)
);
```

##### **api_usage_logs**
- **Purpose**: API usage tracking and analytics
- **Key Features**: Request/response tracking, performance metrics, error logging

```sql
-- ✅ Good: API Usage Logs Table
CREATE TABLE IF NOT EXISTS public.api_usage_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL,
    endpoint TEXT,
    request_size INTEGER,
    response_size INTEGER,
    response_time_ms INTEGER,
    status_code INTEGER,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

#### **3. Prompt Management Tables**

##### **prompt_frameworks**
- **Purpose**: Available prompt frameworks and their configurations
- **Key Features**: Framework metadata, templates, examples, configuration

```sql
-- ✅ Good: Prompt Frameworks Table
CREATE TABLE IF NOT EXISTS public.prompt_frameworks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    components JSONB NOT NULL,
    template TEXT NOT NULL,
    examples JSONB,
    is_enabled BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

##### **prompt_history**
- **Purpose**: User prompt generation history and analytics
- **Key Features**: Comprehensive tracking, performance metrics, cost tracking

```sql
-- ✅ Good: Prompt History Table
CREATE TABLE IF NOT EXISTS public.prompt_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    framework_id VARCHAR(50) NOT NULL,
    framework_name VARCHAR(100) NOT NULL,
    model VARCHAR(50) NOT NULL,
    provider VARCHAR(50) NOT NULL,
    user_input TEXT NOT NULL,
    ai_response TEXT,
    tone VARCHAR(50),
    length VARCHAR(50),
    temperature DECIMAL(3,2),
    max_tokens INTEGER,
    vibe_coding BOOLEAN DEFAULT false,
    processing_time_ms INTEGER,
    tokens_used INTEGER,
    cost_usd DECIMAL(10,6),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
    error_message TEXT,
    error_code VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

##### **prompt_templates**
- **Purpose**: Reusable prompt templates
- **Key Features**: Template management, variables, public/private templates

```sql
-- ✅ Good: Prompt Templates Table
CREATE TABLE IF NOT EXISTS public.prompt_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    framework_id VARCHAR(50) NOT NULL,
    template_content TEXT NOT NULL,
    variables JSONB,
    is_public BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

#### **4. Feedback System Tables**

##### **feedback**
- **Purpose**: User feedback and support system
- **Key Features**: Feedback categorization, admin responses, rating system

```sql
-- ✅ Good: Feedback Table
CREATE TABLE IF NOT EXISTS public.feedback (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    message TEXT NOT NULL,
    feedback_type VARCHAR(50) DEFAULT 'general' CHECK (feedback_type IN ('bug', 'feature', 'general', 'support')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    contact_email VARCHAR(255),
    contact_name VARCHAR(100),
    user_agent TEXT,
    browser_info JSONB,
    device_info JSONB,
    admin_response TEXT,
    admin_user_id UUID REFERENCES auth.users(id),
    responded_at TIMESTAMP WITH TIME ZONE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

##### **feedback_categories**
- **Purpose**: Feedback categorization system
- **Key Features**: Category management, hierarchical categories

```sql
-- ✅ Good: Feedback Categories Table
CREATE TABLE IF NOT EXISTS public.feedback_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES public.feedback_categories(id),
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

##### **feedback_tags**
- **Purpose**: Feedback tagging system
- **Key Features**: Tag management, tag relationships

```sql
-- ✅ Good: Feedback Tags Table
CREATE TABLE IF NOT EXISTS public.feedback_tags (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#3B82F6',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

##### **feedback_analytics**
- **Purpose**: Feedback metrics and trends
- **Key Features**: Analytics tracking, performance metrics

```sql
-- ✅ Good: Feedback Analytics Table
CREATE TABLE IF NOT EXISTS public.feedback_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date DATE NOT NULL,
    total_feedback INTEGER DEFAULT 0,
    resolved_feedback INTEGER DEFAULT 0,
    avg_response_time_hours DECIMAL(5,2),
    avg_rating DECIMAL(3,2),
    feedback_by_type JSONB,
    feedback_by_priority JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(date)
);
```

---

## 🔒 **Security Standards**

### **Data Encryption**
- **API Keys**: All API keys must be encrypted before storage
- **Encryption Service**: Use centralized encryption service
- **Key Management**: Encryption keys stored in environment variables

```typescript
// ✅ Good: Encryption Pattern
class ApiConfigService {
  private encryptionService = createEncryptionService();

  async saveApiConfig(provider: string, apiKey: string): Promise<boolean> {
    const encryptedKey = this.encryptionService.encrypt(apiKey);
    
    const { error } = await supabase
      .from('api_configurations')
      .insert({
        user_id: user.id,
        provider,
        api_key_encrypted: encryptedKey,
        is_active: true
      });
    
    return !error;
  }
}
```

### **Row Level Security (RLS)**
- **Mandatory**: All tables must have RLS enabled
- **User Isolation**: Users can only access their own data
- **Policy Testing**: Test RLS policies thoroughly
- **Audit Trail**: Log security policy violations

### **Input Validation**
- **Database Constraints**: Use CHECK constraints for data validation
- **Application Validation**: Validate data before database operations
- **SQL Injection Prevention**: Use parameterized queries (Supabase handles this)
- **Type Safety**: Use TypeScript types for database operations

---

## 🚀 **Database Service Patterns**

### **Service Class Pattern**
- **Singleton Pattern**: Use singleton pattern for database services
- **Error Handling**: Consistent error handling across all database operations
- **Type Safety**: Use generated TypeScript types
- **Connection Management**: Let Supabase handle connection pooling

```typescript
// ✅ Good: Database Service Pattern
class DatabaseService {
  private static instance: DatabaseService | null = null;
  
  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }
  
  private constructor() {
    // Initialize service
  }
  
  async getData(userId: string): Promise<DataType[]> {
    try {
      const { data, error } = await supabase
        .from('table_name')
        .select('*')
        .eq('user_id', userId);
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Database error:', error);
      throw error;
    }
  }
}
```

### **CRUD Operations Pattern**
- **Create**: Use `.insert()` with proper error handling
- **Read**: Use `.select()` with appropriate filters
- **Update**: Use `.update()` with WHERE conditions
- **Delete**: Use `.delete()` with proper constraints

```typescript
// ✅ Good: CRUD Operations Pattern
class UserPreferencesService {
  // Create
  async createPreferences(userId: string, preferences: PreferencesData): Promise<boolean> {
    const { error } = await supabase
      .from('user_preferences')
      .insert({
        user_id: userId,
        ...preferences
      });
    
    return !error;
  }
  
  // Read
  async getPreferences(userId: string): Promise<PreferencesData | null> {
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) return null;
    return data;
  }
  
  // Update
  async updatePreferences(userId: string, updates: Partial<PreferencesData>): Promise<boolean> {
    const { error } = await supabase
      .from('user_preferences')
      .update(updates)
      .eq('user_id', userId);
    
    return !error;
  }
  
  // Delete
  async deletePreferences(userId: string): Promise<boolean> {
    const { error } = await supabase
      .from('user_preferences')
      .delete()
      .eq('user_id', userId);
    
    return !error;
  }
}
```

### **Query Optimization**
- **Select Specific Fields**: Only select needed columns
- **Use Indexes**: Leverage database indexes for performance
- **Limit Results**: Use `.limit()` for large datasets
- **Pagination**: Implement pagination for large result sets

```typescript
// ✅ Good: Query Optimization Pattern
async getPromptHistory(userId: string, limit = 50, offset = 0): Promise<PromptHistoryEntry[]> {
  const { data, error } = await supabase
    .from('prompt_history')
    .select('id, framework_name, model, user_input, created_at, status')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  
  if (error) throw error;
  return data || [];
}
```

---

## 🚀 **Migration & Deployment**

### **Migration Strategy**
The database has been restructured from scattered migration files into a logical, modular system:

#### **For New Installations**
1. **Run the initial schema migration:**
   ```sql
   \i supabase/migrations/000_initial_schema.sql
   ```

2. **Populate with seed data:**
   ```sql
   \i supabase/migrations/001_seed_data.sql
   ```

3. **Verify the setup:**
   ```sql
   \i supabase/cleanup_old_migrations.sql
   ```

#### **For Existing Installations**
1. **Backup your data** before migration
2. **Review the migration plan** in `docs/DATABASE_STRUCTURE.md`
3. **Run migrations in order**
4. **Update your application code**
5. **Test thoroughly**

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

### **Schema File Organization**
- **01_core_functions.sql**: Core database functions and utilities
- **02_user_management.sql**: User profiles, preferences, and session tracking
- **03_api_management.sql**: API provider configurations and usage tracking
- **04_prompt_management.sql**: Prompt frameworks, history, and templates
- **05_feedback_system.sql**: Feedback collection and management system
- **06_indexes_and_performance.sql**: Performance optimization and indexing
- **07_security_and_rls.sql**: Security policies and access control
- **08_initial_data.sql**: Seed data and initial configuration

---

## 🛠️ **Maintenance & Monitoring**

### **Regular Maintenance Tasks**
```sql
-- Daily maintenance
SELECT public.daily_maintenance();

-- Analyze tables for query optimization
SELECT public.analyze_all_tables();

-- Vacuum tables for space reclamation
SELECT public.vacuum_all_tables();

-- Get database statistics
SELECT * FROM public.get_database_stats();
```

### **Performance Monitoring**
- **Query Performance**: Monitor slow queries and optimize indexes
- **Index Usage**: Track index utilization and effectiveness
- **Storage Growth**: Monitor table sizes and growth patterns
- **Connection Pooling**: Monitor database connections and performance

### **Health Checks**
```sql
-- Database health check
SELECT public.health_check();

-- Table integrity check
SELECT public.integrity_check();

-- Security audit
SELECT public.security_audit();
```

### **Cleanup Operations**
- **Old Records**: Automatic cleanup of old logs and history
- **Orphaned Data**: Cleanup of orphaned records
- **Temporary Data**: Cleanup of temporary and cache data
- **Archived Data**: Archive old data for long-term storage

---

## 📊 **Analytics & Monitoring**

### **Built-in Analytics**
- **User Activity**: Login patterns, usage statistics
- **API Usage**: Request patterns, error rates, performance
- **Prompt Analytics**: Framework usage, success rates
- **Feedback Analytics**: Response times, satisfaction ratings

### **Performance Metrics**
- **Query Performance**: Response times and optimization opportunities
- **Index Usage**: Index effectiveness and recommendations
- **Storage Metrics**: Table sizes, growth rates, and optimization
- **Connection Metrics**: Connection pooling and performance

### **Security Monitoring**
- **Access Patterns**: User access patterns and anomalies
- **Failed Attempts**: Authentication and authorization failures
- **Data Access**: Unusual data access patterns
- **Audit Logs**: Comprehensive audit trail for security events

---

## 🔧 **Configuration Management**

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
The database includes runtime configuration capabilities:
- **Application Settings**: Configurable application parameters
- **Feature Flags**: Dynamic feature enablement/disablement
- **Rate Limits**: Configurable API rate limiting
- **Maintenance Settings**: Automated maintenance configuration

---

## 📊 **Database Migration Standards**

### **Migration File Naming**
- **Timestamp Format**: `YYYYMMDDHHMMSS_description.sql`
- **Descriptive Names**: Use clear, descriptive names
- **Sequential Ordering**: Ensure migrations run in correct order

### **Migration Content**
- **Idempotent**: Migrations should be safe to run multiple times
- **Rollback Consideration**: Consider rollback scenarios
- **Data Migration**: Handle data transformations carefully
- **Testing**: Test migrations in development first

```sql
-- ✅ Good: Migration Pattern
-- Create table with proper constraints
CREATE TABLE IF NOT EXISTS public.new_table (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    -- other fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.new_table ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own data" ON public.new_table
    FOR SELECT USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_new_table_user_id ON public.new_table(user_id);

-- Create triggers
CREATE TRIGGER update_new_table_updated_at 
    BEFORE UPDATE ON public.new_table 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### **Migration Best Practices**
- [ ] **Backup First**: Always backup before running migrations
- [ ] **Test in Development**: Test migrations in development environment
- [ ] **Review Changes**: Code review all migration files
- [ ] **Document Changes**: Document what the migration does
- [ ] **Monitor Performance**: Monitor migration performance

---

## 🧪 **Database Testing**

### **Unit Testing Database Services**
```typescript
// ✅ Good: Database Service Test Pattern
describe('UserPreferencesService', () => {
  let service: UserPreferencesService;
  
  beforeEach(() => {
    service = UserPreferencesService.getInstance();
  });
  
  it('should create user preferences', async () => {
    const preferences = {
      selected_model: 'openai',
      selected_framework: 'roses'
    };
    
    const result = await service.createPreferences('user-id', preferences);
    expect(result).toBe(true);
  });
  
  it('should handle database errors gracefully', async () => {
    // Mock database error
    jest.spyOn(supabase.from, 'insert').mockRejectedValue(new Error('Database error'));
    
    const result = await service.createPreferences('user-id', {});
    expect(result).toBe(false);
  });
});
```

### **Integration Testing**
- **Database Connection**: Test database connectivity
- **RLS Policies**: Test row level security policies
- **Data Integrity**: Test constraints and relationships
- **Performance**: Test query performance

### **Migration Testing**
- **Migration Execution**: Test migration scripts
- **Rollback Testing**: Test rollback scenarios
- **Data Validation**: Validate migrated data
- **Performance Impact**: Test migration performance

---

## 📋 **Database Standards Checklist**

### **Table Design**
- [ ] **UUID Primary Keys**: Use UUID for all primary keys
- [ ] **Timestamps**: Include created_at and updated_at
- [ ] **User References**: Proper foreign key to auth.users
- [ ] **Constraints**: Use CHECK constraints for validation
- [ ] **Indexes**: Create appropriate indexes

### **Security**
- [ ] **RLS Enabled**: All tables have RLS enabled
- [ ] **User Policies**: Proper RLS policies for user isolation
- [ ] **Data Encryption**: Sensitive data is encrypted
- [ ] **Input Validation**: Validate all inputs
- [ ] **SQL Injection Prevention**: Use parameterized queries

### **Performance**
- [ ] **Indexes**: Create indexes for frequently queried columns
- [ ] **Query Optimization**: Optimize database queries
- [ ] **Connection Pooling**: Use Supabase connection pooling
- [ ] **Pagination**: Implement pagination for large datasets
- [ ] **Caching**: Implement appropriate caching strategies

### **Maintenance**
- [ ] **Migrations**: Proper migration file structure
- [ ] **Documentation**: Document database schema
- [ ] **Monitoring**: Monitor database performance
- [ ] **Backup Strategy**: Implement backup and recovery
- [ ] **Testing**: Comprehensive database testing

---

## 🚨 **Database Anti-Patterns**

### **❌ Don't Do This**
```sql
-- ❌ Bad: No RLS
CREATE TABLE public.unsafe_table (
    id SERIAL PRIMARY KEY,
    user_id UUID,
    data TEXT
);
-- No RLS policies

-- ❌ Bad: No constraints
CREATE TABLE public.unvalidated_table (
    id UUID PRIMARY KEY,
    status TEXT, -- No CHECK constraint
    user_id UUID -- No foreign key constraint
);

-- ❌ Bad: No indexes
CREATE TABLE public.slow_table (
    id UUID PRIMARY KEY,
    user_id UUID,
    created_at TIMESTAMP,
    data TEXT
);
-- No indexes on user_id or created_at
```

```typescript
// ❌ Bad: No error handling
async getData(userId: string) {
  const { data } = await supabase
    .from('table')
    .select('*')
    .eq('user_id', userId);
  
  return data; // No error handling
}

// ❌ Bad: No type safety
async saveData(data: any) {
  await supabase
    .from('table')
    .insert(data); // No type checking
}
```

### **✅ Do This Instead**
```sql
-- ✅ Good: Proper RLS
CREATE TABLE public.safe_table (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status VARCHAR(20) CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.safe_table ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own data" ON public.safe_table
    FOR SELECT USING (auth.uid() = user_id);

CREATE INDEX idx_safe_table_user_id ON public.safe_table(user_id);
```

```typescript
// ✅ Good: Proper error handling and type safety
async getData(userId: string): Promise<DataType[]> {
  try {
    const { data, error } = await supabase
      .from('table')
      .select('*')
      .eq('user_id', userId);
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Database error:', error);
    throw error;
  }
}

async saveData(data: DataType): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('table')
      .insert(data);
    
    return !error;
  } catch (error) {
    console.error('Save error:', error);
    return false;
  }
}
```

---

## 📚 **Database Resources**

### **Supabase Documentation**
- [Supabase Database Guide](https://supabase.com/docs/guides/database)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Database Migrations](https://supabase.com/docs/guides/database/migrations)
- [TypeScript Types](https://supabase.com/docs/guides/api/generating-types)

### **PostgreSQL Resources**
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [PostgreSQL Best Practices](https://wiki.postgresql.org/wiki/Don%27t_Do_This)
- [Database Design Patterns](https://www.postgresql.org/docs/current/ddl.html)

### **Security Resources**
- [Database Security Best Practices](https://owasp.org/www-project-top-ten/2017/A1_2017-Injection)
- [Row Level Security Guide](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)

---

**Last Updated**: September 18th, 2025  
**Version**: 1.0  
**Maintainer**: Development Team

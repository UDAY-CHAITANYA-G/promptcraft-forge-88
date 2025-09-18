# Supabase Database Structure

This directory contains the restructured and organized Supabase database files for PromptCraft Forge.

## 🏗️ **New Structure Overview**

The database has been completely restructured from scattered migration files into a logical, modular, and maintainable system.

### **Before (Old Structure)**
```
supabase/migrations/
├── 20250101000000_user_preferences.sql
├── 20250101000001_add_vibe_coding.sql
├── 20250101000002_prompt_history.sql
├── 20250101000003_feedback.sql
├── 20250824183127_48de65ef-9a3e-4c38-a787-2f3f28513ca2.sql
├── 20250824183209_6d95b285-c869-4f84-b4bb-bb9ec22e0517.sql
├── 20250824183243_01c5ac2b-0a58-47a7-9fba-90a7a732edd5.sql
├── 20250824183244_api_configurations.sql
├── database-setup-simple.sql
└── fix-table-structure.sql
```

### **After (New Structure)**
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
└── README.md                        # This file
```

## 🚀 **Quick Start**

### **For New Installations**
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

### **For Existing Installations**
1. **Backup your data** before migration
2. **Review the migration plan** in `docs/DATABASE_STRUCTURE.md`
3. **Run migrations in order**
4. **Update your application code**
5. **Test thoroughly**

## 📁 **File Descriptions**

### **Schema Files (`schema/`)**

#### **01_core_functions.sql**
- Core database functions used across the application
- UUID generation, authentication helpers
- Data validation and encryption functions
- Utility functions for common operations

#### **02_user_management.sql**
- User profiles and preferences tables
- User session tracking
- User-related functions and triggers
- Comprehensive user data management

#### **03_api_management.sql**
- API provider configurations
- User API key management (encrypted)
- API usage tracking and analytics
- Rate limiting and validation functions

#### **04_prompt_management.sql**
- Prompt framework definitions
- Prompt generation history
- Reusable prompt templates
- Analytics and statistics functions

#### **05_feedback_system.sql**
- User feedback and support system
- Feedback categorization and tagging
- Analytics and response tracking
- Admin response management

#### **06_indexes_and_performance.sql**
- Strategic database indexes
- Performance optimization views
- Maintenance functions
- Query optimization tools

#### **07_security_and_rls.sql**
- Row Level Security (RLS) policies
- Advanced security configurations
- Access control and permissions
- Security monitoring functions

#### **08_initial_data.sql**
- Seed data for API providers
- Default prompt frameworks
- System configuration
- Sample templates and examples

### **Migration Files (`migrations/`)**

#### **000_initial_schema.sql**
- Complete database schema creation
- All tables, functions, indexes, and policies
- Ready-to-run migration for new installations

#### **001_seed_data.sql**
- Initial data population
- API providers and frameworks
- System configuration
- Sample templates

### **Utility Files**

#### **cleanup_old_migrations.sql**
- Verification queries for new schema
- Migration status checks
- Cleanup instructions
- Success verification

## 🔧 **Key Improvements**

### **1. Organization**
- **Logical grouping** of related functionality
- **Clear naming conventions** for all objects
- **Modular structure** for easy maintenance
- **Comprehensive documentation**

### **2. Security**
- **Enhanced RLS policies** with proper user isolation
- **Encrypted API keys** with configurable encryption
- **Comprehensive access control** and permissions
- **Security monitoring** and audit logging

### **3. Performance**
- **Strategic indexing** for optimal query performance
- **Composite indexes** for complex queries
- **Partial indexes** for filtered data
- **Full-text search** capabilities

### **4. Scalability**
- **Configurable providers** - Easy to add new AI providers
- **Dynamic frameworks** - Configurable prompt frameworks
- **Usage tracking** - Comprehensive analytics
- **Rate limiting** - Built-in API rate limiting

### **5. Maintainability**
- **Reusable functions** for common operations
- **Comprehensive constraints** and validations
- **Automatic cleanup** of old records
- **Health monitoring** and diagnostics

## 📊 **Database Schema Overview**

### **Core Tables**
- **User Management**: `user_profiles`, `user_preferences`, `user_sessions`
- **API Management**: `api_providers`, `api_configurations`, `api_usage_logs`
- **Prompt Management**: `prompt_frameworks`, `prompt_history`, `prompt_templates`
- **Feedback System**: `feedback`, `feedback_categories`, `feedback_tags`, `feedback_analytics`

### **Key Features**
- **9 prompt frameworks** (R.O.S.E.S, A.P.E, T.A.G, E.R.A, R.A.C.E, R.I.S.E, C.A.R.E, C.O.A.S.T, T.R.A.C.E)
- **3 AI providers** (OpenAI, Gemini, Anthropic) with easy expansion
- **Comprehensive analytics** and usage tracking
- **Advanced security** with RLS and encryption
- **Performance optimization** with strategic indexing

## 🔐 **Security Features**

### **Row Level Security (RLS)**
- Users can only access their own data
- Admins have appropriate access levels
- Public resources are properly configured
- System functions have necessary permissions

### **Data Encryption**
- API keys are encrypted before storage
- Configurable encryption for sensitive data
- Environment-based encryption keys
- Secure key management

### **Access Control**
- Authentication required for most operations
- Comprehensive permission validation
- Audit logging for security events
- Suspicious activity detection

## 📈 **Performance Features**

### **Indexing Strategy**
- Primary indexes on all keys
- Composite indexes for common queries
- Partial indexes for filtered data
- Full-text search indexes

### **Query Optimization**
- Materialized views for complex analytics
- Function-based indexes
- Covering indexes to avoid lookups
- Regular statistics updates

### **Maintenance**
- Automatic cleanup of old records
- Regular vacuum and analyze operations
- Performance monitoring
- Health checks and diagnostics

## 🛠️ **Maintenance**

### **Regular Tasks**
```sql
-- Daily maintenance
SELECT public.daily_maintenance();

-- Analyze tables
SELECT public.analyze_all_tables();

-- Get database statistics
SELECT * FROM public.get_database_stats();
```

### **Monitoring**
- Database health checks
- Performance metrics
- Security monitoring
- Data integrity validation

## 📚 **Documentation**

- **`docs/DATABASE_STRUCTURE.md`** - Comprehensive database documentation
- **`docs/CONFIGURATION_IMPROVEMENTS.md`** - Application configuration improvements
- **Inline comments** in all SQL files
- **Function documentation** with usage examples

## 🚨 **Migration Notes**

### **Breaking Changes**
- Table structure changes require application code updates
- New column names and constraints
- Enhanced security policies
- New function signatures

### **Compatibility**
- Maintains core functionality
- Enhanced features and capabilities
- Better performance and security
- Improved maintainability

## 🔄 **Next Steps**

1. **Review the new structure** in `docs/DATABASE_STRUCTURE.md`
2. **Plan your migration** strategy
3. **Update application code** to use new structure
4. **Test thoroughly** before production deployment
5. **Monitor performance** and security
6. **Regular maintenance** and updates

## 📞 **Support**

For questions or issues with the database structure:
1. Check the documentation in `docs/`
2. Review the inline comments in SQL files
3. Use the verification queries in `cleanup_old_migrations.sql`
4. Test with the provided sample data

---

**Note**: This restructured database provides a solid foundation for the PromptCraft Forge application with improved security, performance, and maintainability. Always backup your data before making changes and test thoroughly in a development environment first.

// Database Verification Script
// Run this to check if your database is properly set up

import { createClient } from '@supabase/supabase-js';

// Your Supabase credentials (from src/integrations/supabase/client.ts)
const supabaseUrl = "https://slvjvjwrkesjfzxcygdp.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNsdmp2andya2VzamZ6eGN5Z2RwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwNTk0NTIsImV4cCI6MjA3MTYzNTQ1Mn0.wz2dDrmu8yZCWxHmbxERmQzBa6Ll8e35YlYlQfGo7Nc";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verifyDatabase() {
  console.log('🔍 Verifying database connection and setup...\n');
  
  try {
    // Test 1: Basic connection
    console.log('1️⃣ Testing basic connection...');
    const { data: testData, error: testError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('❌ Basic connection failed:', testError.message);
      return;
    }
    
    console.log('✅ Basic connection successful\n');
    
    // Test 2: Check if prompt_history table exists
    console.log('2️⃣ Checking if prompt_history table exists...');
    const { data: tableCheck, error: tableError } = await supabase
      .from('prompt_history')
      .select('count')
      .limit(1);
    
    if (tableError) {
      console.error('❌ prompt_history table does not exist or is not accessible');
      console.error('Error details:', tableError.message);
      console.log('\n💡 You need to run the database migration first!');
      console.log('📋 Copy the contents of database-setup-simple.sql and run it in your Supabase SQL Editor');
      return;
    }
    
    console.log('✅ prompt_history table exists and is accessible\n');
    
    // Test 3: Check table structure
    console.log('3️⃣ Checking table structure...');
    const { data: structure, error: structureError } = await supabase
      .from('prompt_history')
      .select('*')
      .limit(0);
    
    if (structureError) {
      console.error('❌ Error checking table structure:', structureError.message);
    } else {
      console.log('✅ Table structure is accessible');
      console.log('📊 Columns available:', Object.keys(structure || {}));
    }
    
    // Test 4: Check RLS policies
    console.log('\n4️⃣ Testing Row Level Security...');
    console.log('ℹ️  This test requires authentication to work properly');
    
    // Test 5: Try to get current user
    console.log('\n5️⃣ Checking authentication status...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.log('ℹ️  No authenticated user (this is normal for testing)');
    } else if (user) {
      console.log('✅ User authenticated:', user.id);
      
      // Test 6: Try authenticated operations
      console.log('\n6️⃣ Testing authenticated operations...');
      const { data: authData, error: authOpError } = await supabase
        .from('prompt_history')
        .select('*')
        .eq('user_id', user.id)
        .limit(1);
      
      if (authOpError) {
        console.error('❌ Authenticated operation failed:', authOpError.message);
        console.log('💡 This might indicate RLS policy issues');
      } else {
        console.log('✅ Authenticated operations working');
        console.log('📊 User has', authData?.length || 0, 'history entries');
      }
    }
    
    console.log('\n🎯 Database verification complete!');
    console.log('📋 If you see any ❌ errors above, you need to:');
    console.log('   1. Run the database migration (database-setup-simple.sql)');
    console.log('   2. Check your Supabase project settings');
    console.log('   3. Verify RLS policies are enabled');
    
  } catch (error) {
    console.error('❌ Unexpected error during verification:', error);
  }
}

// Run the verification
verifyDatabase();

// Test Database Connection
// Run this with: node test-database-connection.js

const { createClient } = require('@supabase/supabase-js');

// You'll need to add your Supabase URL and anon key here
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  console.log('🔍 Testing database connection...');
  
  try {
    // Test 1: Basic connection
    console.log('1. Testing basic connection...');
    const { data, error } = await supabase
      .from('prompt_history')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Connection failed:', error);
      return;
    }
    
    console.log('✅ Basic connection successful');
    
    // Test 2: Check if table exists and has correct structure
    console.log('2. Checking table structure...');
    const { data: tableInfo, error: tableError } = await supabase
      .rpc('get_table_info', { table_name: 'prompt_history' });
    
    if (tableError) {
      console.log('ℹ️  Table info RPC not available, trying direct query...');
      
      // Try to get table info directly
      const { data: columns, error: columnsError } = await supabase
        .from('prompt_history')
        .select('*')
        .limit(0);
      
      if (columnsError) {
        console.error('❌ Table structure check failed:', columnsError);
        console.log('💡 This might mean the table doesn\'t exist or you don\'t have access');
      } else {
        console.log('✅ Table exists and is accessible');
      }
    } else {
      console.log('✅ Table structure:', tableInfo);
    }
    
    // Test 3: Try to insert a test record
    console.log('3. Testing insert operation...');
    const testData = {
      user_id: '00000000-0000-0000-0000-000000000000', // dummy UUID
      framework_id: 'test-framework',
      framework_name: 'Test Framework',
      model: 'test-model',
      user_input: 'Test input for connection test',
      ai_response: 'Test response for connection test',
      tone: 'professional',
      length: 'medium',
      vibe_coding: false,
      status: 'completed'
    };
    
    const { data: insertResult, error: insertError } = await supabase
      .from('prompt_history')
      .insert(testData)
      .select();
    
    if (insertError) {
      console.error('❌ Insert test failed:', insertError);
      console.log('💡 This might be due to RLS policies or missing permissions');
    } else {
      console.log('✅ Insert test successful:', insertResult);
      
      // Clean up test data
      console.log('4. Cleaning up test data...');
      const { error: deleteError } = await supabase
        .from('prompt_history')
        .delete()
        .eq('id', insertResult[0].id);
      
      if (deleteError) {
        console.error('❌ Cleanup failed:', deleteError);
      } else {
        console.log('✅ Test data cleaned up successfully');
      }
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the test
testConnection();

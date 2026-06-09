// Quick test to check Supabase connection
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://gvbztpfyajtdatnmmjtx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2Ynp0cGZ5YWp0ZGF0bm1tanR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwMTUzNjEsImV4cCI6MjA5NjU5MTM2MX0.TjUZoX6rCMFcC3P90TiWBZyhFu5IsR-DbPIGOfyY9xo';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('Testing Supabase connection...');
console.log('URL:', SUPABASE_URL);
console.log('Key (first 20 chars):', SUPABASE_ANON_KEY.substring(0, 20) + '...');

// Test 1: Check if we can query the profiles table
async function testConnection() {
    try {
        console.log('\n1. Testing database connection...');
        const { data, error } = await supabase.from('profiles').select('count').limit(1);

        if (error) {
            console.error('❌ Database query failed:', error.message);
            console.error('This likely means the database tables have not been created yet.');
            console.error('Please run CAMPUS_COMFORT_SETUP.sql in your Supabase SQL Editor.');
        } else {
            console.log('✅ Database connection successful!');
            console.log('Profiles table exists and is accessible.');
        }
    } catch (err) {
        console.error('❌ Connection test failed:', err.message);
    }

    // Test 2: Try to sign up
    try {
        console.log('\n2. Testing signup...');
        const { data, error } = await supabase.auth.signUp({
            email: 'test@example.com',
            password: 'testpassword123'
        });

        if (error) {
            console.error('❌ Signup failed:', error.message);
            if (error.message.includes('Invalid API key')) {
                console.error('The API key is invalid or the project URL is wrong.');
            }
        } else {
            console.log('✅ Signup test successful!');
            console.log('User created:', data.user?.email);
        }
    } catch (err) {
        console.error('❌ Signup test failed:', err.message);
    }
}

testConnection();

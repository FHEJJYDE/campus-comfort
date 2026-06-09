// Check which tables exist in Supabase
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://gvbztpfyajtdatnmmjtx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2Ynp0cGZ5YWp0ZGF0bm1tanR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwMTUzNjEsImV4cCI6MjA5NjU5MTM2MX0.TjUZoX6rCMFcC3P90TiWBZyhFu5IsR-DbPIGOfyY9xo';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkTables() {
    console.log('Checking which tables exist...\n');

    const tablesToCheck = [
        'profiles',
        'properties',
        'universities',
        'testimonials',
        'admin_settings',
        'system_settings',
        'exchange_rates',
        'supported_currencies',
        'property_inquiries',
        'property_favorites',
        'property_views',
        'property_viewings'
    ];

    for (const table of tablesToCheck) {
        try {
            const { data, error } = await supabase.from(table).select('*').limit(1);

            if (error) {
                console.log(`❌ ${table}: ${error.message}`);
            } else {
                console.log(`✅ ${table}: EXISTS (${data?.length || 0} rows found)`);
            }
        } catch (err) {
            console.log(`❌ ${table}: ${err.message}`);
        }
    }
}

checkTables();

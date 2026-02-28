-- =====================================================
-- ADD MISSING TABLES FOR CAMPUS COMFORT
-- =====================================================
-- Run this to add the missing admin_settings and exchange_rates tables
-- =====================================================

-- Admin settings table (separate from system_settings for admin-specific config)
CREATE TABLE IF NOT EXISTS admin_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key VARCHAR(255) UNIQUE NOT NULL,
    setting_value TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Exchange rates table for currency conversion
CREATE TABLE IF NOT EXISTS exchange_rates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rates JSONB NOT NULL,
    source VARCHAR(50) DEFAULT 'manual',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_admin_settings_key ON admin_settings(setting_key);
CREATE INDEX IF NOT EXISTS idx_exchange_rates_updated_at ON exchange_rates(updated_at DESC);

-- Enable RLS
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE exchange_rates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for admin_settings
CREATE POLICY "Anyone can view admin settings" ON admin_settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage admin settings" ON admin_settings FOR ALL USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.user_type = 'admin'
    )
);

-- RLS Policies for exchange_rates
CREATE POLICY "Anyone can view exchange rates" ON exchange_rates FOR SELECT USING (true);
CREATE POLICY "Admins can manage exchange rates" ON exchange_rates FOR ALL USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.user_type = 'admin'
    )
);

-- Insert default admin settings
INSERT INTO admin_settings (setting_key, setting_value, description) VALUES
    ('default_currency', 'USD', 'Default currency for the platform')
ON CONFLICT (setting_key) DO NOTHING;

-- Insert initial exchange rates (mock data)
INSERT INTO exchange_rates (rates, source) VALUES
    ('{
        "USD": 1.0,
        "EUR": 0.85,
        "GBP": 0.73,
        "CAD": 1.25,
        "AUD": 1.35
    }'::jsonb, 'manual')
ON CONFLICT DO NOTHING;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '=====================================================';
    RAISE NOTICE '✅ MISSING TABLES ADDED SUCCESSFULLY!';
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'Created:';
    RAISE NOTICE '- admin_settings table';
    RAISE NOTICE '- exchange_rates table';
    RAISE NOTICE '- RLS policies';
    RAISE NOTICE '- Initial data';
    RAISE NOTICE '=====================================================';
END $$;

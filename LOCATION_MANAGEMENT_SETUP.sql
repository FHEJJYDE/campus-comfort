-- =====================================================
-- LOCATION MANAGEMENT SYSTEM
-- =====================================================
-- This creates tables for managing locations and prime locations
-- with image support via Supabase Storage
-- =====================================================

-- Locations table
CREATE TABLE IF NOT EXISTS locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    slug VARCHAR(255) NOT NULL UNIQUE,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(50) NOT NULL,
    country VARCHAR(50) DEFAULT 'Nigeria',
    description TEXT,
    image_url TEXT,
    is_prime BOOLEAN DEFAULT FALSE,
    display_order INTEGER DEFAULT 0,
    property_count INTEGER DEFAULT 0,
    average_price DECIMAL(12,2),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_locations_is_prime ON locations(is_prime) WHERE is_prime = TRUE;
CREATE INDEX IF NOT EXISTS idx_locations_is_active ON locations(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_locations_display_order ON locations(display_order);
CREATE INDEX IF NOT EXISTS idx_locations_city ON locations(city);
CREATE INDEX IF NOT EXISTS idx_locations_state ON locations(state);

-- Function to generate slug from name
CREATE OR REPLACE FUNCTION generate_location_slug()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
        NEW.slug := lower(regexp_replace(NEW.name, '[^a-zA-Z0-9]+', '-', 'g'));
        NEW.slug := trim(both '-' from NEW.slug);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate slug
DROP TRIGGER IF EXISTS trigger_generate_location_slug ON locations;
CREATE TRIGGER trigger_generate_location_slug
    BEFORE INSERT OR UPDATE ON locations
    FOR EACH ROW
    EXECUTE FUNCTION generate_location_slug();

-- Function to update location property count
CREATE OR REPLACE FUNCTION update_location_property_count()
RETURNS TRIGGER AS $$
BEGIN
    -- Update property count for the location
    UPDATE locations
    SET property_count = (
        SELECT COUNT(*)
        FROM properties
        WHERE city = locations.city
        AND state = locations.state
        AND status IN ('available', 'pending')
    ),
    average_price = (
        SELECT AVG(price)
        FROM properties
        WHERE city = locations.city
        AND state = locations.state
        AND status IN ('available', 'pending')
    ),
    updated_at = NOW()
    WHERE city = COALESCE(NEW.city, OLD.city)
    AND state = COALESCE(NEW.state, OLD.state);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update location stats when properties change
DROP TRIGGER IF EXISTS trigger_update_location_stats ON properties;
CREATE TRIGGER trigger_update_location_stats
    AFTER INSERT OR UPDATE OR DELETE ON properties
    FOR EACH ROW
    EXECUTE FUNCTION update_location_property_count();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_locations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
DROP TRIGGER IF EXISTS trigger_locations_updated_at ON locations;
CREATE TRIGGER trigger_locations_updated_at
    BEFORE UPDATE ON locations
    FOR EACH ROW
    EXECUTE FUNCTION update_locations_updated_at();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

-- Public can view active locations
CREATE POLICY "Public can view active locations"
    ON locations FOR SELECT
    USING (is_active = TRUE);

-- Admins can do everything
CREATE POLICY "Admins can manage locations"
    ON locations FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.user_type = 'admin'
        )
    );

-- =====================================================
-- STORAGE BUCKET FOR LOCATION IMAGES
-- =====================================================

-- Create storage bucket for location images (if not exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('location-images', 'location-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for location images
CREATE POLICY "Public can view location images"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'location-images');

CREATE POLICY "Admins can upload location images"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'location-images'
        AND EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.user_type = 'admin'
        )
    );

CREATE POLICY "Admins can update location images"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'location-images'
        AND EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.user_type = 'admin'
        )
    );

CREATE POLICY "Admins can delete location images"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'location-images'
        AND EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.user_type = 'admin'
        )
    );

-- =====================================================
-- SEED DATA - Popular Nigerian Cities
-- =====================================================

INSERT INTO locations (name, city, state, country, description, is_prime, display_order, is_active) VALUES
    ('Lagos Island', 'Lagos', 'Lagos', 'Nigeria', 'The commercial heart of Lagos with premium properties and waterfront views', TRUE, 1, TRUE),
    ('Lekki', 'Lagos', 'Lagos', 'Nigeria', 'Upscale residential area with modern amenities and beach access', TRUE, 2, TRUE),
    ('Victoria Island', 'Lagos', 'Lagos', 'Nigeria', 'Prime business district with luxury apartments and penthouses', TRUE, 3, TRUE),
    ('Ikoyi', 'Lagos', 'Lagos', 'Nigeria', 'Exclusive neighborhood known for high-end properties', TRUE, 4, TRUE),
    ('Abuja Central', 'Abuja', 'FCT', 'Nigeria', 'The capital city center with government buildings and embassies', TRUE, 5, TRUE),
    ('Maitama', 'Abuja', 'FCT', 'Nigeria', 'Prestigious district with diplomatic residences', TRUE, 6, TRUE),
    
    ('Ikeja', 'Lagos', 'Lagos', 'Nigeria', 'Lagos state capital with commercial and residential properties', FALSE, 7, TRUE),
    ('Surulere', 'Lagos', 'Lagos', 'Nigeria', 'Vibrant neighborhood with diverse housing options', FALSE, 8, TRUE),
    ('Yaba', 'Lagos', 'Lagos', 'Nigeria', 'Tech hub with affordable student housing', FALSE, 9, TRUE),
    ('Ajah', 'Lagos', 'Lagos', 'Nigeria', 'Rapidly developing area with new estates', FALSE, 10, TRUE),
    
    ('Wuse', 'Abuja', 'FCT', 'Nigeria', 'Commercial district with shopping and business centers', FALSE, 11, TRUE),
    ('Garki', 'Abuja', 'FCT', 'Nigeria', 'Residential area with government quarters', FALSE, 12, TRUE),
    ('Gwarinpa', 'Abuja', 'FCT', 'Nigeria', 'Largest estate in West Africa', FALSE, 13, TRUE),
    
    ('GRA', 'Port Harcourt', 'Rivers', 'Nigeria', 'Government Reserved Area with premium properties', FALSE, 14, TRUE),
    ('Trans Amadi', 'Port Harcourt', 'Rivers', 'Nigeria', 'Industrial and residential area', FALSE, 15, TRUE),
    
    ('Bodija', 'Ibadan', 'Oyo', 'Nigeria', 'Upscale residential area', FALSE, 16, TRUE),
    ('Jericho', 'Ibadan', 'Oyo', 'Nigeria', 'Modern residential estate', FALSE, 17, TRUE),
    
    ('Independence Layout', 'Enugu', 'Enugu', 'Nigeria', 'Prime residential area', FALSE, 18, TRUE),
    ('GRA', 'Enugu', 'Enugu', 'Nigeria', 'Government Reserved Area', FALSE, 19, TRUE),
    
    ('Asokoro', 'Abuja', 'FCT', 'Nigeria', 'Elite residential district', FALSE, 20, TRUE)
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- HELPFUL QUERIES
-- =====================================================

-- Get all prime locations
-- SELECT * FROM locations WHERE is_prime = TRUE ORDER BY display_order;

-- Get locations with property counts
-- SELECT name, city, state, property_count, average_price, is_prime 
-- FROM locations 
-- WHERE is_active = TRUE 
-- ORDER BY display_order;

-- Update location to prime
-- UPDATE locations SET is_prime = TRUE, display_order = 1 WHERE id = 'location-id';

-- Add image to location
-- UPDATE locations SET image_url = 'https://your-supabase-url/storage/v1/object/public/location-images/filename.jpg' WHERE id = 'location-id';

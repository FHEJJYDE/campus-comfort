-- =====================================================
-- CAMPUS COMFORT DATABASE SETUP
-- =====================================================
-- This file contains everything needed to set up the database in one go:
-- 1. Complete table structure with all tables
-- 2. Performance indexes for all tables
-- 3. Improved triggers for user profile creation
-- 4. Fixed RLS policies without recursion
-- 5. Storage bucket configuration with proper policies
-- 6. Essential configuration data
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- CORE TABLES
-- =====================================================

-- Users profiles table (linked to auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    user_type VARCHAR(20) DEFAULT 'user' CHECK (user_type IN ('admin', 'user')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    phone VARCHAR(20),
    avatar_url TEXT,
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Properties table
CREATE TABLE IF NOT EXISTS properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(12,2) NOT NULL,
    property_type VARCHAR(50) NOT NULL CHECK (property_type IN ('house', 'apartment', 'condo', 'townhouse', 'land', 'commercial')),
    status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'pending', 'sold', 'rented', 'withdrawn', 'rejected')),
    bedrooms INTEGER,
    bathrooms DECIMAL(3,1),
    square_feet INTEGER,
    lot_size DECIMAL(10,2),
    year_built INTEGER,
    address TEXT NOT NULL,
    street TEXT,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(50) NOT NULL,
    zip_code VARCHAR(20) NOT NULL,
    country VARCHAR(50) DEFAULT 'USA',
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    images TEXT[], -- Array of image URLs
    features TEXT[], -- Array of property features
    amenities TEXT[], -- Array of amenities
    virtual_tour_url TEXT,
    is_featured BOOLEAN DEFAULT FALSE,
    views_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Property inquiries table
CREATE TABLE IF NOT EXISTS property_inquiries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    message TEXT,
    inquiry_type VARCHAR(50) DEFAULT 'general' CHECK (inquiry_type IN ('general', 'viewing', 'purchase', 'rental')),
    status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'scheduled', 'completed', 'closed')),
    preferred_contact VARCHAR(20) DEFAULT 'email' CHECK (preferred_contact IN ('email', 'phone', 'both')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Testimonials table
CREATE TABLE IF NOT EXISTS testimonials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    is_approved BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Blog posts table
CREATE TABLE IF NOT EXISTS blog_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    excerpt TEXT,
    content TEXT NOT NULL,
    featured_image TEXT,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    category VARCHAR(100),
    tags TEXT[], -- Array of tags
    meta_description TEXT,
    is_featured BOOLEAN DEFAULT FALSE,
    views_count INTEGER DEFAULT 0,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Newsletter subscribers table
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed', 'bounced')),
    subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    unsubscribed_at TIMESTAMP WITH TIME ZONE,
    source VARCHAR(100) DEFAULT 'website'
);

-- Contact messages table
CREATE TABLE IF NOT EXISTS contact_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    subject VARCHAR(255),
    message TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'archived')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System settings table
CREATE TABLE IF NOT EXISTS system_settings (
    key VARCHAR(255) PRIMARY KEY,
    value JSONB,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Property favorites (user saved properties)
CREATE TABLE IF NOT EXISTS property_favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, property_id)
);

-- Property views tracking
CREATE TABLE IF NOT EXISTS property_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    ip_address INET,
    user_agent TEXT,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Supported currencies table
CREATE TABLE IF NOT EXISTS supported_currencies (
    code VARCHAR(3) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    symbol VARCHAR(10) NOT NULL,
    exchange_rate DECIMAL(10,6) DEFAULT 1.0,
    is_default BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User/Agent individual settings table
CREATE TABLE IF NOT EXISTS user_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    setting_key VARCHAR(255) NOT NULL,
    setting_value JSONB,
    category VARCHAR(100) DEFAULT 'general' CHECK (category IN ('general', 'notifications', 'privacy', 'preferences', 'appearance')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, setting_key)
);

-- KYC verification documents table
CREATE TABLE IF NOT EXISTS kyc_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL CHECK (document_type IN ('passport', 'national_id', 'drivers_license', 'utility_bill', 'bank_statement', 'tax_document', 'business_license')),
    document_number VARCHAR(255),
    document_url TEXT NOT NULL, -- Supabase Storage URL
    verification_status VARCHAR(20) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected', 'expired')),
    verified_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    verified_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    expiry_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Revenue tracking table
CREATE TABLE IF NOT EXISTS revenue_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
    agent_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    transaction_type VARCHAR(50) NOT NULL CHECK (transaction_type IN ('sale', 'rental', 'commission', 'referral', 'subscription', 'listing_fee')),
    amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD' REFERENCES supported_currencies(code),
    commission_rate DECIMAL(5,2), -- Percentage
    commission_amount DECIMAL(12,2),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled', 'refunded')),
    payment_method VARCHAR(50),
    payment_reference VARCHAR(255),
    description TEXT,
    transaction_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    due_date TIMESTAMP WITH TIME ZONE,
    paid_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agent commission structures
CREATE TABLE IF NOT EXISTS agent_commissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    commission_type VARCHAR(50) NOT NULL CHECK (commission_type IN ('flat_rate', 'percentage', 'tiered', 'custom')),
    base_rate DECIMAL(5,2), -- Base percentage or flat amount
    tier_structure JSONB, -- For tiered commissions
    property_type VARCHAR(50), -- Optional: specific to property type
    min_property_value DECIMAL(12,2),
    max_property_value DECIMAL(12,2),
    is_active BOOLEAN DEFAULT TRUE,
    effective_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    effective_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Property transactions/sales history
CREATE TABLE IF NOT EXISTS property_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    buyer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    seller_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    agent_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('sale', 'rental', 'lease')),
    price DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD' REFERENCES supported_currencies(code),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    contract_date TIMESTAMP WITH TIME ZONE,
    closing_date TIMESTAMP WITH TIME ZONE,
    commission_amount DECIMAL(12,2),
    financing_type VARCHAR(50), -- cash, mortgage, etc.
    notes TEXT,
    documents JSONB, -- Array of document URLs
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error', 'system')),
    category VARCHAR(100) DEFAULT 'general' CHECK (category IN ('general', 'property', 'transaction', 'kyc', 'payment', 'system')),
    is_read BOOLEAN DEFAULT FALSE,
    action_url TEXT,
    metadata JSONB,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit log table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(100),
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscription plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD' REFERENCES supported_currencies(code),
    billing_cycle VARCHAR(20) NOT NULL CHECK (billing_cycle IN ('monthly', 'quarterly', 'yearly')),
    features JSONB, -- Array of feature names
    max_properties INTEGER,
    max_featured_properties INTEGER,
    max_images_per_property INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User subscriptions table
CREATE TABLE IF NOT EXISTS user_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES subscription_plans(id) ON DELETE RESTRICT,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'suspended')),
    current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    trial_start TIMESTAMP WITH TIME ZONE,
    trial_end TIMESTAMP WITH TIME ZONE,
    payment_method VARCHAR(50),
    stripe_subscription_id VARCHAR(255), -- If using Stripe
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Property documents table (contracts, disclosures, etc.)
CREATE TABLE IF NOT EXISTS property_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    document_type VARCHAR(100) NOT NULL CHECK (document_type IN ('contract', 'disclosure', 'inspection', 'appraisal', 'title', 'insurance', 'other')),
    document_name VARCHAR(255) NOT NULL,
    document_url TEXT NOT NULL, -- Supabase Storage URL
    file_size INTEGER,
    mime_type VARCHAR(100),
    uploaded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Saved searches table
CREATE TABLE IF NOT EXISTS saved_searches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    search_name VARCHAR(255) NOT NULL,
    search_criteria JSONB NOT NULL, -- Store search filters as JSON
    is_alert_enabled BOOLEAN DEFAULT FALSE,
    alert_frequency VARCHAR(20) DEFAULT 'daily' CHECK (alert_frequency IN ('immediate', 'daily', 'weekly')),
    last_alerted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Search history table
CREATE TABLE IF NOT EXISTS search_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    search_query TEXT NOT NULL,
    search_filters JSONB, -- Store the filters used in the search
    results_count INTEGER DEFAULT 0,
    searched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Property comparisons table
CREATE TABLE IF NOT EXISTS property_comparisons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    comparison_name VARCHAR(255),
    property_ids UUID[] NOT NULL, -- Array of property IDs
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Conversations table
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title VARCHAR(255),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'closed', 'archived')),
    last_message_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    sender_type VARCHAR(10) NOT NULL CHECK (sender_type IN ('user', 'admin')),
    message_text TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'document', 'property_link')),
    file_url TEXT,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Property Applications table
CREATE TABLE IF NOT EXISTS property_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    application_type VARCHAR(20) NOT NULL CHECK (application_type IN ('rental', 'purchase')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'declined', 'withdrawn', 'completed')),
    applicant_name VARCHAR(255) NOT NULL,
    applicant_email VARCHAR(255) NOT NULL,
    applicant_phone VARCHAR(20),
    message TEXT,
    submitted_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    decision_date TIMESTAMP WITH TIME ZONE,
    decision_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Property viewings table for scheduled property viewings/appointments
CREATE TABLE IF NOT EXISTS property_viewings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    viewing_date TIMESTAMP WITH TIME ZONE NOT NULL,
    viewing_type VARCHAR(20) DEFAULT 'in_person' CHECK (viewing_type IN ('in_person', 'virtual', 'group')),
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'rescheduled')),
    duration_minutes INTEGER DEFAULT 60,
    notes TEXT,
    attendees_count INTEGER DEFAULT 1,
    meeting_link TEXT,
    reminder_sent BOOLEAN DEFAULT FALSE,
    user_notes TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON profiles(user_type);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON profiles(status);

-- Properties indexes
CREATE INDEX IF NOT EXISTS idx_properties_owner_id ON properties(owner_id);
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_property_type ON properties(property_type);
CREATE INDEX IF NOT EXISTS idx_properties_price ON properties(price);
CREATE INDEX IF NOT EXISTS idx_properties_city ON properties(city);
CREATE INDEX IF NOT EXISTS idx_properties_state ON properties(state);
CREATE INDEX IF NOT EXISTS idx_properties_created_at ON properties(created_at);
CREATE INDEX IF NOT EXISTS idx_properties_is_featured ON properties(is_featured);

-- Property inquiries indexes
CREATE INDEX IF NOT EXISTS idx_property_inquiries_property_id ON property_inquiries(property_id);
CREATE INDEX IF NOT EXISTS idx_property_inquiries_user_id ON property_inquiries(user_id);
CREATE INDEX IF NOT EXISTS idx_property_inquiries_status ON property_inquiries(status);
CREATE INDEX IF NOT EXISTS idx_property_inquiries_created_at ON property_inquiries(created_at);

-- Testimonials indexes
CREATE INDEX IF NOT EXISTS idx_testimonials_user_id ON testimonials(user_id);
CREATE INDEX IF NOT EXISTS idx_testimonials_property_id ON testimonials(property_id);
CREATE INDEX IF NOT EXISTS idx_testimonials_is_approved ON testimonials(is_approved);
CREATE INDEX IF NOT EXISTS idx_testimonials_is_featured ON testimonials(is_featured);

-- Blog posts indexes
CREATE INDEX IF NOT EXISTS idx_blog_posts_author_id ON blog_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts(published_at);
CREATE INDEX IF NOT EXISTS idx_blog_posts_is_featured ON blog_posts(is_featured);

-- Property favorites indexes
CREATE INDEX IF NOT EXISTS idx_property_favorites_user_id ON property_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_property_favorites_property_id ON property_favorites(property_id);

-- Property views indexes
CREATE INDEX IF NOT EXISTS idx_property_views_property_id ON property_views(property_id);
CREATE INDEX IF NOT EXISTS idx_property_views_user_id ON property_views(user_id);
CREATE INDEX IF NOT EXISTS idx_property_views_viewed_at ON property_views(viewed_at);

-- User settings indexes
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_settings_category ON user_settings(category);

-- KYC documents indexes
CREATE INDEX IF NOT EXISTS idx_kyc_documents_user_id ON kyc_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_kyc_documents_status ON kyc_documents(verification_status);
CREATE INDEX IF NOT EXISTS idx_kyc_documents_type ON kyc_documents(document_type);

-- Revenue records indexes
CREATE INDEX IF NOT EXISTS idx_revenue_records_agent_id ON revenue_records(agent_id);
CREATE INDEX IF NOT EXISTS idx_revenue_records_property_id ON revenue_records(property_id);
CREATE INDEX IF NOT EXISTS idx_revenue_records_transaction_type ON revenue_records(transaction_type);
CREATE INDEX IF NOT EXISTS idx_revenue_records_status ON revenue_records(status);
CREATE INDEX IF NOT EXISTS idx_revenue_records_transaction_date ON revenue_records(transaction_date);

-- Agent commissions indexes
CREATE INDEX IF NOT EXISTS idx_agent_commissions_agent_id ON agent_commissions(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_commissions_is_active ON agent_commissions(is_active);

-- Property transactions indexes
CREATE INDEX IF NOT EXISTS idx_property_transactions_property_id ON property_transactions(property_id);
CREATE INDEX IF NOT EXISTS idx_property_transactions_agent_id ON property_transactions(agent_id);
CREATE INDEX IF NOT EXISTS idx_property_transactions_buyer_id ON property_transactions(buyer_id);
CREATE INDEX IF NOT EXISTS idx_property_transactions_status ON property_transactions(status);
CREATE INDEX IF NOT EXISTS idx_property_transactions_closing_date ON property_transactions(closing_date);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- Audit logs indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- Subscription plans indexes
CREATE INDEX IF NOT EXISTS idx_subscription_plans_is_active ON subscription_plans(is_active);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_sort_order ON subscription_plans(sort_order);

-- User subscriptions indexes
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_plan_id ON user_subscriptions(plan_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_current_period_end ON user_subscriptions(current_period_end);

-- Property documents indexes
CREATE INDEX IF NOT EXISTS idx_property_documents_property_id ON property_documents(property_id);
CREATE INDEX IF NOT EXISTS idx_property_documents_document_type ON property_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_property_documents_uploaded_by ON property_documents(uploaded_by);

-- Saved searches indexes
CREATE INDEX IF NOT EXISTS idx_saved_searches_user_id ON saved_searches(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_searches_is_alert_enabled ON saved_searches(is_alert_enabled);

-- Property comparisons indexes
CREATE INDEX IF NOT EXISTS idx_property_comparisons_user_id ON property_comparisons(user_id);

-- Indexes for conversations and messages
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_property_id ON conversations(property_id);
CREATE INDEX IF NOT EXISTS idx_conversations_status ON conversations(status);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at ON conversations(last_message_at);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_type ON messages(sender_type);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_read_at ON messages(read_at);

-- Indexes for property applications
CREATE INDEX IF NOT EXISTS idx_property_applications_user_id ON property_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_property_applications_property_id ON property_applications(property_id);
CREATE INDEX IF NOT EXISTS idx_property_applications_status ON property_applications(status);
CREATE INDEX IF NOT EXISTS idx_property_applications_application_type ON property_applications(application_type);
CREATE INDEX IF NOT EXISTS idx_property_applications_submitted_date ON property_applications(submitted_date);

-- Indexes for property viewings
CREATE INDEX IF NOT EXISTS idx_property_viewings_property_id ON property_viewings(property_id);
CREATE INDEX IF NOT EXISTS idx_property_viewings_user_id ON property_viewings(user_id);
CREATE INDEX IF NOT EXISTS idx_property_viewings_viewing_date ON property_viewings(viewing_date);
CREATE INDEX IF NOT EXISTS idx_property_viewings_status ON property_viewings(status);

-- =====================================================
-- IMPROVED TRIGGER FUNCTIONS
-- =====================================================

-- Function to handle new user signup with better error handling
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    full_name_value TEXT;
    user_type_value TEXT;
    phone_value TEXT;
BEGIN
    -- Log the trigger execution for debugging
    RAISE LOG 'SIGNUP TRIGGER: Creating profile for user % with email %', NEW.id, NEW.email;
    
    -- Extract full name with better fallback logic
    full_name_value := COALESCE(
        NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), ''),
        NULLIF(TRIM(CONCAT(
            COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
            CASE 
                WHEN NEW.raw_user_meta_data->>'last_name' IS NOT NULL 
                THEN ' ' || NEW.raw_user_meta_data->>'last_name'
                ELSE ''
            END
        )), ' '),
        SPLIT_PART(NEW.email, '@', 1) -- Use email username as fallback
    );
    
    -- Extract user type with better validation
    user_type_value := COALESCE(
        NULLIF(TRIM(NEW.raw_user_meta_data->>'role'), ''),
        NULLIF(TRIM(NEW.raw_user_meta_data->>'user_type'), ''),
        'user'
    );
    
    -- Validate user_type against allowed values
    IF user_type_value NOT IN ('admin', 'agent', 'user') THEN
        user_type_value := 'user';
    END IF;
    
    -- Extract phone safely
    phone_value := NULLIF(TRIM(NEW.raw_user_meta_data->>'phone'), '');
    
    RAISE LOG 'SIGNUP TRIGGER: Extracted values - Name: %, Type: %, Phone: %', 
        full_name_value, user_type_value, phone_value;
    
    -- Insert profile with extracted values
    INSERT INTO profiles (
        id,
        email,
        full_name,
        user_type,
        status,
        phone,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        NEW.email,
        full_name_value,
        user_type_value,
        'active',
        phone_value,
        NOW(),
        NOW()
    );
    
    RAISE LOG 'SIGNUP TRIGGER: SUCCESS - Profile created for user %', NEW.id;
    RETURN NEW;
    
EXCEPTION
    WHEN unique_violation THEN
        RAISE LOG 'SIGNUP TRIGGER: Profile already exists for user % - continuing', NEW.id;
        RETURN NEW; -- Don't fail the auth.users insert
    WHEN OTHERS THEN
        RAISE LOG 'SIGNUP TRIGGER: ERROR for user %: %', NEW.id, SQLERRM;
        -- Try a minimal insert as fallback
        BEGIN
            INSERT INTO profiles (id, email, user_type, status, created_at, updated_at)
            VALUES (NEW.id, NEW.email, 'user', 'active', NOW(), NOW());
            RAISE LOG 'SIGNUP TRIGGER: FALLBACK - Minimal profile created for user %', NEW.id;
            RETURN NEW;
        EXCEPTION
            WHEN OTHERS THEN
                RAISE LOG 'SIGNUP TRIGGER: COMPLETE FAILURE for user %: %', NEW.id, SQLERRM;
                RETURN NEW; -- Still don't fail the auth.users insert
        END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Create trigger for new user profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create updated_at triggers for all tables
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_properties_updated_at ON properties;
CREATE TRIGGER update_properties_updated_at
    BEFORE UPDATE ON properties
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_property_inquiries_updated_at ON property_inquiries;
CREATE TRIGGER update_property_inquiries_updated_at
    BEFORE UPDATE ON property_inquiries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_testimonials_updated_at ON testimonials;
CREATE TRIGGER update_testimonials_updated_at
    BEFORE UPDATE ON testimonials
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_blog_posts_updated_at ON blog_posts;
CREATE TRIGGER update_blog_posts_updated_at
    BEFORE UPDATE ON blog_posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_contact_messages_updated_at ON contact_messages;
CREATE TRIGGER update_contact_messages_updated_at
    BEFORE UPDATE ON contact_messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_system_settings_updated_at ON system_settings;
CREATE TRIGGER update_system_settings_updated_at
    BEFORE UPDATE ON system_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_supported_currencies_updated_at ON supported_currencies;
CREATE TRIGGER update_supported_currencies_updated_at
    BEFORE UPDATE ON supported_currencies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_property_documents_updated_at ON property_documents;
CREATE TRIGGER update_property_documents_updated_at
    BEFORE UPDATE ON property_documents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_conversations_updated_at ON conversations;
CREATE TRIGGER update_conversations_updated_at
    BEFORE UPDATE ON conversations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_messages_updated_at ON messages;
CREATE TRIGGER update_messages_updated_at
    BEFORE UPDATE ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_property_applications_updated_at ON property_applications;
CREATE TRIGGER update_property_applications_updated_at
    BEFORE UPDATE ON property_applications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_property_viewings_updated_at ON property_viewings;
CREATE TRIGGER update_property_viewings_updated_at
    BEFORE UPDATE ON property_viewings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- STORAGE BUCKETS SETUP
-- =====================================================

-- 1. CREATE STORAGE BUCKETS
-- Ensure all required buckets exist with correct settings

-- Property Images Bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('property-images', 'property-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Avatars Bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Documents Bucket (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO UPDATE SET public = false;

-- 2. DROP EXISTING POLICIES (if any)
-- Clean up old policies to avoid conflicts

DROP POLICY IF EXISTS "Only agents and admins can upload property images" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload property images" ON storage.objects;
DROP POLICY IF EXISTS "Public read access to property images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own property images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own property images" ON storage.objects;

DROP POLICY IF EXISTS "Users can upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Public read access to avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatars" ON storage.objects;

DROP POLICY IF EXISTS "Users can upload documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can read their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own documents" ON storage.objects;

-- 3. CREATE NEW POLICIES

-- PROPERTY IMAGES POLICIES
-- Allow authenticated users to upload property images
CREATE POLICY "Authenticated users can upload property images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'property-images');

-- Allow public read access to property images
CREATE POLICY "Public read access to property images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'property-images');

-- Allow users to update their own property images
CREATE POLICY "Users can update their own property images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'property-images' 
  AND (storage.foldername(name))[1] = (SELECT auth.uid()::text)
);

-- Allow users to delete their own property images
CREATE POLICY "Users can delete their own property images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'property-images' 
  AND (storage.foldername(name))[1] = (SELECT auth.uid()::text)
);

-- AVATARS POLICIES
-- Allow authenticated users to upload avatars
CREATE POLICY "Authenticated users can upload avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars');

-- Allow public read access to avatars
CREATE POLICY "Public read access to avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- Allow users to update their own avatars
CREATE POLICY "Users can update their own avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = (SELECT auth.uid()::text)
);

-- Allow users to delete their own avatars
CREATE POLICY "Users can delete their own avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = (SELECT auth.uid()::text)
);

-- DOCUMENTS POLICIES
-- Allow authenticated users to upload documents
CREATE POLICY "Authenticated users can upload documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'documents');

-- Allow users to read their own documents only
CREATE POLICY "Users can read their own documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents' 
  AND (storage.foldername(name))[1] = (SELECT auth.uid()::text)
);

-- Allow users to update their own documents
CREATE POLICY "Users can update their own documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'documents' 
  AND (storage.foldername(name))[1] = (SELECT auth.uid()::text)
);

-- Allow users to delete their own documents
CREATE POLICY "Users can delete their own documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'documents' 
  AND (storage.foldername(name))[1] = (SELECT auth.uid()::text)
);

-- 4. ENABLE RLS ON storage.objects
-- Ensure Row Level Security is enabled for storage objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE supported_currencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE kyc_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_comparisons ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_viewings ENABLE ROW LEVEL SECURITY;

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON profiles;
DROP POLICY IF EXISTS "Agents can manage own properties" ON properties;
DROP POLICY IF EXISTS "Agents can insert properties" ON properties;
DROP POLICY IF EXISTS "Users can view own inquiries" ON property_inquiries;
DROP POLICY IF EXISTS "Agents and admins can update inquiries" ON property_inquiries;
DROP POLICY IF EXISTS "Admins can manage testimonials" ON testimonials;
DROP POLICY IF EXISTS "Authors can manage own posts" ON blog_posts;
DROP POLICY IF EXISTS "Admins can view all property views" ON property_views;
DROP POLICY IF EXISTS "Admins can manage system settings" ON system_settings;
DROP POLICY IF EXISTS "Admins can manage contact messages" ON contact_messages;
DROP POLICY IF EXISTS "Admins can manage newsletter subscribers" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Admins can manage currencies" ON supported_currencies;
DROP POLICY IF EXISTS "Admins can view all user settings" ON user_settings;
DROP POLICY IF EXISTS "Users can manage own KYC documents" ON kyc_documents;
DROP POLICY IF EXISTS "Agents can view own revenue" ON revenue_records;
DROP POLICY IF EXISTS "Admins can manage revenue records" ON revenue_records;
DROP POLICY IF EXISTS "Agents can view own commissions" ON agent_commissions;
DROP POLICY IF EXISTS "Admins can manage agent commissions" ON agent_commissions;
DROP POLICY IF EXISTS "Users can view own transactions" ON property_transactions;
DROP POLICY IF EXISTS "Agents and admins can manage transactions" ON property_transactions;
DROP POLICY IF EXISTS "Admins can view audit logs" ON audit_logs;
DROP POLICY IF EXISTS "Admins can manage subscription plans" ON subscription_plans;
DROP POLICY IF EXISTS "Users can view own subscriptions" ON user_subscriptions;
DROP POLICY IF EXISTS "Admins can manage user subscriptions" ON user_subscriptions;
DROP POLICY IF EXISTS "Users can view property documents" ON property_documents;
DROP POLICY IF EXISTS "Agents can manage property documents" ON property_documents;
DROP POLICY IF EXISTS "Users can manage own applications" ON property_applications;
DROP POLICY IF EXISTS "Users can create applications" ON property_applications;
DROP POLICY IF EXISTS "Users can update own applications" ON property_applications;
DROP POLICY IF EXISTS "Service role can manage all applications" ON property_applications;
DROP POLICY IF EXISTS "Users can view own viewings" ON property_viewings;
DROP POLICY IF EXISTS "Users can create viewings" ON property_viewings;
DROP POLICY IF EXISTS "Users can update own viewings" ON property_viewings;
DROP POLICY IF EXISTS "Admins can delete viewings" ON property_viewings;

-- Recreate profiles policies without recursion
-- Simple policy that allows users to view all profiles
CREATE POLICY "Users can view all profiles" ON profiles
    FOR SELECT USING (true);

-- Policy that allows users to update their own profile
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Policy that allows profile creation (needed for signup trigger)
CREATE POLICY "Allow profile creation" ON profiles
    FOR INSERT WITH CHECK (true);

-- Simple admin policy without recursion
CREATE POLICY "Service role can manage all profiles" ON profiles
    FOR ALL USING (auth.role() = 'service_role');

-- Properties policies
CREATE POLICY "Anyone can view published properties" ON properties
    FOR SELECT USING (true);

CREATE POLICY "Owners can manage own properties" ON properties
    FOR ALL USING (
        auth.uid() = owner_id OR 
        auth.role() = 'service_role'
    );

CREATE POLICY "Owners can insert properties" ON properties
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL OR 
        auth.role() = 'service_role'
    );

-- Property inquiries policies
CREATE POLICY "Users can view own inquiries" ON property_inquiries
    FOR SELECT USING (
        auth.uid() = user_id OR 
        auth.role() = 'service_role'
    );

CREATE POLICY "Anyone can create inquiries" ON property_inquiries
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Agents and admins can update inquiries" ON property_inquiries
    FOR UPDATE USING (auth.role() = 'service_role');

-- Testimonials policies
CREATE POLICY "Anyone can view approved testimonials" ON testimonials
    FOR SELECT USING (is_approved = true OR auth.uid() = user_id);

CREATE POLICY "Authenticated users can create testimonials" ON testimonials
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Service role can manage testimonials" ON testimonials
    FOR ALL USING (auth.role() = 'service_role');

-- Blog posts policies
CREATE POLICY "Anyone can view published posts" ON blog_posts
    FOR SELECT USING (status = 'published' OR auth.uid() = author_id);

CREATE POLICY "Authors can manage own posts" ON blog_posts
    FOR ALL USING (
        auth.uid() = author_id OR 
        auth.role() = 'service_role'
    );

-- Property favorites policies
CREATE POLICY "Users can manage own favorites" ON property_favorites
    FOR ALL USING (auth.uid() = user_id);

-- Property views policies (for analytics)
CREATE POLICY "Anyone can create property views" ON property_views
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role can view all property views" ON property_views
    FOR SELECT USING (auth.role() = 'service_role');

-- System settings policies
CREATE POLICY "Service role can manage system settings" ON system_settings
    FOR ALL USING (auth.role() = 'service_role');

-- Public read access for certain settings
CREATE POLICY "Anyone can view public settings" ON system_settings
    FOR SELECT USING (key LIKE 'public_%');

-- Contact messages and newsletter policies
CREATE POLICY "Anyone can create contact messages" ON contact_messages
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role can manage contact messages" ON contact_messages
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Anyone can subscribe to newsletter" ON newsletter_subscribers
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role can manage newsletter subscribers" ON newsletter_subscribers
    FOR ALL USING (auth.role() = 'service_role');

-- Supported currencies policies
CREATE POLICY "Anyone can view currencies" ON supported_currencies
    FOR SELECT USING (is_active = true);

CREATE POLICY "Service role can manage currencies" ON supported_currencies
    FOR ALL USING (auth.role() = 'service_role');

-- User settings policies (including theme preferences)
CREATE POLICY "Users can manage own settings" ON user_settings
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Service role can view all user settings" ON user_settings
    FOR SELECT USING (auth.role() = 'service_role');

-- KYC documents policies
CREATE POLICY "Users can manage own KYC documents" ON kyc_documents
    FOR ALL USING (
        auth.uid() = user_id OR 
        auth.role() = 'service_role'
    );

-- Revenue records policies
CREATE POLICY "Agents can view own revenue" ON revenue_records
    FOR SELECT USING (
        auth.uid() = agent_id OR 
        auth.role() = 'service_role'
    );

CREATE POLICY "Service role can manage revenue records" ON revenue_records
    FOR ALL USING (auth.role() = 'service_role');

-- Agent commissions policies
CREATE POLICY "Agents can view own commissions" ON agent_commissions
    FOR SELECT USING (
        auth.uid() = agent_id OR 
        auth.role() = 'service_role'
    );

CREATE POLICY "Service role can manage agent commissions" ON agent_commissions
    FOR ALL USING (auth.role() = 'service_role');

-- Property transactions policies
CREATE POLICY "Users can view own transactions" ON property_transactions
    FOR SELECT USING (
        auth.uid() = buyer_id OR 
        auth.uid() = seller_id OR 
        auth.uid() = agent_id OR
        auth.role() = 'service_role'
    );

CREATE POLICY "Agents and service role can manage transactions" ON property_transactions
    FOR ALL USING (auth.role() = 'service_role');

-- Notifications policies
CREATE POLICY "Users can manage own notifications" ON notifications
    FOR ALL USING (auth.uid() = user_id);

-- Audit logs policies (service role only)
CREATE POLICY "Service role can view audit logs" ON audit_logs
    FOR SELECT USING (auth.role() = 'service_role');

-- Subscription plans policies
CREATE POLICY "Anyone can view active subscription plans" ON subscription_plans
    FOR SELECT USING (is_active = true);

CREATE POLICY "Service role can manage subscription plans" ON subscription_plans
    FOR ALL USING (auth.role() = 'service_role');

-- User subscriptions policies
CREATE POLICY "Users can view own subscriptions" ON user_subscriptions
    FOR SELECT USING (
        auth.uid() = user_id OR 
        auth.role() = 'service_role'
    );

CREATE POLICY "Service role can manage user subscriptions" ON user_subscriptions
    FOR ALL USING (auth.role() = 'service_role');

-- Property documents policies
CREATE POLICY "Users can view property documents" ON property_documents
    FOR SELECT USING (
        is_public = true OR
        auth.uid() = uploaded_by OR
        auth.role() = 'service_role'
    );

CREATE POLICY "Owners and service role can manage property documents" ON property_documents
    FOR ALL USING (auth.role() = 'service_role');

-- Saved searches policies
CREATE POLICY "Users can manage own saved searches" ON saved_searches
    FOR ALL USING (auth.uid() = user_id);

-- Property comparisons policies
CREATE POLICY "Users can manage own comparisons" ON property_comparisons
    FOR ALL USING (auth.uid() = user_id);

-- RLS policies for conversations and messages
CREATE POLICY "Users can view own conversations" ON conversations
    FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can create conversations" ON conversations
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own conversations" ON conversations
    FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "Users can delete own conversations" ON conversations
    FOR DELETE
    USING (user_id = auth.uid());

CREATE POLICY "Users can view messages in own conversations" ON messages
    FOR SELECT
    USING (conversation_id IN (
        SELECT id FROM conversations WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can create messages in own conversations" ON messages
    FOR INSERT
    WITH CHECK (conversation_id IN (
        SELECT id FROM conversations WHERE user_id = auth.uid()
    ));

CREATE POLICY "Service role can manage all conversations" ON conversations
    FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role can manage all messages" ON messages
    FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

-- RLS policies for property applications
CREATE POLICY "Users can view own applications" ON property_applications
    FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can create applications" ON property_applications
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own applications" ON property_applications
    FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "Service role can manage all applications" ON property_applications
    FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

-- RLS policies for property viewings
CREATE POLICY "Users can view own viewings" ON property_viewings
    FOR SELECT
    USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND user_type = 'admin'
        )
    );

CREATE POLICY "Users can create viewings" ON property_viewings
    FOR INSERT WITH CHECK (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND user_type = 'admin'
        )
    );

CREATE POLICY "Users can update their own viewings" ON property_viewings
    FOR UPDATE USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND user_type = 'admin'
        )
    );

CREATE POLICY "Admins can delete viewings" ON property_viewings
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND user_type = 'admin'
        )
    );

-- =====================================================
-- ESSENTIAL CONFIGURATION DATA
-- =====================================================

-- Insert supported currencies
INSERT INTO supported_currencies (code, name, symbol, exchange_rate, is_default, is_active) VALUES
    ('USD', 'US Dollar', '$', 1.0, true, true),
    ('EUR', 'Euro', '€', 0.85, false, true),
    ('GBP', 'British Pound', '£', 0.73, false, true),
    ('CAD', 'Canadian Dollar', 'C$', 1.25, false, true),
    ('AUD', 'Australian Dollar', 'A$', 1.35, false, true)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    symbol = EXCLUDED.symbol,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- Insert system settings
INSERT INTO system_settings (key, value, description) VALUES
    ('site_name', '"Campus Comfort"', 'Name of the website'),
    ('site_description', '"Your trusted partner in campus living"', 'Website description'),
    ('contact_email', '"info@campuscomfort.com"', 'Main contact email'),
    ('contact_phone', '"+1 (555) 123-4567"', 'Main contact phone'),
    ('office_address', '"123 Real Estate Ave, City, State 12345"', 'Office address'),
    ('public_max_properties_per_page', '12', 'Number of properties to show per page'),
    ('public_featured_properties_count', '6', 'Number of featured properties to show on homepage'),
    ('public_testimonials_count', '3', 'Number of testimonials to show on homepage'),
    ('public_blog_posts_per_page', '9', 'Number of blog posts per page'),
    ('public_enable_property_inquiry', 'true', 'Enable property inquiry form'),
    ('public_enable_newsletter', 'true', 'Enable newsletter subscription'),
    ('public_enable_testimonials', 'true', 'Enable testimonials feature'),
    ('currency_default', '"USD"', 'Default currency code'),
    ('timezone', '"America/New_York"', 'Default timezone'),
    ('date_format', '"MM/DD/YYYY"', 'Default date format'),
    ('public_social_facebook', '""', 'Facebook page URL'),
    ('public_social_twitter', '""', 'Twitter profile URL'),
    ('public_social_instagram', '""', 'Instagram profile URL'),
    ('public_social_linkedin', '""', 'LinkedIn profile URL'),
    ('public_social_youtube', '""', 'YouTube channel URL'),
    ('email_notifications_enabled', 'true', 'Enable email notifications'),
    ('maintenance_mode', 'false', 'Site maintenance mode'),
    ('default_theme', '"light"', 'Default theme for new users'),
    ('available_themes', '["light", "dark", "system"]', 'Available theme options'),
    ('public_theme_customization_enabled', 'true', 'Allow users to customize themes')
ON CONFLICT (key) DO UPDATE SET
    value = EXCLUDED.value,
    description = EXCLUDED.description,
    updated_at = NOW();

-- Insert default user preference templates
INSERT INTO system_settings (key, value, description) VALUES
    ('default_user_theme_settings', '{
        "theme": "light",
        "primary_color": "#1e40af",
        "accent_color": "#f59e0b",
        "font_size": "medium",
        "compact_mode": false,
        "sidebar_collapsed": false,
        "animations_enabled": true
    }', 'Default theme settings for new users'),
    ('default_agent_theme_settings', '{
        "theme": "light",
        "primary_color": "#059669",
        "accent_color": "#dc2626",
        "font_size": "medium",
        "compact_mode": false,
        "sidebar_collapsed": false,
        "animations_enabled": true,
        "dashboard_layout": "grid",
        "property_card_style": "detailed"
    }', 'Default theme settings for new agents'),
    ('default_admin_theme_settings', '{
        "theme": "dark",
        "primary_color": "#7c3aed",
        "accent_color": "#f59e0b",
        "font_size": "medium",
        "compact_mode": true,
        "sidebar_collapsed": false,
        "animations_enabled": false,
        "dashboard_layout": "table",
        "data_density": "compact"
    }', 'Default theme settings for new admins')
ON CONFLICT (key) DO UPDATE SET
    value = EXCLUDED.value,
    description = EXCLUDED.description,
    updated_at = NOW();

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '=====================================================';
    RAISE NOTICE '✅ CAMPUS COMFORT DATABASE SETUP COMPLETE!';
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'Created:';
    RAISE NOTICE '• All tables with proper relationships';
    RAISE NOTICE '• Performance indexes';
    RAISE NOTICE '• User signup trigger';
    RAISE NOTICE '• Row Level Security policies';
    RAISE NOTICE '• Storage bucket configuration';
    RAISE NOTICE '• Essential configuration data';
    RAISE NOTICE '';
    RAISE NOTICE 'Your database is ready for use!';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Update your app with new Supabase credentials';
    RAISE NOTICE '2. Test user signup functionality';
    RAISE NOTICE '3. Verify all features work correctly';
    RAISE NOTICE '=====================================================';
END $$;
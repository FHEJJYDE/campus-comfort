-- =====================================================
-- CAMPUS COMFORT COMPLETE DATABASE SETUP (Supabase Compatible)
-- =====================================================
-- This file contains ALL necessary tables for Campus Comfort platform
-- Run this in your Supabase SQL Editor
-- =====================================================

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

-- Universities table (new for campus housing)
CREATE TABLE IF NOT EXISTS universities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(50) NOT NULL,
    country VARCHAR(50) DEFAULT 'USA',
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    website_url TEXT,
    student_population INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Properties table (now for student housing)
CREATE TABLE IF NOT EXISTS properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(12,2) NOT NULL,
    property_type VARCHAR(50) NOT NULL CHECK (property_type IN ('dorm', 'apartment', 'shared_room', 'studio', 'house', 'townhouse')),
    status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'pending', 'rented', 'withdrawn', 'rejected')),
    bedrooms INTEGER,
    bathrooms DECIMAL(3,1),
    square_feet INTEGER,
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
    university_name VARCHAR(255), -- New field for campus housing
    distance_to_campus DECIMAL(5,2), -- Distance in miles
    semester_rate DECIMAL(10,2), -- Semester pricing
    academic_year_rate DECIMAL(10,2), -- Full year pricing
    utilities_included BOOLEAN DEFAULT FALSE,
    furnished BOOLEAN DEFAULT FALSE,
    parking_available BOOLEAN DEFAULT FALSE,
    pet_friendly BOOLEAN DEFAULT FALSE,
    wifi_included BOOLEAN DEFAULT FALSE,
    laundry_available BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Property inquiries table
CREATE TABLE IF NOT EXISTS property_inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    message TEXT,
    inquiry_type VARCHAR(50) DEFAULT 'general' CHECK (inquiry_type IN ('general', 'viewing', 'rental', 'roommate')),
    status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'scheduled', 'completed', 'closed')),
    preferred_contact VARCHAR(20) DEFAULT 'email' CHECK (preferred_contact IN ('email', 'phone', 'both')),
    move_in_date DATE,
    semester VARCHAR(20), -- Fall, Spring, Summer
    graduation_year INTEGER,
    university VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Testimonials table
CREATE TABLE IF NOT EXISTS testimonials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    university VARCHAR(255),
    graduation_year INTEGER,
    major VARCHAR(255),
    is_approved BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Blog posts table
CREATE TABLE IF NOT EXISTS blog_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    university VARCHAR(255),
    graduation_year INTEGER,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed', 'bounced')),
    subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    unsubscribed_at TIMESTAMP WITH TIME ZONE,
    source VARCHAR(100) DEFAULT 'website'
);

-- Contact messages table
CREATE TABLE IF NOT EXISTS contact_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    university VARCHAR(255),
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
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, property_id)
);

-- Property views tracking
CREATE TABLE IF NOT EXISTS property_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- User/Student individual settings table
CREATE TABLE IF NOT EXISTS user_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    setting_key VARCHAR(255) NOT NULL,
    setting_value JSONB,
    category VARCHAR(100) DEFAULT 'general' CHECK (category IN ('general', 'notifications', 'privacy', 'preferences', 'appearance')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, setting_key)
);

-- KYC verification documents table (for property owners/managers)
CREATE TABLE IF NOT EXISTS kyc_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL CHECK (document_type IN ('passport', 'national_id', 'drivers_license', 'utility_bill', 'bank_statement', 'tax_document', 'business_license', 'student_id')),
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

-- Revenue tracking table (for platform revenue)
CREATE TABLE IF NOT EXISTS revenue_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    transaction_type VARCHAR(50) NOT NULL CHECK (transaction_type IN ('rental', 'commission', 'listing_fee', 'subscription', 'booking_fee')),
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

-- Property transactions/rental history
CREATE TABLE IF NOT EXISTS property_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    landlord_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('rental', 'lease')),
    price DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD' REFERENCES supported_currencies(code),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    lease_start_date DATE,
    lease_end_date DATE,
    security_deposit DECIMAL(10,2),
    semester VARCHAR(20), -- Fall, Spring, Summer, Full Year
    academic_year VARCHAR(10), -- 2024-25
    notes TEXT,
    documents JSONB, -- Array of document URLs
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error', 'system')),
    category VARCHAR(100) DEFAULT 'general' CHECK (category IN ('general', 'property', 'rental', 'kyc', 'payment', 'system')),
    is_read BOOLEAN DEFAULT FALSE,
    action_url TEXT,
    metadata JSONB,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit log table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- Subscription plans table (for premium features)
CREATE TABLE IF NOT EXISTS subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- Property documents table (leases, contracts, etc.)
CREATE TABLE IF NOT EXISTS property_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    document_type VARCHAR(100) NOT NULL CHECK (document_type IN ('lease', 'contract', 'rules', 'inspection', 'insurance', 'other')),
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
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    search_query TEXT NOT NULL,
    search_filters JSONB, -- Store the filters used in the search
    results_count INTEGER DEFAULT 0,
    searched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Property comparisons table
CREATE TABLE IF NOT EXISTS property_comparisons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    comparison_name VARCHAR(255),
    property_ids UUID[] NOT NULL, -- Array of property IDs
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Conversations table (messaging system)
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    sender_type VARCHAR(10) NOT NULL CHECK (sender_type IN ('user', 'admin')),
    message_text TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'document', 'property_link')),
    file_url TEXT,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Property Applications table (rental applications)
CREATE TABLE IF NOT EXISTS property_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    application_type VARCHAR(20) NOT NULL CHECK (application_type IN ('rental', 'roommate')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'declined', 'withdrawn', 'completed')),
    applicant_name VARCHAR(255) NOT NULL,
    applicant_email VARCHAR(255) NOT NULL,
    applicant_phone VARCHAR(20),
    university VARCHAR(255),
    graduation_year INTEGER,
    major VARCHAR(255),
    gpa DECIMAL(3,2),
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(20),
    move_in_date DATE,
    semester VARCHAR(20),
    message TEXT,
    submitted_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    decision_date TIMESTAMP WITH TIME ZONE,
    decision_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Property viewings table for scheduled property viewings/appointments
CREATE TABLE IF NOT EXISTS property_viewings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- Roommate matching table (new for student housing)
CREATE TABLE IF NOT EXISTS roommate_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
    university VARCHAR(255) NOT NULL,
    graduation_year INTEGER,
    major VARCHAR(255),
    gender VARCHAR(20),
    smoking_preference VARCHAR(20) CHECK (smoking_preference IN ('smoker', 'non_smoker', 'no_preference')),
    pet_preference VARCHAR(20) CHECK (pet_preference IN ('has_pets', 'no_pets', 'no_preference')),
    cleanliness_level INTEGER CHECK (cleanliness_level >= 1 AND cleanliness_level <= 5),
    noise_level INTEGER CHECK (noise_level >= 1 AND noise_level <= 5),
    budget_min DECIMAL(10,2),
    budget_max DECIMAL(10,2),
    move_in_date DATE,
    semester VARCHAR(20),
    bio TEXT,
    interests TEXT[],
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'matched', 'inactive')),
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

-- Universities indexes
CREATE INDEX IF NOT EXISTS idx_universities_city ON universities(city);
CREATE INDEX IF NOT EXISTS idx_universities_state ON universities(state);
CREATE INDEX IF NOT EXISTS idx_universities_is_active ON universities(is_active);
CREATE INDEX IF NOT EXISTS idx_universities_name ON universities(name);

-- Properties indexes
CREATE INDEX IF NOT EXISTS idx_properties_owner_id ON properties(owner_id);
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_property_type ON properties(property_type);
CREATE INDEX IF NOT EXISTS idx_properties_price ON properties(price);
CREATE INDEX IF NOT EXISTS idx_properties_city ON properties(city);
CREATE INDEX IF NOT EXISTS idx_properties_state ON properties(state);
CREATE INDEX IF NOT EXISTS idx_properties_university_name ON properties(university_name);
CREATE INDEX IF NOT EXISTS idx_properties_distance_to_campus ON properties(distance_to_campus);
CREATE INDEX IF NOT EXISTS idx_properties_created_at ON properties(created_at);
CREATE INDEX IF NOT EXISTS idx_properties_is_featured ON properties(is_featured);
CREATE INDEX IF NOT EXISTS idx_properties_furnished ON properties(furnished);
CREATE INDEX IF NOT EXISTS idx_properties_utilities_included ON properties(utilities_included);

-- Property inquiries indexes
CREATE INDEX IF NOT EXISTS idx_property_inquiries_property_id ON property_inquiries(property_id);
CREATE INDEX IF NOT EXISTS idx_property_inquiries_user_id ON property_inquiries(user_id);
CREATE INDEX IF NOT EXISTS idx_property_inquiries_status ON property_inquiries(status);
CREATE INDEX IF NOT EXISTS idx_property_inquiries_university ON property_inquiries(university);
CREATE INDEX IF NOT EXISTS idx_property_inquiries_created_at ON property_inquiries(created_at);

-- Testimonials indexes
CREATE INDEX IF NOT EXISTS idx_testimonials_user_id ON testimonials(user_id);
CREATE INDEX IF NOT EXISTS idx_testimonials_property_id ON testimonials(property_id);
CREATE INDEX IF NOT EXISTS idx_testimonials_is_approved ON testimonials(is_approved);
CREATE INDEX IF NOT EXISTS idx_testimonials_is_featured ON testimonials(is_featured);
CREATE INDEX IF NOT EXISTS idx_testimonials_university ON testimonials(university);

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
CREATE INDEX IF NOT EXISTS idx_revenue_records_user_id ON revenue_records(user_id);
CREATE INDEX IF NOT EXISTS idx_revenue_records_property_id ON revenue_records(property_id);
CREATE INDEX IF NOT EXISTS idx_revenue_records_transaction_type ON revenue_records(transaction_type);
CREATE INDEX IF NOT EXISTS idx_revenue_records_status ON revenue_records(status);
CREATE INDEX IF NOT EXISTS idx_revenue_records_transaction_date ON revenue_records(transaction_date);

-- Property transactions indexes
CREATE INDEX IF NOT EXISTS idx_property_transactions_property_id ON property_transactions(property_id);
CREATE INDEX IF NOT EXISTS idx_property_transactions_tenant_id ON property_transactions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_property_transactions_landlord_id ON property_transactions(landlord_id);
CREATE INDEX IF NOT EXISTS idx_property_transactions_status ON property_transactions(status);
CREATE INDEX IF NOT EXISTS idx_property_transactions_lease_start_date ON property_transactions(lease_start_date);
CREATE INDEX IF NOT EXISTS idx_property_transactions_semester ON property_transactions(semester);

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

-- Conversations and messages indexes
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_property_id ON conversations(property_id);
CREATE INDEX IF NOT EXISTS idx_conversations_status ON conversations(status);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at ON conversations(last_message_at);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_type ON messages(sender_type);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_read_at ON messages(read_at);

-- Property applications indexes
CREATE INDEX IF NOT EXISTS idx_property_applications_user_id ON property_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_property_applications_property_id ON property_applications(property_id);
CREATE INDEX IF NOT EXISTS idx_property_applications_status ON property_applications(status);
CREATE INDEX IF NOT EXISTS idx_property_applications_university ON property_applications(university);
CREATE INDEX IF NOT EXISTS idx_property_applications_application_type ON property_applications(application_type);
CREATE INDEX IF NOT EXISTS idx_property_applications_submitted_date ON property_applications(submitted_date);

-- Property viewings indexes
CREATE INDEX IF NOT EXISTS idx_property_viewings_property_id ON property_viewings(property_id);
CREATE INDEX IF NOT EXISTS idx_property_viewings_user_id ON property_viewings(user_id);
CREATE INDEX IF NOT EXISTS idx_property_viewings_viewing_date ON property_viewings(viewing_date);
CREATE INDEX IF NOT EXISTS idx_property_viewings_status ON property_viewings(status);

-- Roommate requests indexes
CREATE INDEX IF NOT EXISTS idx_roommate_requests_user_id ON roommate_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_roommate_requests_university ON roommate_requests(university);
CREATE INDEX IF NOT EXISTS idx_roommate_requests_status ON roommate_requests(status);
CREATE INDEX IF NOT EXISTS idx_roommate_requests_graduation_year ON roommate_requests(graduation_year);
CREATE INDEX IF NOT EXISTS idx_roommate_requests_budget_min ON roommate_requests(budget_min);
CREATE INDEX IF NOT EXISTS idx_roommate_requests_budget_max ON roommate_requests(budget_max);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE universities ENABLE ROW LEVEL SECURITY;
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
ALTER TABLE property_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_comparisons ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_viewings ENABLE ROW LEVEL SECURITY;
ALTER TABLE roommate_requests ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Universities policies
CREATE POLICY "Anyone can view active universities" ON universities FOR SELECT USING (is_active = true);

-- Properties policies
CREATE POLICY "Anyone can view available properties" ON properties FOR SELECT USING (status = 'available' OR auth.uid() = owner_id);
CREATE POLICY "Property owners can manage their properties" ON properties FOR ALL USING (auth.uid() = owner_id);
CREATE POLICY "Admins can manage all properties" ON properties FOR ALL USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.user_type = 'admin'
    )
);

-- Property inquiries policies
CREATE POLICY "Users can view their own inquiries" ON property_inquiries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Property owners can view inquiries for their properties" ON property_inquiries FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM properties 
        WHERE properties.id = property_inquiries.property_id 
        AND properties.owner_id = auth.uid()
    )
);
CREATE POLICY "Anyone can create inquiries" ON property_inquiries FOR INSERT WITH CHECK (true);

-- Property favorites policies
CREATE POLICY "Users can manage their own favorites" ON property_favorites FOR ALL USING (auth.uid() = user_id);

-- Property views policies
CREATE POLICY "Anyone can create property views" ON property_views FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view their own property views" ON property_views FOR SELECT USING (auth.uid() = user_id);

-- Property viewings policies
CREATE POLICY "Users can view their own viewings" ON property_viewings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Property owners can view viewings for their properties" ON property_viewings FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM properties 
        WHERE properties.id = property_viewings.property_id 
        AND properties.owner_id = auth.uid()
    )
);
CREATE POLICY "Anyone can create viewings" ON property_viewings FOR INSERT WITH CHECK (true);

-- System settings policies
CREATE POLICY "Anyone can view system settings" ON system_settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage system settings" ON system_settings FOR ALL USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.user_type = 'admin'
    )
);

-- Supported currencies policies
CREATE POLICY "Anyone can view currencies" ON supported_currencies FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage currencies" ON supported_currencies FOR ALL USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.user_type = 'admin'
    )
);

-- User settings policies
CREATE POLICY "Users can manage their own settings" ON user_settings FOR ALL USING (auth.uid() = user_id);

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- Property applications policies
CREATE POLICY "Users can view their own applications" ON property_applications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Property owners can view applications for their properties" ON property_applications FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM properties 
        WHERE properties.id = property_applications.property_id 
        AND properties.owner_id = auth.uid()
    )
);
CREATE POLICY "Anyone can create applications" ON property_applications FOR INSERT WITH CHECK (true);

-- Roommate requests policies
CREATE POLICY "Users can manage their own roommate requests" ON roommate_requests FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Anyone can view active roommate requests" ON roommate_requests FOR SELECT USING (status = 'active');

-- Saved searches policies
CREATE POLICY "Users can manage their own saved searches" ON saved_searches FOR ALL USING (auth.uid() = user_id);

-- Search history policies
CREATE POLICY "Users can view their own search history" ON search_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create search history" ON search_history FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Property comparisons policies
CREATE POLICY "Users can manage their own comparisons" ON property_comparisons FOR ALL USING (auth.uid() = user_id);

-- Conversations and messages policies
CREATE POLICY "Users can view their own conversations" ON conversations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create conversations" ON conversations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view messages in their conversations" ON messages FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM conversations 
        WHERE conversations.id = messages.conversation_id 
        AND conversations.user_id = auth.uid()
    )
);
CREATE POLICY "Users can send messages in their conversations" ON messages FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM conversations 
        WHERE conversations.id = messages.conversation_id 
        AND conversations.user_id = auth.uid()
    )
);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Function to handle user profile creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, user_type)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        COALESCE(NEW.raw_user_meta_data->>'user_type', 'user')
    );
    RETURN NEW;
EXCEPTION
    WHEN others THEN
        -- If insert fails, try to update existing profile
        UPDATE public.profiles 
        SET 
            email = NEW.email,
            full_name = COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
            user_type = COALESCE(NEW.raw_user_meta_data->>'user_type', user_type),
            updated_at = NOW()
        WHERE id = NEW.id;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =====================================================
-- INITIAL DATA
-- =====================================================

-- Insert system settings
INSERT INTO system_settings (key, value, description) VALUES
    ('site_name', '"Campus Comfort"', 'Name of the website'),
    ('site_description', '"Your trusted partner in campus living"', 'Website description'),
    ('contact_email', '"info@campuscomfort.com"', 'Main contact email'),
    ('contact_phone', '"+1 (555) 123-4567"', 'Main contact phone'),
    ('office_address', '"123 University Ave, College Town, State 12345"', 'Office address'),
    ('default_currency', '"USD"', 'Default currency for the platform'),
    ('max_property_images', '10', 'Maximum number of images per property'),
    ('property_approval_required', 'true', 'Whether properties need admin approval')
ON CONFLICT (key) DO NOTHING;

-- Insert supported currencies
INSERT INTO supported_currencies (code, name, symbol, is_default, is_active) VALUES
    ('USD', 'US Dollar', '$', true, true),
    ('EUR', 'Euro', '€', false, true),
    ('GBP', 'British Pound', '£', false, true),
    ('CAD', 'Canadian Dollar', 'C$', false, true),
    ('AUD', 'Australian Dollar', 'A$', false, true)
ON CONFLICT (code) DO NOTHING;

-- Insert sample universities
INSERT INTO universities (name, city, state, student_population, is_active) VALUES
    ('University of California, Berkeley', 'Berkeley', 'California', 45000, true),
    ('Stanford University', 'Stanford', 'California', 17000, true),
    ('Harvard University', 'Cambridge', 'Massachusetts', 23000, true),
    ('Massachusetts Institute of Technology', 'Cambridge', 'Massachusetts', 11500, true),
    ('University of Texas at Austin', 'Austin', 'Texas', 51000, true),
    ('University of Michigan', 'Ann Arbor', 'Michigan', 47000, true),
    ('University of Washington', 'Seattle', 'Washington', 47000, true),
    ('Georgia Institute of Technology', 'Atlanta', 'Georgia', 36000, true),
    ('University of Florida', 'Gainesville', 'Florida', 52000, true),
    ('Ohio State University', 'Columbus', 'Ohio', 61000, true),
    ('University of Illinois', 'Urbana-Champaign', 'Illinois', 48000, true),
    ('Penn State University', 'University Park', 'Pennsylvania', 46000, true)
ON CONFLICT DO NOTHING;

-- Insert sample subscription plans
INSERT INTO subscription_plans (name, description, price, billing_cycle, features, max_properties, max_featured_properties, max_images_per_property, sort_order) VALUES
    ('Basic', 'Perfect for individual property owners', 9.99, 'monthly', '["Basic listing", "Up to 5 photos", "Email support"]', 3, 0, 5, 1),
    ('Pro', 'Great for property managers', 29.99, 'monthly', '["Unlimited listings", "Up to 10 photos per property", "Featured listings", "Priority support", "Analytics"]', 25, 5, 10, 2),
    ('Enterprise', 'For large property management companies', 99.99, 'monthly', '["Unlimited everything", "Custom branding", "API access", "Dedicated support", "Advanced analytics"]', -1, -1, 20, 3)
ON CONFLICT DO NOTHING;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '=====================================================';
    RAISE NOTICE '✅ CAMPUS COMFORT COMPLETE DATABASE SETUP COMPLETE!';
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'Created:';
    RAISE NOTICE '- 25+ tables for complete student housing platform';
    RAISE NOTICE '- Performance indexes for all tables';
    RAISE NOTICE '- Row Level Security policies';
    RAISE NOTICE '- User profile creation trigger';
    RAISE NOTICE '- Sample universities and system settings';
    RAISE NOTICE '- Subscription plans for monetization';
    RAISE NOTICE '- Roommate matching system';
    RAISE NOTICE '- Student-focused features throughout';
    RAISE NOTICE '=====================================================';
END $$;
-- =====================================================
-- TONIES ESTATE COMPLETE DATABASE SETUP
-- =====================================================
-- This file contains all SQL from all migration files merged into one
-- =====================================================

-- -----------------------------------------------------
-- Part 1: Core Tables from CAMPUS_COMFORT_SETUP.sql
-- -----------------------------------------------------

-- Users profiles table (linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
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
CREATE TABLE IF NOT EXISTS public.universities (
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

-- Properties table
CREATE TABLE IF NOT EXISTS public.properties (
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
    lot_size INTEGER,
    year_built INTEGER,
    address TEXT NOT NULL,
    street TEXT,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(50) NOT NULL,
    zip_code VARCHAR(20) NOT NULL,
    country VARCHAR(50) DEFAULT 'USA',
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    images TEXT[],
    features TEXT[],
    amenities TEXT[],
    virtual_tour_url TEXT,
    is_featured BOOLEAN DEFAULT FALSE,
    views_count INTEGER DEFAULT 0,
    university_name VARCHAR(255),
    distance_to_campus DECIMAL(5,2),
    semester_rate DECIMAL(10,2),
    academic_year_rate DECIMAL(10,2),
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
CREATE TABLE IF NOT EXISTS public.property_inquiries (
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
    semester VARCHAR(20),
    graduation_year INTEGER,
    university VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Testimonials table
CREATE TABLE IF NOT EXISTS public.testimonials (
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
CREATE TABLE IF NOT EXISTS public.blog_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    excerpt TEXT,
    content TEXT NOT NULL,
    featured_image TEXT,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    category VARCHAR(100),
    tags TEXT[],
    meta_description TEXT,
    is_featured BOOLEAN DEFAULT FALSE,
    views_count INTEGER DEFAULT 0,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Newsletter subscribers table
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
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
CREATE TABLE IF NOT EXISTS public.contact_messages (
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
CREATE TABLE IF NOT EXISTS public.system_settings (
    key VARCHAR(255) PRIMARY KEY,
    value JSONB,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Property favorites (user saved properties)
CREATE TABLE IF NOT EXISTS public.property_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, property_id)
);

-- Property views tracking
CREATE TABLE IF NOT EXISTS public.property_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    ip_address INET,
    user_agent TEXT,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Supported currencies table
CREATE TABLE IF NOT EXISTS public.supported_currencies (
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
CREATE TABLE IF NOT EXISTS public.user_settings (
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
CREATE TABLE IF NOT EXISTS public.kyc_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL CHECK (document_type IN ('passport', 'national_id', 'drivers_license', 'utility_bill', 'bank_statement', 'tax_document', 'business_license', 'student_id')),
    document_number VARCHAR(255),
    document_url TEXT NOT NULL,
    verification_status VARCHAR(20) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected', 'expired')),
    verified_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    verified_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    expiry_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Revenue records table
CREATE TABLE IF NOT EXISTS public.revenue_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    transaction_type VARCHAR(50) NOT NULL CHECK (transaction_type IN ('rental', 'commission', 'listing_fee', 'subscription', 'booking_fee')),
    amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD' REFERENCES supported_currencies(code),
    commission_rate DECIMAL(5,2),
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
CREATE TABLE IF NOT EXISTS public.property_transactions (
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
    semester VARCHAR(20),
    academic_year VARCHAR(10),
    notes TEXT,
    documents JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
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

-- Audit logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
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

-- Subscription plans table
CREATE TABLE IF NOT EXISTS public.subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD' REFERENCES supported_currencies(code),
    billing_cycle VARCHAR(20) NOT NULL CHECK (billing_cycle IN ('monthly', 'quarterly', 'yearly')),
    features JSONB,
    max_properties INTEGER,
    max_featured_properties INTEGER,
    max_images_per_property INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User subscriptions table
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
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
    stripe_subscription_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Property documents table
CREATE TABLE IF NOT EXISTS public.property_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    document_type VARCHAR(100) NOT NULL CHECK (document_type IN ('lease', 'contract', 'rules', 'inspection', 'insurance', 'other')),
    document_name VARCHAR(255) NOT NULL,
    document_url TEXT NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    uploaded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Saved searches table
CREATE TABLE IF NOT EXISTS public.saved_searches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    search_name VARCHAR(255) NOT NULL,
    search_criteria JSONB NOT NULL,
    is_alert_enabled BOOLEAN DEFAULT FALSE,
    alert_frequency VARCHAR(20) DEFAULT 'daily' CHECK (alert_frequency IN ('immediate', 'daily', 'weekly')),
    last_alerted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Search history table
CREATE TABLE IF NOT EXISTS public.search_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    search_query TEXT NOT NULL,
    search_filters JSONB,
    results_count INTEGER DEFAULT 0,
    searched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Property comparisons table
CREATE TABLE IF NOT EXISTS public.property_comparisons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    comparison_name VARCHAR(255),
    property_ids UUID[] NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Conversations table
CREATE TABLE IF NOT EXISTS public.conversations (
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
CREATE TABLE IF NOT EXISTS public.messages (
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

-- Property applications table
CREATE TABLE IF NOT EXISTS public.property_applications (
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

-- Property viewings table
CREATE TABLE IF NOT EXISTS public.property_viewings (
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

-- Roommate requests table
CREATE TABLE IF NOT EXISTS public.roommate_requests (
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

-- -----------------------------------------------------
-- Part 2: Missing Tables from ADD_MISSING_TABLES.sql
-- -----------------------------------------------------

-- Admin settings table
CREATE TABLE IF NOT EXISTS public.admin_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key VARCHAR(255) UNIQUE NOT NULL,
    setting_value TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Exchange rates table
CREATE TABLE IF NOT EXISTS public.exchange_rates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rates JSONB NOT NULL,
    source VARCHAR(50) DEFAULT 'manual',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- -----------------------------------------------------
-- Part 3: Student KYC Table from STUDENT_KYC_SETUP.sql
-- -----------------------------------------------------

CREATE TABLE IF NOT EXISTS public.student_kyc (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    full_name VARCHAR(200) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender VARCHAR(20) CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
    phone_number VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,
    current_address TEXT NOT NULL,
    state_of_origin VARCHAR(100) NOT NULL,
    lga_of_origin VARCHAR(100) NOT NULL,
    student_status VARCHAR(50) NOT NULL CHECK (student_status IN ('current_student', 'prospective_student', 'recent_graduate')),
    institution_name VARCHAR(200) NOT NULL,
    institution_state VARCHAR(100) NOT NULL,
    student_id_number VARCHAR(100),
    matriculation_number VARCHAR(100),
    admission_year INTEGER,
    expected_graduation_year INTEGER,
    course_of_study VARCHAR(200),
    level_of_study VARCHAR(50) CHECK (level_of_study IN ('100', '200', '300', '400', '500', '600', 'postgraduate', 'diploma')),
    id_type VARCHAR(50) NOT NULL CHECK (id_type IN ('nin', 'voters_card', 'drivers_license', 'international_passport', 'student_id')),
    id_number VARCHAR(100) NOT NULL,
    id_document_url TEXT,
    student_id_card_url TEXT,
    admission_letter_url TEXT,
    school_id_card_url TEXT,
    current_semester_receipt_url TEXT,
    guardian_name VARCHAR(200),
    guardian_phone VARCHAR(20),
    guardian_relationship VARCHAR(100),
    guardian_address TEXT,
    verification_status VARCHAR(50) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'under_review', 'verified', 'rejected', 'requires_update')),
    verification_level VARCHAR(50) DEFAULT 'basic' CHECK (verification_level IN ('basic', 'standard', 'premium')),
    reviewed_by UUID REFERENCES auth.users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    admin_notes TEXT,
    risk_score INTEGER DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
    risk_flags TEXT[],
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    verified_at TIMESTAMP WITH TIME ZONE,
    ip_address INET,
    user_agent TEXT,
    submission_source VARCHAR(50) DEFAULT 'web'
);

-- -----------------------------------------------------
-- Part 4: Locations Table from LOCATION_MANAGEMENT_SETUP.sql
-- -----------------------------------------------------

CREATE TABLE IF NOT EXISTS public.locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- -----------------------------------------------------
-- Part 5: Performance Indexes
-- -----------------------------------------------------

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON public.profiles(user_type);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);

-- Universities indexes
CREATE INDEX IF NOT EXISTS idx_universities_city ON public.universities(city);
CREATE INDEX IF NOT EXISTS idx_universities_state ON public.universities(state);
CREATE INDEX IF NOT EXISTS idx_universities_is_active ON public.universities(is_active);
CREATE INDEX IF NOT EXISTS idx_universities_name ON public.universities(name);

-- Properties indexes
CREATE INDEX IF NOT EXISTS idx_properties_owner_id ON public.properties(owner_id);
CREATE INDEX IF NOT EXISTS idx_properties_status ON public.properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_property_type ON public.properties(property_type);
CREATE INDEX IF NOT EXISTS idx_properties_price ON public.properties(price);
CREATE INDEX IF NOT EXISTS idx_properties_city ON public.properties(city);
CREATE INDEX IF NOT EXISTS idx_properties_state ON public.properties(state);
CREATE INDEX IF NOT EXISTS idx_properties_university_name ON public.properties(university_name);
CREATE INDEX IF NOT EXISTS idx_properties_distance_to_campus ON public.properties(distance_to_campus);
CREATE INDEX IF NOT EXISTS idx_properties_created_at ON public.properties(created_at);
CREATE INDEX IF NOT EXISTS idx_properties_is_featured ON public.properties(is_featured);
CREATE INDEX IF NOT EXISTS idx_properties_furnished ON public.properties(furnished);
CREATE INDEX IF NOT EXISTS idx_properties_utilities_included ON public.properties(utilities_included);
CREATE INDEX IF NOT EXISTS idx_properties_lot_size ON public.properties(lot_size);

-- Property inquiries indexes
CREATE INDEX IF NOT EXISTS idx_property_inquiries_property_id ON public.property_inquiries(property_id);
CREATE INDEX IF NOT EXISTS idx_property_inquiries_user_id ON public.property_inquiries(user_id);
CREATE INDEX IF NOT EXISTS idx_property_inquiries_status ON public.property_inquiries(status);
CREATE INDEX IF NOT EXISTS idx_property_inquiries_university ON public.property_inquiries(university);
CREATE INDEX IF NOT EXISTS idx_property_inquiries_created_at ON public.property_inquiries(created_at);

-- Testimonials indexes
CREATE INDEX IF NOT EXISTS idx_testimonials_user_id ON public.testimonials(user_id);
CREATE INDEX IF NOT EXISTS idx_testimonials_property_id ON public.testimonials(property_id);
CREATE INDEX IF NOT EXISTS idx_testimonials_is_approved ON public.testimonials(is_approved);
CREATE INDEX IF NOT EXISTS idx_testimonials_is_featured ON public.testimonials(is_featured);
CREATE INDEX IF NOT EXISTS idx_testimonials_university ON public.testimonials(university);

-- Blog posts indexes
CREATE INDEX IF NOT EXISTS idx_blog_posts_author_id ON public.blog_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON public.blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON public.blog_posts(published_at);
CREATE INDEX IF NOT EXISTS idx_blog_posts_is_featured ON public.blog_posts(is_featured);

-- Property favorites indexes
CREATE INDEX IF NOT EXISTS idx_property_favorites_user_id ON public.property_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_property_favorites_property_id ON public.property_favorites(property_id);

-- Property views indexes
CREATE INDEX IF NOT EXISTS idx_property_views_property_id ON public.property_views(property_id);
CREATE INDEX IF NOT EXISTS idx_property_views_user_id ON public.property_views(user_id);
CREATE INDEX IF NOT EXISTS idx_property_views_viewed_at ON public.property_views(viewed_at);

-- User settings indexes
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON public.user_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_settings_category ON public.user_settings(category);

-- KYC documents indexes
CREATE INDEX IF NOT EXISTS idx_kyc_documents_user_id ON public.kyc_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_kyc_documents_status ON public.kyc_documents(verification_status);
CREATE INDEX IF NOT EXISTS idx_kyc_documents_type ON public.kyc_documents(document_type);

-- Revenue records indexes
CREATE INDEX IF NOT EXISTS idx_revenue_records_user_id ON public.revenue_records(user_id);
CREATE INDEX IF NOT EXISTS idx_revenue_records_property_id ON public.revenue_records(property_id);
CREATE INDEX IF NOT EXISTS idx_revenue_records_transaction_type ON public.revenue_records(transaction_type);
CREATE INDEX IF NOT EXISTS idx_revenue_records_status ON public.revenue_records(status);
CREATE INDEX IF NOT EXISTS idx_revenue_records_transaction_date ON public.revenue_records(transaction_date);

-- Property transactions indexes
CREATE INDEX IF NOT EXISTS idx_property_transactions_property_id ON public.property_transactions(property_id);
CREATE INDEX IF NOT EXISTS idx_property_transactions_tenant_id ON public.property_transactions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_property_transactions_landlord_id ON public.property_transactions(landlord_id);
CREATE INDEX IF NOT EXISTS idx_property_transactions_status ON public.property_transactions(status);
CREATE INDEX IF NOT EXISTS idx_property_transactions_lease_start_date ON public.property_transactions(lease_start_date);
CREATE INDEX IF NOT EXISTS idx_property_transactions_semester ON public.property_transactions(semester);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at);

-- Audit logs indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON public.audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at);

-- Subscription plans indexes
CREATE INDEX IF NOT EXISTS idx_subscription_plans_is_active ON public.subscription_plans(is_active);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_sort_order ON public.subscription_plans(sort_order);

-- User subscriptions indexes
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_plan_id ON public.user_subscriptions(plan_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON public.user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_current_period_end ON public.user_subscriptions(current_period_end);

-- Property documents indexes
CREATE INDEX IF NOT EXISTS idx_property_documents_property_id ON public.property_documents(property_id);
CREATE INDEX IF NOT EXISTS idx_property_documents_document_type ON public.property_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_property_documents_uploaded_by ON public.property_documents(uploaded_by);

-- Saved searches indexes
CREATE INDEX IF NOT EXISTS idx_saved_searches_user_id ON public.saved_searches(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_searches_is_alert_enabled ON public.saved_searches(is_alert_enabled);

-- Property comparisons indexes
CREATE INDEX IF NOT EXISTS idx_property_comparisons_user_id ON public.property_comparisons(user_id);

-- Conversations and messages indexes
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON public.conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_property_id ON public.conversations(property_id);
CREATE INDEX IF NOT EXISTS idx_conversations_status ON public.conversations(status);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at ON public.conversations(last_message_at);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_type ON public.messages(sender_type);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_read_at ON public.messages(read_at);

-- Property applications indexes
CREATE INDEX IF NOT EXISTS idx_property_applications_user_id ON public.property_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_property_applications_property_id ON public.property_applications(property_id);
CREATE INDEX IF NOT EXISTS idx_property_applications_status ON public.property_applications(status);
CREATE INDEX IF NOT EXISTS idx_property_applications_university ON public.property_applications(university);
CREATE INDEX IF NOT EXISTS idx_property_applications_application_type ON public.property_applications(application_type);
CREATE INDEX IF NOT EXISTS idx_property_applications_submitted_date ON public.property_applications(submitted_date);

-- Property viewings indexes
CREATE INDEX IF NOT EXISTS idx_property_viewings_property_id ON public.property_viewings(property_id);
CREATE INDEX IF NOT EXISTS idx_property_viewings_user_id ON public.property_viewings(user_id);
CREATE INDEX IF NOT EXISTS idx_property_viewings_viewing_date ON public.property_viewings(viewing_date);
CREATE INDEX IF NOT EXISTS idx_property_viewings_status ON public.property_viewings(status);

-- Roommate requests indexes
CREATE INDEX IF NOT EXISTS idx_roommate_requests_user_id ON public.roommate_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_roommate_requests_university ON public.roommate_requests(university);
CREATE INDEX IF NOT EXISTS idx_roommate_requests_status ON public.roommate_requests(status);
CREATE INDEX IF NOT EXISTS idx_roommate_requests_graduation_year ON public.roommate_requests(graduation_year);
CREATE INDEX IF NOT EXISTS idx_roommate_requests_budget_min ON public.roommate_requests(budget_min);
CREATE INDEX IF NOT EXISTS idx_roommate_requests_budget_max ON public.roommate_requests(budget_max);

-- Admin settings index
CREATE INDEX IF NOT EXISTS idx_admin_settings_key ON public.admin_settings(setting_key);

-- Exchange rates index
CREATE INDEX IF NOT EXISTS idx_exchange_rates_updated_at ON public.exchange_rates(updated_at DESC);

-- Student KYC indexes
CREATE INDEX IF NOT EXISTS idx_student_kyc_user_id ON public.student_kyc(user_id);
CREATE INDEX IF NOT EXISTS idx_student_kyc_status ON public.student_kyc(verification_status);
CREATE INDEX IF NOT EXISTS idx_student_kyc_institution ON public.student_kyc(institution_name);
CREATE INDEX IF NOT EXISTS idx_student_kyc_submitted_at ON public.student_kyc(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_student_kyc_verification_level ON public.student_kyc(verification_level);

-- Locations indexes
CREATE INDEX IF NOT EXISTS idx_locations_is_prime ON public.locations(is_prime) WHERE is_prime = TRUE;
CREATE INDEX IF NOT EXISTS idx_locations_is_active ON public.locations(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_locations_display_order ON public.locations(display_order);
CREATE INDEX IF NOT EXISTS idx_locations_city ON public.locations(city);
CREATE INDEX IF NOT EXISTS idx_locations_state ON public.locations(state);

-- -----------------------------------------------------
-- Part 6: Row Level Security (RLS) Policies
-- -----------------------------------------------------

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.universities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supported_currencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kyc_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenue_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_comparisons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_viewings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roommate_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exchange_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_kyc ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Universities policies
CREATE POLICY "Anyone can view active universities" ON public.universities FOR SELECT USING (is_active = true);

-- Properties policies
CREATE POLICY "Anyone can view available properties" ON public.properties FOR SELECT USING (status = 'available' OR auth.uid() = owner_id);
CREATE POLICY "Property owners can manage their properties" ON public.properties FOR ALL USING (auth.uid() = owner_id);
CREATE POLICY "Admins can manage all properties" ON public.properties FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.user_type = 'admin'
    )
);

-- Property inquiries policies
CREATE POLICY "Users can view their own inquiries" ON public.property_inquiries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Property owners can view inquiries for their properties" ON public.property_inquiries FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.properties 
        WHERE properties.id = property_inquiries.property_id 
        AND properties.owner_id = auth.uid()
    )
);
CREATE POLICY "Anyone can create inquiries" ON public.property_inquiries FOR INSERT WITH CHECK (true);

-- Property favorites policies
CREATE POLICY "Users can manage their own favorites" ON public.property_favorites FOR ALL USING (auth.uid() = user_id);

-- Property views policies
CREATE POLICY "Anyone can create property views" ON public.property_views FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view their own property views" ON public.property_views FOR SELECT USING (auth.uid() = user_id);

-- Property viewings policies
CREATE POLICY "Users can view their own viewings" ON public.property_viewings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Property owners can view viewings for their properties" ON public.property_viewings FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.properties 
        WHERE properties.id = property_viewings.property_id 
        AND properties.owner_id = auth.uid()
    )
);
CREATE POLICY "Anyone can create viewings" ON public.property_viewings FOR INSERT WITH CHECK (true);

-- System settings policies
CREATE POLICY "Anyone can view system settings" ON public.system_settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage system settings" ON public.system_settings FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.user_type = 'admin'
    )
);

-- Supported currencies policies
CREATE POLICY "Anyone can view currencies" ON public.supported_currencies FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage currencies" ON public.supported_currencies FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.user_type = 'admin'
    )
);

-- User settings policies
CREATE POLICY "Users can manage their own settings" ON public.user_settings FOR ALL USING (auth.uid() = user_id);

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- Property applications policies
CREATE POLICY "Users can view their own applications" ON public.property_applications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Property owners can view applications for their properties" ON public.property_applications FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.properties 
        WHERE properties.id = property_applications.property_id 
        AND properties.owner_id = auth.uid()
    )
);
CREATE POLICY "Anyone can create applications" ON public.property_applications FOR INSERT WITH CHECK (true);

-- Roommate requests policies
CREATE POLICY "Users can manage their own roommate requests" ON public.roommate_requests FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Anyone can view active roommate requests" ON public.roommate_requests FOR SELECT USING (status = 'active');

-- Saved searches policies
CREATE POLICY "Users can manage their own saved searches" ON public.saved_searches FOR ALL USING (auth.uid() = user_id);

-- Search history policies
CREATE POLICY "Users can view their own search history" ON public.search_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create search history" ON public.search_history FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Property comparisons policies
CREATE POLICY "Users can manage their own comparisons" ON public.property_comparisons FOR ALL USING (auth.uid() = user_id);

-- Conversations and messages policies
CREATE POLICY "Users can view their own conversations" ON public.conversations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create conversations" ON public.conversations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view messages in their conversations" ON public.messages FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.conversations 
        WHERE conversations.id = messages.conversation_id 
        AND conversations.user_id = auth.uid()
    )
);
CREATE POLICY "Users can send messages in their conversations" ON public.messages FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.conversations 
        WHERE conversations.id = messages.conversation_id 
        AND conversations.user_id = auth.uid()
    )
);

-- Admin settings policies
CREATE POLICY "Anyone can view admin settings" ON public.admin_settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage admin settings" ON public.admin_settings FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.user_type = 'admin'
    )
);

-- Exchange rates policies
CREATE POLICY "Anyone can view exchange rates" ON public.exchange_rates FOR SELECT USING (true);
CREATE POLICY "Admins can manage exchange rates" ON public.exchange_rates FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.user_type = 'admin'
    )
);

-- Student KYC policies
CREATE POLICY "Users can view own KYC" ON public.student_kyc FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own KYC" ON public.student_kyc FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own pending KYC" ON public.student_kyc FOR UPDATE USING (auth.uid() = user_id AND verification_status IN ('pending', 'requires_update'));
CREATE POLICY "Admins can view all KYC" ON public.student_kyc FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.user_type = 'admin'
    )
);
CREATE POLICY "Admins can update any KYC" ON public.student_kyc FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.user_type = 'admin'
    )
);

-- Locations policies
CREATE POLICY "Public can view active locations" ON public.locations FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Admins can manage locations" ON public.locations FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.user_type = 'admin'
    )
);

-- -----------------------------------------------------
-- Part 7: Triggers and Functions
-- -----------------------------------------------------

-- Function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
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
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Student KYC updated at function
CREATE OR REPLACE FUNCTION public.update_student_kyc_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_student_kyc_updated_at_trigger ON public.student_kyc;
CREATE TRIGGER update_student_kyc_updated_at_trigger
    BEFORE UPDATE ON public.student_kyc
    FOR EACH ROW
    EXECUTE FUNCTION public.update_student_kyc_updated_at();

-- Function to calculate KYC risk score
CREATE OR REPLACE FUNCTION public.calculate_kyc_risk_score(kyc_id UUID)
RETURNS INTEGER AS $$
DECLARE
    risk_score INTEGER := 0;
    kyc_record RECORD;
BEGIN
    SELECT * INTO kyc_record FROM public.student_kyc WHERE id = kyc_id;
    
    IF kyc_record.id_document_url IS NULL THEN
        risk_score := risk_score + 20;
    END IF;
    
    IF kyc_record.student_id_card_url IS NULL THEN
        risk_score := risk_score + 15;
    END IF;
    
    IF kyc_record.admission_letter_url IS NULL AND kyc_record.student_status = 'current_student' THEN
        risk_score := risk_score + 10;
    END IF;
    
    IF kyc_record.guardian_name IS NULL OR kyc_record.guardian_phone IS NULL THEN
        risk_score := risk_score + 10;
    END IF;
    
    IF EXTRACT(YEAR FROM AGE(kyc_record.date_of_birth)) < 16 THEN
        risk_score := risk_score + 30;
    END IF;
    
    IF EXTRACT(YEAR FROM AGE(kyc_record.date_of_birth)) > 35 THEN
        risk_score := risk_score + 15;
    END IF;
    
    IF risk_score > 100 THEN
        risk_score := 100;
    END IF;
    
    RETURN risk_score;
END;
$$ LANGUAGE plpgsql;

-- Student KYC summary view
CREATE OR REPLACE VIEW public.student_kyc_summary AS
SELECT 
    k.id,
    k.user_id,
    k.full_name,
    k.email,
    k.phone_number,
    k.student_status,
    k.institution_name,
    k.verification_status,
    k.verification_level,
    k.risk_score,
    k.submitted_at,
    k.verified_at,
    p.avatar_url,
    COUNT(CASE WHEN k.id_document_url IS NOT NULL THEN 1 END) +
    COUNT(CASE WHEN k.student_id_card_url IS NOT NULL THEN 1 END) +
    COUNT(CASE WHEN k.admission_letter_url IS NOT NULL THEN 1 END) +
    COUNT(CASE WHEN k.school_id_card_url IS NOT NULL THEN 1 END) +
    COUNT(CASE WHEN k.current_semester_receipt_url IS NOT NULL THEN 1 END) as documents_count
FROM public.student_kyc k
LEFT JOIN public.profiles p ON k.user_id = p.id
GROUP BY k.id, k.user_id, k.full_name, k.email, k.phone_number, k.student_status, 
         k.institution_name, k.verification_status, k.verification_level, k.risk_score, 
         k.submitted_at, k.verified_at, p.avatar_url;

-- Function to generate location slug
CREATE OR REPLACE FUNCTION public.generate_location_slug()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
        NEW.slug := lower(regexp_replace(NEW.name, '[^a-zA-Z0-9]+', '-', 'g'));
        NEW.slug := trim(both '-' from NEW.slug);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for location slug
DROP TRIGGER IF EXISTS trigger_generate_location_slug ON public.locations;
CREATE TRIGGER trigger_generate_location_slug
    BEFORE INSERT OR UPDATE ON public.locations
    FOR EACH ROW
    EXECUTE FUNCTION public.generate_location_slug();

-- Function to update location property count and average price
CREATE OR REPLACE FUNCTION public.update_location_property_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.locations
    SET property_count = (
        SELECT COUNT(*)
        FROM public.properties
        WHERE city = locations.city
        AND state = locations.state
        AND status IN ('available', 'pending')
    ),
    average_price = (
        SELECT AVG(price)
        FROM public.properties
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

-- Trigger for location stats
DROP TRIGGER IF EXISTS trigger_update_location_stats ON public.properties;
CREATE TRIGGER trigger_update_location_stats
    AFTER INSERT OR UPDATE OR DELETE ON public.properties
    FOR EACH ROW
    EXECUTE FUNCTION public.update_location_property_count();

-- Function to update locations updated_at
CREATE OR REPLACE FUNCTION public.update_locations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_locations_updated_at ON public.locations;
CREATE TRIGGER trigger_locations_updated_at
    BEFORE UPDATE ON public.locations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_locations_updated_at();

-- -----------------------------------------------------
-- Part 8: Storage Buckets and Policies
-- -----------------------------------------------------

-- KYC Documents Bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'kyc-documents',
  'kyc-documents',
  false,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'application/pdf'];

DROP POLICY IF EXISTS "Users can upload own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can read own documents" ON storage.objects;
DROP POLICY IF EXISTS "Admins can read all documents" ON storage.objects;

CREATE POLICY "Users can upload own documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'kyc-documents' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can read own documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'kyc-documents' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Admins can read all documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'kyc-documents'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.user_type = 'admin'
  )
);

-- Property Images Bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'property-images',
  'property-images',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

DROP POLICY IF EXISTS "Anyone can view property images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload property images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own property images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own property images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete any property images" ON storage.objects;

CREATE POLICY "Anyone can view property images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'property-images');

CREATE POLICY "Authenticated users can upload property images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'property-images');

CREATE POLICY "Users can update own property images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'property-images'
  AND auth.uid() = owner
);

CREATE POLICY "Users can delete own property images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'property-images'
  AND auth.uid() = owner
);

CREATE POLICY "Admins can delete any property images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'property-images'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.user_type = 'admin'
  )
);

-- Location Images Bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('location-images', 'location-images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public can view location images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload location images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update location images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete location images" ON storage.objects;

CREATE POLICY "Public can view location images"
ON storage.objects FOR SELECT
USING (bucket_id = 'location-images');

CREATE POLICY "Admins can upload location images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'location-images'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.user_type = 'admin'
  )
);

CREATE POLICY "Admins can update location images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'location-images'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.user_type = 'admin'
  )
);

CREATE POLICY "Admins can delete location images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'location-images'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.user_type = 'admin'
  )
);

-- -----------------------------------------------------
-- Part 9: Initial Data
-- -----------------------------------------------------

-- Insert system settings
INSERT INTO public.system_settings (key, value, description) VALUES
    ('site_name', '"Tonys Estate"', 'Name of the website'),
    ('site_description', '"Your trusted partner in real estate"', 'Website description'),
    ('contact_email', '"info@tonysestate.com"', 'Main contact email'),
    ('contact_phone', '"+1 (555) 123-4567"', 'Main contact phone'),
    ('office_address', '"123 Main St, Lagos, Nigeria"', 'Office address'),
    ('default_currency', '"USD"', 'Default currency for the platform'),
    ('max_property_images', '10', 'Maximum number of images per property'),
    ('property_approval_required', 'true', 'Whether properties need admin approval')
ON CONFLICT (key) DO NOTHING;

-- Insert supported currencies
INSERT INTO public.supported_currencies (code, name, symbol, is_default, is_active) VALUES
    ('USD', 'US Dollar', '$', true, true),
    ('EUR', 'Euro', '€', false, true),
    ('GBP', 'British Pound', '£', false, true),
    ('CAD', 'Canadian Dollar', 'C$', false, true),
    ('AUD', 'Australian Dollar', 'A$', false, true),
    ('NGN', 'Nigerian Naira', '₦', false, true)
ON CONFLICT (code) DO NOTHING;

-- Insert sample universities
INSERT INTO public.universities (name, city, state, student_population, is_active) VALUES
    ('University of Lagos', 'Lagos', 'Lagos', 45000, true),
    ('Obafemi Awolowo University', 'Ile-Ife', 'Osun', 35000, true),
    ('University of Ibadan', 'Ibadan', 'Oyo', 42000, true),
    ('Covenant University', 'Ota', 'Ogun', 12000, true),
    ('University of Nigeria', 'Nsukka', 'Enugu', 40000, true)
ON CONFLICT DO NOTHING;

-- Insert sample subscription plans
INSERT INTO public.subscription_plans (name, description, price, billing_cycle, features, max_properties, max_featured_properties, max_images_per_property, sort_order) VALUES
    ('Basic', 'Perfect for individual property owners', 9.99, 'monthly', '["Basic listing", "Up to 5 photos", "Email support"]', 3, 0, 5, 1),
    ('Pro', 'Great for property managers', 29.99, 'monthly', '["Unlimited listings", "Up to 10 photos per property", "Featured listings", "Priority support", "Analytics"]', 25, 5, 10, 2),
    ('Enterprise', 'For large property management companies', 99.99, 'monthly', '["Unlimited everything", "Custom branding", "API access", "Dedicated support", "Advanced analytics"]', -1, -1, 20, 3)
ON CONFLICT DO NOTHING;

-- Insert default admin settings
INSERT INTO public.admin_settings (setting_key, setting_value, description) VALUES
    ('default_currency', 'USD', 'Default currency for the platform')
ON CONFLICT (setting_key) DO NOTHING;

-- Insert initial exchange rates
INSERT INTO public.exchange_rates (rates, source) VALUES
    ('{
        "USD": 1.0,
        "EUR": 0.85,
        "GBP": 0.73,
        "CAD": 1.25,
        "AUD": 1.35,
        "NGN": 1500.00
    }'::jsonb, 'manual')
ON CONFLICT DO NOTHING;

-- Insert sample locations
INSERT INTO public.locations (name, city, state, country, description, is_prime, display_order, is_active) VALUES
    ('Lagos Island', 'Lagos', 'Lagos', 'Nigeria', 'The commercial heart of Lagos with premium properties and waterfront views', true, 1, true),
    ('Lekki', 'Lagos', 'Lagos', 'Nigeria', 'Upscale residential area with modern amenities and beach access', true, 2, true),
    ('Victoria Island', 'Lagos', 'Lagos', 'Nigeria', 'Prime business district with luxury apartments and penthouses', true, 3, true),
    ('Ikoyi', 'Lagos', 'Lagos', 'Nigeria', 'Exclusive neighborhood known for high-end properties', true, 4, true),
    ('Abuja Central', 'Abuja', 'FCT', 'Nigeria', 'The capital city center with government buildings and embassies', true, 5, true),
    ('Maitama', 'Abuja', 'FCT', 'Nigeria', 'Prestigious district with diplomatic residences', true, 6, true),
    ('Ikeja', 'Lagos', 'Lagos', 'Nigeria', 'Lagos state capital with commercial and residential properties', false, 7, true),
    ('Surulere', 'Lagos', 'Lagos', 'Nigeria', 'Vibrant neighborhood with diverse housing options', false, 8, true),
    ('Yaba', 'Lagos', 'Lagos', 'Nigeria', 'Tech hub with affordable housing', false, 9, true),
    ('Ajah', 'Lagos', 'Lagos', 'Nigeria', 'Rapidly developing area with new estates', false, 10, true),
    ('Wuse', 'Abuja', 'FCT', 'Nigeria', 'Commercial district with shopping and business centers', false, 11, true),
    ('Garki', 'Abuja', 'FCT', 'Nigeria', 'Residential area with government quarters', false, 12, true),
    ('Gwarinpa', 'Abuja', 'FCT', 'Nigeria', 'Largest estate in West Africa', false, 13, true),
    ('GRA', 'Port Harcourt', 'Rivers', 'Nigeria', 'Government Reserved Area with premium properties', false, 14, true),
    ('Trans Amadi', 'Port Harcourt', 'Rivers', 'Nigeria', 'Industrial and residential area', false, 15, true),
    ('Bodija', 'Ibadan', 'Oyo', 'Nigeria', 'Upscale residential area', false, 16, true),
    ('Jericho', 'Ibadan', 'Oyo', 'Nigeria', 'Modern residential estate', false, 17, true),
    ('Independence Layout', 'Enugu', 'Enugu', 'Nigeria', 'Prime residential area', false, 18, true),
    ('GRA', 'Enugu', 'Enugu', 'Nigeria', 'Government Reserved Area', false, 19, true),
    ('Asokoro', 'Abuja', 'FCT', 'Nigeria', 'Elite residential district', false, 20, true)
ON CONFLICT (name) DO NOTHING;

-- -----------------------------------------------------
-- Part 10: Comments and Final Messages
-- -----------------------------------------------------

COMMENT ON TABLE public.student_kyc IS 'Student KYC verification data for Nigerian students';
COMMENT ON COLUMN public.student_kyc.verification_status IS 'pending: awaiting review, under_review: being reviewed, verified: approved, rejected: not approved, requires_update: needs more info';
COMMENT ON COLUMN public.student_kyc.verification_level IS 'basic: minimal verification, standard: full verification, premium: enhanced verification with guarantor';
COMMENT ON COLUMN public.student_kyc.risk_score IS 'Risk assessment score from 0 (low risk) to 100 (high risk)';
COMMENT ON COLUMN public.properties.lot_size IS 'Size of the property lot/land in square feet';

-- Success message
DO $$
BEGIN
    RAISE NOTICE '=====================================================';
    RAISE NOTICE '✅ TONIES ESTATE COMPLETE DATABASE SETUP COMPLETE!';
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'Created:';
    RAISE NOTICE '- All core tables for Tonies Estate platform';
    RAISE NOTICE '- Performance indexes for all tables';
    RAISE NOTICE '- Row Level Security policies';
    RAISE NOTICE '- User profile creation trigger';
    RAISE NOTICE '- Student KYC system';
    RAISE NOTICE '- Location management system';
    RAISE NOTICE '- Storage buckets for KYC docs, property images, and location images';
    RAISE NOTICE '- Sample universities, locations, currencies, and subscription plans';
    RAISE NOTICE '- Roommate matching system';
    RAISE NOTICE '=====================================================';
END $$;

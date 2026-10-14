-- =====================================================
-- CAMPUS COMFORT AGENT REGISTRATION & APPLICATION SETUP
-- =====================================================

-- 1. Create agent_applications table
CREATE TABLE IF NOT EXISTS public.agent_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    campus_location VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    institution VARCHAR(200),
    code_of_conduct_agreed BOOLEAN DEFAULT true,
    payment_amount NUMERIC DEFAULT 2000,
    payment_reference VARCHAR(150),
    payment_sender_name VARCHAR(255),
    payment_proof_url TEXT,
    payment_status VARCHAR(50) DEFAULT 'submitted',
    status VARCHAR(50) DEFAULT 'pending_approval' CHECK (status IN ('pending_approval', 'approved', 'rejected')),
    rejection_reason TEXT,
    admin_notes TEXT,
    reviewed_by UUID REFERENCES auth.users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create agent_daily_reports table (Matching Campus Comfort Daily Report Template)
CREATE TABLE IF NOT EXISTS public.agent_daily_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    agent_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    campus_area VARCHAR(100) NOT NULL,
    report_date DATE NOT NULL DEFAULT CURRENT_DATE,
    people_approached INTEGER DEFAULT 0,
    successful_clients_count INTEGER DEFAULT 0,
    total_money_collected NUMERIC DEFAULT 0,
    client_records JSONB DEFAULT '[]'::jsonb,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Insert or configure default Agent Registration Bank Details in admin_settings
INSERT INTO public.admin_settings (setting_key, setting_value, description)
VALUES (
    'agent_registration_bank_details',
    '{"bankName":"Moniepoint MFB","accountNumber":"8032145678","accountName":"Campus Comfort Real Estate Ltd","registrationFee":2000,"instructions":"Transfer ₦2,000 to the official Campus Comfort account. Use your full name as the payment narration/reference."}',
    'Official bank details presented to prospective agents for registration fee payment'
)
ON CONFLICT (setting_key) DO UPDATE
SET updated_at = NOW();

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.agent_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_daily_reports ENABLE ROW LEVEL SECURITY;

-- 5. Policies for agent_applications
DROP POLICY IF EXISTS "Public or applicant can insert application" ON public.agent_applications;
CREATE POLICY "Public or applicant can insert application"
    ON public.agent_applications FOR INSERT
    WITH CHECK (true);

DROP POLICY IF EXISTS "Applicant can read own application" ON public.agent_applications;
CREATE POLICY "Applicant can read own application"
    ON public.agent_applications FOR SELECT
    USING (auth.uid() = user_id OR auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins can do everything on agent_applications" ON public.agent_applications;
CREATE POLICY "Admins can do everything on agent_applications"
    ON public.agent_applications FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.user_type = 'admin'
        )
    );

-- 6. Policies for agent_daily_reports
DROP POLICY IF EXISTS "Agents can manage own reports" ON public.agent_daily_reports;
CREATE POLICY "Agents can manage own reports"
    ON public.agent_daily_reports FOR ALL
    USING (auth.uid() = agent_id);

DROP POLICY IF EXISTS "Admins can view all daily reports" ON public.agent_daily_reports;
CREATE POLICY "Admins can view all daily reports"
    ON public.agent_daily_reports FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.user_type = 'admin'
        )
    );

-- Student KYC (Know Your Customer) System for Nigerian Students
-- This system verifies student identity for Campus Comfort platform

-- Create student_kyc table
CREATE TABLE IF NOT EXISTS public.student_kyc (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    
    -- Personal Information
    full_name VARCHAR(200) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender VARCHAR(20) CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
    phone_number VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,
    
    -- Address Information
    current_address TEXT NOT NULL,
    state_of_origin VARCHAR(100) NOT NULL,
    lga_of_origin VARCHAR(100) NOT NULL,
    
    -- Student Information
    student_status VARCHAR(50) NOT NULL CHECK (student_status IN ('current_student', 'prospective_student', 'recent_graduate')),
    institution_name VARCHAR(200) NOT NULL,
    institution_state VARCHAR(100) NOT NULL,
    student_id_number VARCHAR(100),
    matriculation_number VARCHAR(100),
    admission_year INTEGER,
    expected_graduation_year INTEGER,
    course_of_study VARCHAR(200),
    level_of_study VARCHAR(50) CHECK (level_of_study IN ('100', '200', '300', '400', '500', '600', 'postgraduate', 'diploma')),
    
    -- Identification Documents
    id_type VARCHAR(50) NOT NULL CHECK (id_type IN ('nin', 'voters_card', 'drivers_license', 'international_passport', 'student_id')),
    id_number VARCHAR(100) NOT NULL,
    id_document_url TEXT,
    
    -- Student Verification Documents
    student_id_card_url TEXT,
    admission_letter_url TEXT,
    school_id_card_url TEXT,
    current_semester_receipt_url TEXT,
    
    -- Guardian/Next of Kin Information
    guardian_name VARCHAR(200),
    guardian_phone VARCHAR(20),
    guardian_relationship VARCHAR(100),
    guardian_address TEXT,
    
    -- Verification Status
    verification_status VARCHAR(50) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'under_review', 'verified', 'rejected', 'requires_update')),
    verification_level VARCHAR(50) DEFAULT 'basic' CHECK (verification_level IN ('basic', 'standard', 'premium')),
    
    -- Admin Review
    reviewed_by UUID REFERENCES auth.users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    admin_notes TEXT,
    
    -- Risk Assessment
    risk_score INTEGER DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
    risk_flags TEXT[], -- Array of risk indicators
    
    -- Timestamps
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    verified_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    ip_address INET,
    user_agent TEXT,
    submission_source VARCHAR(50) DEFAULT 'web'
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_student_kyc_user_id ON public.student_kyc(user_id);
CREATE INDEX IF NOT EXISTS idx_student_kyc_status ON public.student_kyc(verification_status);
CREATE INDEX IF NOT EXISTS idx_student_kyc_institution ON public.student_kyc(institution_name);
CREATE INDEX IF NOT EXISTS idx_student_kyc_submitted_at ON public.student_kyc(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_student_kyc_verification_level ON public.student_kyc(verification_level);

-- Enable Row Level Security
ALTER TABLE public.student_kyc ENABLE ROW LEVEL SECURITY;

-- Policies

-- Users can view their own KYC
CREATE POLICY "Users can view own KYC"
    ON public.student_kyc
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own KYC (one time)
CREATE POLICY "Users can insert own KYC"
    ON public.student_kyc
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own pending/requires_update KYC
CREATE POLICY "Users can update own pending KYC"
    ON public.student_kyc
    FOR UPDATE
    USING (
        auth.uid() = user_id 
        AND verification_status IN ('pending', 'requires_update')
    );

-- Admins can view all KYC
CREATE POLICY "Admins can view all KYC"
    ON public.student_kyc
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.user_type = 'admin'
        )
    );

-- Admins can update any KYC
CREATE POLICY "Admins can update KYC"
    ON public.student_kyc
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.user_type = 'admin'
        )
    );

-- Create function to update updated_at
CREATE OR REPLACE FUNCTION update_student_kyc_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS update_student_kyc_updated_at_trigger ON public.student_kyc;
CREATE TRIGGER update_student_kyc_updated_at_trigger
    BEFORE UPDATE ON public.student_kyc
    FOR EACH ROW
    EXECUTE FUNCTION update_student_kyc_updated_at();

-- Create function to calculate risk score
CREATE OR REPLACE FUNCTION calculate_kyc_risk_score(kyc_id UUID)
RETURNS INTEGER AS $$
DECLARE
    risk_score INTEGER := 0;
    kyc_record RECORD;
BEGIN
    SELECT * INTO kyc_record FROM public.student_kyc WHERE id = kyc_id;
    
    -- Missing documents increase risk
    IF kyc_record.id_document_url IS NULL THEN
        risk_score := risk_score + 20;
    END IF;
    
    IF kyc_record.student_id_card_url IS NULL THEN
        risk_score := risk_score + 15;
    END IF;
    
    IF kyc_record.admission_letter_url IS NULL AND kyc_record.student_status = 'current_student' THEN
        risk_score := risk_score + 10;
    END IF;
    
    -- Missing guardian info increases risk
    IF kyc_record.guardian_name IS NULL OR kyc_record.guardian_phone IS NULL THEN
        risk_score := risk_score + 10;
    END IF;
    
    -- Age verification (students typically 16-35)
    IF EXTRACT(YEAR FROM AGE(kyc_record.date_of_birth)) < 16 THEN
        risk_score := risk_score + 30;
    END IF;
    
    IF EXTRACT(YEAR FROM AGE(kyc_record.date_of_birth)) > 35 THEN
        risk_score := risk_score + 15;
    END IF;
    
    -- Cap at 100
    IF risk_score > 100 THEN
        risk_score := 100;
    END IF;
    
    RETURN risk_score;
END;
$$ LANGUAGE plpgsql;

-- Create view for admin dashboard
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

-- Grant permissions
GRANT ALL ON public.student_kyc TO authenticated;
GRANT SELECT ON public.student_kyc_summary TO authenticated;

-- Add comments
COMMENT ON TABLE public.student_kyc IS 'Student KYC verification data for Nigerian students';
COMMENT ON COLUMN public.student_kyc.verification_status IS 'pending: awaiting review, under_review: being reviewed, verified: approved, rejected: not approved, requires_update: needs more info';
COMMENT ON COLUMN public.student_kyc.verification_level IS 'basic: minimal verification, standard: full verification, premium: enhanced verification with guarantor';
COMMENT ON COLUMN public.student_kyc.risk_score IS 'Risk assessment score from 0 (low risk) to 100 (high risk)';

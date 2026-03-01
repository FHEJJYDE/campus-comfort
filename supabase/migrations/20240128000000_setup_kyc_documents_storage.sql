-- Migration: Setup KYC Documents Storage Bucket and RLS Policies
-- Description: Creates the kyc-documents storage bucket with proper configuration
--              and Row Level Security policies for student KYC document uploads
-- Requirements: 8.1, 8.2, 8.3, 8.4, 8.5

-- Create the kyc-documents storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'kyc-documents',
  'kyc-documents',
  false, -- Not publicly accessible
  5242880, -- 5MB limit (5 * 1024 * 1024 bytes)
  ARRAY['image/jpeg', 'image/png', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'application/pdf'];

-- Note: RLS is already enabled on storage.objects by default in Supabase
-- No need to enable it manually

-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Users can upload own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can read own documents" ON storage.objects;
DROP POLICY IF EXISTS "Admins can read all documents" ON storage.objects;

-- Policy 1: Users can upload documents to their own folder
-- Requirement 8.3: Students can only upload to their own user_id folder
CREATE POLICY "Users can upload own documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'kyc-documents' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 2: Users can read their own documents
-- Requirement 8.3: Students can only read documents in their own user_id folder
CREATE POLICY "Users can read own documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'kyc-documents' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 3: Admins can read all documents
-- Requirement 8.4: Admins can access all documents regardless of owner
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

-- Note: Public access is prevented by setting bucket.public = false
-- and not creating any policies for anon role (Requirement 8.5)

-- Migration: Setup Property Images Storage Bucket and RLS Policies
-- Description: Creates the property-images storage bucket with proper configuration
--              and Row Level Security policies for property image uploads

-- Create the property-images storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'property-images',
  'property-images',
  true, -- Publicly accessible (property images should be viewable by everyone)
  10485760, -- 10MB limit (10 * 1024 * 1024 bytes)
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

-- Note: RLS is already enabled on storage.objects by default in Supabase

-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Anyone can view property images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload property images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own property images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own property images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete any property images" ON storage.objects;

-- Policy 1: Anyone can view property images (public bucket)
CREATE POLICY "Anyone can view property images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'property-images');

-- Policy 2: Authenticated users can upload property images
CREATE POLICY "Authenticated users can upload property images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'property-images');

-- Policy 3: Users can update their own uploaded images
CREATE POLICY "Users can update own property images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'property-images'
  AND auth.uid() = owner
);

-- Policy 4: Users can delete their own uploaded images
CREATE POLICY "Users can delete own property images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'property-images'
  AND auth.uid() = owner
);

-- Policy 5: Admins can delete any property images
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

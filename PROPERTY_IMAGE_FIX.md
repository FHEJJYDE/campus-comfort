# Property Image Not Showing - Fix Guide

## Issue
Property "Selfcon" in Akpaden, Akwa Ibom shows no image on the listing page.

## Root Cause
The property was likely created before the `property-images` storage bucket was set up, or the image upload failed during creation.

## Solutions

### Solution 1: Re-upload Property Images (Recommended)

1. **Go to Admin Dashboard:**
   - Navigate to `/dashboard/admin/properties`

2. **Find the Property:**
   - Search for "Selfcon" or filter by location "Akwa Ibom"

3. **Edit the Property:**
   - Click on the property to edit it
   - Upload new images (up to 15 images)
   - Save the property

4. **Verify:**
   - Go back to the property listing page
   - The image should now display

### Solution 2: Check Database and Fix Manually

If you have access to Supabase:

1. **Go to Supabase Dashboard → Table Editor → properties**

2. **Find the property** (ID: `623b7b41-cd79-42b2-869a-93cb0dd13e37` from the URL)

3. **Check the `images` column:**
   - If it's `null` or `[]` (empty array), the property has no images
   - If it has URLs, check if they're valid

4. **Fix options:**
   - Delete the property and recreate it with images
   - Or manually upload images to storage and update the `images` column

### Solution 3: Add Default Property Images

For properties without images, you can add a default image:

1. **Create a default property image:**
   - Add a file `public/default-property.jpg` or use an existing one

2. **Update PropertyCard component** (already done):
   - The component now has better fallback handling
   - It will show `/placeholder.svg` when no image exists

### Solution 4: Bulk Fix All Properties Without Images

If you have multiple properties without images, you can:

1. **Create a migration script** to set default images for properties with empty image arrays

2. **Or use Supabase SQL Editor:**
```sql
-- Check properties without images
SELECT id, title, images 
FROM properties 
WHERE images IS NULL OR images = '[]'::jsonb;

-- Optionally set a default image for all properties without images
-- UPDATE properties 
-- SET images = '["https://your-default-image-url.jpg"]'::jsonb
-- WHERE images IS NULL OR images = '[]'::jsonb;
```

## Prevention

To prevent this in the future:

1. **Always run the storage bucket migrations first** before creating properties:
   - `supabase/migrations/20240128000001_setup_property_images_storage.sql`

2. **Make image upload required** in the property creation form (optional)

3. **Add validation** to ensure at least one image is uploaded before saving

## Current Status

✅ PropertyCard component updated with better image fallback handling
✅ Storage bucket migration created
⚠️ Existing properties without images need to be re-uploaded or edited

## Quick Fix for This Specific Property

Since you're the admin, the fastest fix is:

1. Go to: `http://localhost:8080/dashboard/admin/properties`
2. Find "Selfcon" property
3. Click Edit
4. Upload at least one image
5. Save

The image will then display correctly on both localhost and Vercel.

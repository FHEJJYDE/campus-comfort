# Property Listing Upload Fixes

## Issues Found

When trying to create a property listing, two errors occurred:

1. **"Failed to upload image: Bucket not found"**
   - The `property-images` storage bucket doesn't exist in Supabase

2. **"Failed to create listing: Database error: Could not find the 'lot_size' column of 'properties' in the schema cache"**
   - The `properties` table is missing the `lot_size` column

## Solutions

### 1. Property Images Storage Bucket

Created migration file: `supabase/migrations/20240128000001_setup_property_images_storage.sql`

This migration:
- Creates the `property-images` storage bucket
- Sets it as public (so property images are viewable by everyone)
- Configures 10MB file size limit
- Allows image formats: JPEG, JPG, PNG, WebP, GIF
- Sets up RLS policies:
  - Anyone can view property images
  - Authenticated users can upload images
  - Users can update/delete their own images
  - Admins can delete any images

### 2. Add lot_size Column

Created migration file: `supabase/migrations/20240128000002_add_lot_size_to_properties.sql`

This migration:
- Adds `lot_size` column to the `properties` table (INTEGER type)
- Adds index for performance
- Adds documentation comment

## How to Apply the Fixes

Run these SQL migration files in your Supabase SQL Editor in this order:

### Step 1: Create Property Images Storage Bucket
```sql
-- Copy and paste content from:
supabase/migrations/20240128000001_setup_property_images_storage.sql
```

### Step 2: Add lot_size Column
```sql
-- Copy and paste content from:
supabase/migrations/20240128000002_add_lot_size_to_properties.sql
```

## Verification

After running both migrations:

1. **Check Storage Bucket:**
   - Go to Supabase Dashboard → Storage
   - You should see `property-images` bucket listed
   - It should be marked as "Public"

2. **Check Properties Table:**
   - Go to Supabase Dashboard → Table Editor → properties
   - You should see the `lot_size` column

3. **Test Property Creation:**
   - Try creating a new property listing with images
   - Images should upload successfully
   - Property should be created without errors

## All Migration Files Summary

You now have these migration files to run:

1. `STUDENT_KYC_SETUP.sql` - Student KYC table and functions
2. `supabase/migrations/20240128000000_setup_kyc_documents_storage.sql` - KYC documents storage
3. `supabase/migrations/20240128000001_setup_property_images_storage.sql` - Property images storage (NEW)
4. `supabase/migrations/20240128000002_add_lot_size_to_properties.sql` - Add lot_size column (NEW)

Run them in this order for a clean setup.

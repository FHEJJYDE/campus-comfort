-- Check the Selfcon property images
-- Run this in your Supabase SQL Editor to see what's in the images field

SELECT 
    id,
    title,
    city,
    state,
    images,
    CASE 
        WHEN images IS NULL THEN 'NULL - No images field'
        WHEN array_length(images, 1) IS NULL THEN 'Empty array - No images uploaded'
        WHEN array_length(images, 1) = 0 THEN 'Empty array - No images uploaded'
        ELSE 'Has ' || array_length(images, 1) || ' image(s)'
    END as image_status
FROM properties
WHERE title ILIKE '%selfcon%'
   OR city ILIKE '%akpaden%'
ORDER BY created_at DESC;

-- If you want to see all properties without images:
-- SELECT id, title, city, state, images
-- FROM properties
-- WHERE images IS NULL OR array_length(images, 1) IS NULL OR array_length(images, 1) = 0;

-- To add a default image to properties without images (OPTIONAL - BE CAREFUL):
-- UPDATE properties
-- SET images = ARRAY['https://placehold.co/800x600/e2e8f0/64748b?text=Property+Image']
-- WHERE images IS NULL OR array_length(images, 1) IS NULL OR array_length(images, 1) = 0;

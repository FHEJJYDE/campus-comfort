-- Migration: Add lot_size column to properties table
-- Description: Adds the lot_size column to store property lot/land size in square feet

-- Add lot_size column to properties table
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS lot_size INTEGER;

-- Add comment to explain the column
COMMENT ON COLUMN public.properties.lot_size IS 'Size of the property lot/land in square feet';

-- Create index for filtering by lot size
CREATE INDEX IF NOT EXISTS idx_properties_lot_size ON public.properties(lot_size);

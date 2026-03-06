# Vercel Prime Locations Not Updating - Fix Guide

## Problem
Localhost shows correct prime locations, but Vercel deployment shows old/fallback locations.

## Root Causes

### 1. Fallback Locations in Code
The `src/pages/Index.tsx` file has hardcoded fallback locations that display when the database returns empty results:

```typescript
const fallbackLocations = [
  { name: "Enugu", ... },
  { name: "Calabar", ... },
  { name: "Lagos", ... },
  // etc.
];

const locations = dbLocations.length > 0 ? dbLocations : fallbackLocations;
```

### 2. Possible Issues on Vercel
- Different Supabase environment (dev vs production)
- Cached build serving old data
- Environment variables not set correctly
- Database query failing silently

## Solutions

### Solution 1: Verify Supabase Environment Variables on Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Verify these variables are set correctly:
   - `VITE_SUPABASE_URL` - Should match your production Supabase URL
   - `VITE_SUPABASE_ANON_KEY` - Should match your production Supabase anon key

4. If they're wrong or missing, update them and redeploy

### Solution 2: Force Fresh Deployment

Option A - Redeploy from Vercel Dashboard:
1. Go to your Vercel project
2. Click on **Deployments** tab
3. Find the latest deployment
4. Click the three dots (•••) menu
5. Select **Redeploy**
6. Check "Use existing Build Cache" is **UNCHECKED**
7. Click **Redeploy**

Option B - Trigger from Git:
```bash
# Make a small change and push
git commit --allow-empty -m "Force Vercel rebuild"
git push
```

### Solution 3: Add Debug Logging (Temporary)

Update `src/pages/Index.tsx` to log what's happening:

```typescript
const { locations: dbLocations, loading: locationsLoading } = useLocations();

// Add this debug logging
useEffect(() => {
  console.log('Database locations:', dbLocations);
  console.log('Locations count:', dbLocations.length);
  console.log('Using fallback?', dbLocations.length === 0);
}, [dbLocations]);

const locations = dbLocations.length > 0 ? dbLocations : fallbackLocations;
```

Then check the browser console on Vercel to see what's being loaded.

### Solution 4: Remove Fallback Locations (Recommended)

This will force the app to show database locations only, making issues obvious:

In `src/pages/Index.tsx`, change:
```typescript
const locations = dbLocations.length > 0 ? dbLocations : fallbackLocations;
```

To:
```typescript
const locations = dbLocations; // Always use database locations
```

If the database is empty or failing, you'll see "No locations available" instead of fallback data.

### Solution 5: Check Database Directly

1. Go to your Supabase dashboard
2. Navigate to **Table Editor** → **locations**
3. Verify:
   - The table has data
   - `is_active` is `true` for the locations you want to show
   - `is_prime` is `true` for prime locations (if you're filtering by that)
   - `display_order` is set correctly

### Solution 6: Clear Vercel Cache

If you're using Vercel's caching:

1. Add this to your `vercel.json` (create if it doesn't exist):
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        }
      ]
    }
  ]
}
```

2. Commit and push this change

## Quick Diagnosis Steps

1. **Check Vercel logs:**
   - Go to Vercel Dashboard → Your Project → Deployments
   - Click on the latest deployment
   - Check the **Function Logs** tab for any errors

2. **Check browser console on Vercel site:**
   - Open your Vercel site
   - Press F12 to open DevTools
   - Check Console tab for errors
   - Check Network tab to see if Supabase requests are succeeding

3. **Compare environment variables:**
   - Localhost: Check `.env` file
   - Vercel: Check Settings → Environment Variables
   - Make sure they match (or point to correct production database)

## Most Likely Solution

Based on the symptoms, the most likely issue is:

**Vercel is using different Supabase environment variables** (pointing to a different database or project)

**Fix:**
1. Copy your production Supabase URL and anon key
2. Update Vercel environment variables
3. Redeploy without cache

## After Fixing

Once fixed, you should:
1. Remove the fallback locations code (or make them match your actual prime locations)
2. Add proper error handling for when database is empty
3. Consider adding a loading state that's more obvious

## Need More Help?

If none of these work, check:
- Supabase logs for failed queries
- Vercel function logs for runtime errors
- Network tab in browser DevTools to see actual API responses

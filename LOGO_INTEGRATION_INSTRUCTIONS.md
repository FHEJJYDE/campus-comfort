# Logo Integration Instructions

## Step 1: Save the Logo File

Please save the horizontal logo image you provided as:
- **File path**: `/public/campus-comfort-logo.png`
- **File name**: `campus-comfort-logo.png`

The logo should be saved in the `public` folder at the root of your project.

## Step 2: Components Being Updated

The following components will be updated to use the actual logo image:

1. `src/components/layout/Header.tsx` - Main navigation header
2. `src/components/layout/Footer.tsx` - Footer branding
3. `src/components/dashboard/DashboardSidebar.tsx` - Dashboard sidebar logo

## Logo Specifications

Based on the provided image:
- **Format**: PNG with transparent background
- **Colors**: Teal/cyan house icon + orange inner square, with "CAMPUS" in teal and "comfort" in orange
- **Aspect Ratio**: Approximately 3:1 (horizontal)
- **Recommended dimensions**: 600×200px or higher for quality

## Implementation Notes

- The logo will be displayed at different sizes across components
- CSS will handle responsive sizing
- Alt text will be "Campus Comfort" for accessibility
- The logo will maintain its aspect ratio across all uses

# Campus Comfort Logo Dimensions Guide

## Overview
This guide provides recommended dimensions for creating the Campus Comfort logo across different use cases in the application.

---

## 1. Main Navigation Logo (Header)

**Current Implementation**: Text-based with "CC" icon
**Location**: `src/components/layout/Header.tsx`

### Desktop Header
- **Icon Box**: 36px × 36px (h-9 w-9)
- **Full Logo with Text**: ~200px × 36px (width varies with text)
- **Format**: Horizontal layout (icon + text)
- **Recommended**: 
  - SVG format for scalability
  - PNG: 400px × 72px @2x (for retina displays)
  - Transparent background

### Mobile Header
- **Icon Box**: 36px × 36px (same as desktop)
- **Full Logo**: ~180px × 36px (slightly smaller text)

---

## 2. Dashboard Sidebar Logo

**Location**: `src/components/dashboard/DashboardSidebar.tsx`

### Expanded Sidebar
- **Icon Box**: 32px × 32px (h-8 w-8)
- **Full Logo with Text**: ~180px × 32px
- **Format**: Horizontal layout

### Collapsed Sidebar (Icon Only)
- **Icon Box**: 32px × 32px
- **Format**: Square icon only ("CC" monogram)

**Recommended**:
- SVG format
- PNG: 64px × 64px @2x for icon-only view
- PNG: 360px × 64px @2x for full logo

---

## 3. Footer Logo

**Location**: `src/components/layout/Footer.tsx`

### Footer Branding
- **Icon Box**: 40px × 40px (h-10 w-10)
- **Full Logo with Text**: ~220px × 40px
- **Format**: Horizontal layout

**Recommended**:
- SVG format (best for dark backgrounds)
- PNG: 440px × 80px @2x
- Light/white version for dark primary background

---

## 4. Authentication Pages

**Locations**: `src/pages/Login.tsx`, `src/pages/Signup.tsx`

### Login/Signup Logo
- **Recommended Size**: 200px × 60px (larger for prominence)
- **Format**: Horizontal or stacked layout
- **Variants**: 
  - Light mode version
  - Dark mode version (if dark theme enabled)

**Recommended**:
- SVG format
- PNG: 400px × 120px @2x

---

## 5. Favicon & Browser Icons

**Location**: `index.html` (currently missing)

### Standard Favicon
- **16×16px**: Browser tab (small)
- **32×32px**: Browser tab (standard)
- **48×48px**: Browser tab (large)
- **Format**: ICO or PNG

### Apple Touch Icon
- **180×180px**: iOS home screen icon
- **Format**: PNG with solid background (no transparency)

### Android Chrome Icons (PWA)
- **192×192px**: Android home screen
- **512×512px**: Android splash screen
- **Format**: PNG with solid background

**Files Needed**:
```
/public/favicon.ico (16×16, 32×32, 48×48 combined)
/public/favicon-16x16.png
/public/favicon-32x32.png
/public/pwa-icons/android-chrome-192x192.png
/public/pwa-icons/android-chrome-512x512.png
/public/pwa-icons/apple-touch-icon.png (180×180)
```

---

## 6. Social Media & Open Graph

**Location**: `index.html` (meta tags)

### Open Graph Image (Facebook, LinkedIn, etc.)
- **1200×630px**: Standard OG image size
- **Format**: PNG or JPG
- **Content**: Logo + tagline "Affordability Meets Comfort"
- **File**: `/public/og-image.png`

### Twitter Card
- **1200×600px**: Twitter summary card
- **Format**: PNG or JPG
- **File**: `/public/twitter-card.png`

---

## 7. Email & Marketing

### Email Header Logo
- **600×100px**: Standard email width
- **Format**: PNG (JPG for photos)
- **Background**: Transparent or white

### Marketing Materials
- **Print**: Vector (SVG, AI, EPS) - scalable to any size
- **Digital Ads**: 
  - Square: 1080×1080px
  - Landscape: 1200×628px
  - Portrait: 1080×1350px

---

## Logo Design Recommendations

### Color Palette
Based on your current theme:
- **Primary**: #1e40af (blue)
- **Accent**: Your accent color
- **Text**: Dark gray or black for light backgrounds
- **Reverse**: White for dark backgrounds

### Typography
- **Font**: Use your `font-heading` (currently set in Tailwind config)
- **Weight**: Bold (700) for "Campus Comfort"
- **Icon**: Bold "CC" monogram

### Icon Design ("CC" Monogram)
- **Style**: Modern, clean, professional
- **Shape**: Rounded square or circle
- **Background**: Primary color (#1e40af)
- **Text**: White or light color
- **Font**: Bold, sans-serif

### Full Logo Variations Needed
1. **Horizontal** (icon + text side-by-side) - Primary use
2. **Stacked** (icon above text) - For square spaces
3. **Icon Only** ("CC" monogram) - For small spaces
4. **Wordmark Only** ("Campus Comfort" text) - For wide spaces

### File Formats to Create
- **SVG**: Primary format (scalable, small file size)
- **PNG**: @1x and @2x versions with transparency
- **ICO**: For favicon
- **JPG**: For social media (if needed)

---

## Quick Reference Table

| Use Case | Dimensions | Format | Priority |
|----------|-----------|--------|----------|
| Header Logo | 400×72px @2x | SVG/PNG | High |
| Sidebar Icon | 64×64px @2x | SVG/PNG | High |
| Footer Logo | 440×80px @2x | SVG/PNG | Medium |
| Favicon | 32×32px | ICO/PNG | High |
| Apple Touch | 180×180px | PNG | High |
| Android PWA | 192×192px, 512×512px | PNG | High |
| OG Image | 1200×630px | PNG/JPG | Medium |
| Auth Pages | 400×120px @2x | SVG/PNG | Medium |

---

## Implementation Steps

1. **Create the logo designs** in the dimensions above
2. **Export in multiple formats**: SVG (primary), PNG @1x and @2x
3. **Place files in `/public` directory**:
   ```
   /public/
   ├── logo.svg (main logo)
   ├── logo-icon.svg (CC monogram only)
   ├── logo-light.svg (for dark backgrounds)
   ├── favicon.ico
   ├── favicon-16x16.png
   ├── favicon-32x32.png
   ├── og-image.png
   └── pwa-icons/
       ├── android-chrome-192x192.png
       ├── android-chrome-512x512.png
       └── apple-touch-icon.png
   ```

4. **Update components** to use actual logo files instead of text-based placeholders
5. **Update `index.html`** with proper favicon and OG image references

---

## Notes

- All current logo implementations use a text-based placeholder with "CC" in a colored box
- Once you create the actual logo, you'll replace these with `<img>` tags pointing to your logo files
- SVG is preferred for web use (scalable, small file size, crisp at any resolution)
- Always provide @2x versions for retina displays
- Test logos on both light and dark backgrounds

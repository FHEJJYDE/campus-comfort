# Theme Customization Guide

## Overview
Campus Comfort now features a comprehensive user-customizable theme system that allows every user to personalize their experience with custom colors and fonts. These customizations apply to both the dashboard and public pages, giving each user a unique design.

## Features

### 1. Color Customization
Users can customize two color aspects:
- **Primary Color**: Main brand color used throughout the interface
- **Accent Color**: Secondary color for highlights and accents

#### Available Colors (20+ options):
- **Blues**: Ocean Blue, Navy, Sky Blue
- **Greens**: Forest Green, Emerald, Lime, Teal
- **Purples**: Purple, Indigo, Violet
- **Reds & Pinks**: Red, Rose, Pink
- **Oranges & Yellows**: Orange, Amber, Yellow
- **Others**: Cyan, Slate, Stone

### 2. Font Customization
Users can choose from 15+ professional fonts:
- **Sans-serif**: Inter, Poppins, Roboto, Montserrat, Lato, Open Sans, Raleway, Nunito, Space Grotesk, Plus Jakarta Sans, DM Sans, Work Sans
- **Serif**: Playfair Display, Merriweather
- **Monospace**: Source Code Pro

Fonts are loaded dynamically from Google Fonts when selected.

### 3. Theme Mode
- **Light Mode**: Bright, clean interface
- **Dark Mode**: Easy on the eyes for low-light environments
- **System**: Automatically matches device preference

### 4. Display Settings
- **Font Size**: Small, Medium, or Large
- **Compact Mode**: Reduces spacing for more content density
- **Animations**: Toggle smooth transitions and effects

## How to Access

### For Regular Users:
1. Log in to your account
2. Navigate to your dashboard
3. Click on "Profile" or "Settings"
4. Select the "Theme" tab
5. Customize colors, fonts, and display settings
6. Click "Save Theme" to apply changes

### For Admins:
1. Log in to admin dashboard
2. Go to "Profile" or "Settings"
3. Select the "Theme" tab
4. Customize your personal theme
5. Click "Save Theme"

## Technical Details

### Storage
- **Authenticated Users**: Theme settings are saved to the `user_settings` table in Supabase with category `appearance`
- **Non-authenticated Users**: Settings are stored in browser localStorage

### Persistence
- Settings persist across sessions
- Settings apply immediately when changed
- Settings sync across devices for authenticated users

### Scope
- Theme customizations apply to:
  - Dashboard pages
  - Public pages (home, property listings, etc.)
  - All components and UI elements

## Implementation Files

### Core Files:
- `src/contexts/ThemeContext.tsx` - Theme state management and application logic
- `src/components/settings/ThemeSettings.tsx` - User interface for theme customization
- `src/index.css` - CSS variables and utility classes

### Integration:
- Theme is applied via `ThemeProvider` in `src/App.tsx`
- Available in both `UserProfile` and `AdminProfile` pages
- Uses CSS custom properties for dynamic color changes
- Dynamically loads Google Fonts for font family changes

## User Benefits

1. **Personalization**: Each user can create their unique look
2. **Accessibility**: Font size and contrast options improve readability
3. **Comfort**: Dark mode and animation controls reduce eye strain
4. **Efficiency**: Compact mode maximizes screen real estate
5. **Consistency**: Theme applies across entire platform

## Notes

- Theme changes are instant and don't require page refresh
- Font loading is optimized to prevent layout shifts
- All color combinations maintain WCAG contrast standards
- Settings are user-specific, not platform-wide
- No admin privileges required to customize themes

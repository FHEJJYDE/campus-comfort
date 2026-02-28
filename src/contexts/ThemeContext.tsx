import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface ThemeSettings {
  theme: 'light' | 'dark' | 'system';
  primaryColor: string;
  accentColor: string;
  fontFamily: string;
  fontSize: 'small' | 'medium' | 'large';
  compactMode: boolean;
  animationsEnabled: boolean;
  sidebarCollapsed?: boolean;
}

interface ThemeContextType {
  settings: ThemeSettings;
  updateSetting: (key: keyof ThemeSettings, value: any) => void;
  loading: boolean;
  saveSettings: () => Promise<void>;
  availableColors: typeof colorOptions;
  availableFonts: typeof fontOptions;
}

const defaultSettings: ThemeSettings = {
  theme: 'system',
  primaryColor: 'blue',
  accentColor: 'orange',
  fontFamily: 'inter',
  fontSize: 'medium',
  compactMode: false,
  animationsEnabled: true,
  sidebarCollapsed: false,
};

// Expanded color options
const colorOptions = {
  // Blues
  blue: { name: 'Ocean Blue', value: '217 91% 60%', preview: '#3B82F6' },
  navy: { name: 'Navy', value: '215 50% 23%', preview: '#1E3A5F' },
  sky: { name: 'Sky Blue', value: '199 89% 48%', preview: '#0EA5E9' },

  // Greens
  green: { name: 'Forest Green', value: '142 76% 36%', preview: '#22C55E' },
  emerald: { name: 'Emerald', value: '160 84% 39%', preview: '#10B981' },
  lime: { name: 'Lime', value: '84 81% 44%', preview: '#84CC16' },
  teal: { name: 'Teal', value: '173 80% 40%', preview: '#14B8A6' },

  // Purples
  purple: { name: 'Purple', value: '262 83% 58%', preview: '#A855F7' },
  indigo: { name: 'Indigo', value: '239 84% 67%', preview: '#6366F1' },
  violet: { name: 'Violet', value: '258 90% 66%', preview: '#8B5CF6' },

  // Reds & Pinks
  red: { name: 'Red', value: '0 84% 60%', preview: '#EF4444' },
  rose: { name: 'Rose', value: '350 89% 60%', preview: '#F43F5E' },
  pink: { name: 'Pink', value: '336 75% 60%', preview: '#EC4899' },

  // Oranges & Yellows
  orange: { name: 'Orange', value: '25 95% 53%', preview: '#F97316' },
  amber: { name: 'Amber', value: '43 96% 56%', preview: '#F59E0B' },
  yellow: { name: 'Yellow', value: '48 96% 53%', preview: '#EAB308' },

  // Others
  cyan: { name: 'Cyan', value: '188 86% 53%', preview: '#06B6D4' },
  slate: { name: 'Slate', value: '215 20% 45%', preview: '#64748B' },
  stone: { name: 'Stone', value: '25 5% 45%', preview: '#78716C' },
};

// Font options with Google Fonts
const fontOptions = {
  inter: { name: 'Inter', value: 'Inter, sans-serif', url: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap' },
  poppins: { name: 'Poppins', value: 'Poppins, sans-serif', url: 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap' },
  roboto: { name: 'Roboto', value: 'Roboto, sans-serif', url: 'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700;900&display=swap' },
  montserrat: { name: 'Montserrat', value: 'Montserrat, sans-serif', url: 'https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800&display=swap' },
  lato: { name: 'Lato', value: 'Lato, sans-serif', url: 'https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700;900&display=swap' },
  opensans: { name: 'Open Sans', value: '"Open Sans", sans-serif', url: 'https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;500;600;700;800&display=swap' },
  raleway: { name: 'Raleway', value: 'Raleway, sans-serif', url: 'https://fonts.googleapis.com/css2?family=Raleway:wght@300;400;500;600;700;800&display=swap' },
  nunito: { name: 'Nunito', value: 'Nunito, sans-serif', url: 'https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;500;600;700;800&display=swap' },
  playfair: { name: 'Playfair Display', value: '"Playfair Display", serif', url: 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;800&display=swap' },
  merriweather: { name: 'Merriweather', value: 'Merriweather, serif', url: 'https://fonts.googleapis.com/css2?family=Merriweather:wght@300;400;700;900&display=swap' },
  sourcecodepro: { name: 'Source Code Pro', value: '"Source Code Pro", monospace', url: 'https://fonts.googleapis.com/css2?family=Source+Code+Pro:wght@300;400;500;600;700&display=swap' },
  spacegrotesk: { name: 'Space Grotesk', value: '"Space Grotesk", sans-serif', url: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap' },
  plusjakarta: { name: 'Plus Jakarta Sans', value: '"Plus Jakarta Sans", sans-serif', url: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap' },
  dmSans: { name: 'DM Sans', value: '"DM Sans", sans-serif', url: 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap' },
  workSans: { name: 'Work Sans', value: '"Work Sans", sans-serif', url: 'https://fonts.googleapis.com/css2?family=Work+Sans:wght@300;400;500;600;700;800&display=swap' },
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [settings, setSettings] = useState<ThemeSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadUserSettings();
    } else {
      // Load default settings for non-authenticated users
      loadDefaultSettings();
    }
  }, [user]);

  useEffect(() => {
    applyTheme(settings.theme);
  }, [settings.theme]);

  useEffect(() => {
    applyPrimaryColor(settings.primaryColor);
  }, [settings.primaryColor]);

  useEffect(() => {
    applyAccentColor(settings.accentColor);
  }, [settings.accentColor]);

  useEffect(() => {
    applyFontFamily(settings.fontFamily);
  }, [settings.fontFamily]);

  useEffect(() => {
    applyFontSize(settings.fontSize);
  }, [settings.fontSize]);

  useEffect(() => {
    applyCompactMode(settings.compactMode);
  }, [settings.compactMode]);

  useEffect(() => {
    applyAnimations(settings.animationsEnabled);
  }, [settings.animationsEnabled]);

  const loadUserSettings = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Fetch user theme settings from database
      const { data, error } = await supabase
        .from('user_settings')
        .select('setting_key, setting_value')
        .eq('user_id', user.id)
        .eq('category', 'appearance');

      if (error) {
        console.warn('Error loading theme settings:', error);
        loadDefaultSettings();
        return;
      }

      // Convert settings array to object
      const userSettings = data.reduce((acc, setting) => {
        acc[setting.setting_key] = setting.setting_value;
        return acc;
      }, {} as Record<string, any>);

      // Merge with defaults
      const newSettings: ThemeSettings = {
        theme: userSettings.theme || defaultSettings.theme,
        primaryColor: userSettings.primaryColor || defaultSettings.primaryColor,
        accentColor: userSettings.accentColor || defaultSettings.accentColor,
        fontFamily: userSettings.fontFamily || defaultSettings.fontFamily,
        fontSize: userSettings.fontSize || defaultSettings.fontSize,
        compactMode: userSettings.compactMode ?? defaultSettings.compactMode,
        animationsEnabled: userSettings.animationsEnabled ?? defaultSettings.animationsEnabled,
        sidebarCollapsed: userSettings.sidebarCollapsed ?? defaultSettings.sidebarCollapsed,
      };

      setSettings(newSettings);
    } catch (error) {
      console.error('Error loading theme settings:', error);
      loadDefaultSettings();
    } finally {
      setLoading(false);
    }
  };

  const loadDefaultSettings = () => {
    // Apply default settings and save them to localStorage for non-authenticated users
    const saved = localStorage.getItem('theme-settings');
    if (saved) {
      try {
        const parsedSettings = JSON.parse(saved);
        setSettings({ ...defaultSettings, ...parsedSettings });
      } catch {
        setSettings(defaultSettings);
      }
    } else {
      setSettings(defaultSettings);
    }
    setLoading(false);
  };

  const applyTheme = (selectedTheme: string) => {
    const root = document.documentElement;

    if (selectedTheme === 'dark') {
      root.classList.add('dark');
    } else if (selectedTheme === 'light') {
      root.classList.remove('dark');
    } else {
      // System theme
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  };

  const applyPrimaryColor = (color: string) => {
    const root = document.documentElement;
    const selectedColor = colorOptions[color as keyof typeof colorOptions];

    if (selectedColor) {
      root.style.setProperty('--primary', selectedColor.value);
      root.style.setProperty('--ring', selectedColor.value);
    }
  };

  const applyAccentColor = (color: string) => {
    const root = document.documentElement;
    const selectedColor = colorOptions[color as keyof typeof colorOptions];

    if (selectedColor) {
      root.style.setProperty('--accent', selectedColor.value);
    }
  };

  const applyFontFamily = (font: string) => {
    const root = document.documentElement;
    const selectedFont = fontOptions[font as keyof typeof fontOptions];

    if (selectedFont) {
      // Load Google Font dynamically
      const existingLink = document.getElementById('google-font-link');
      if (existingLink) {
        existingLink.remove();
      }

      const link = document.createElement('link');
      link.id = 'google-font-link';
      link.rel = 'stylesheet';
      link.href = selectedFont.url;
      document.head.appendChild(link);

      // Apply font family
      root.style.setProperty('--font-family', selectedFont.value);
      document.body.style.fontFamily = selectedFont.value;
    }
  };

  const applyFontSize = (size: string) => {
    const root = document.documentElement;
    const sizeMap = {
      small: '14px',
      medium: '16px',
      large: '18px',
    };

    const selectedSize = sizeMap[size as keyof typeof sizeMap];
    if (selectedSize) {
      root.style.setProperty('--base-font-size', selectedSize);
      root.style.fontSize = selectedSize;
    }
  };

  const applyCompactMode = (compact: boolean) => {
    const root = document.documentElement;
    if (compact) {
      root.classList.add('compact-mode');
    } else {
      root.classList.remove('compact-mode');
    }
  };

  const applyAnimations = (enabled: boolean) => {
    const root = document.documentElement;
    if (enabled) {
      root.classList.remove('no-animations');
    } else {
      root.classList.add('no-animations');
    }
  };

  const updateSetting = (key: keyof ThemeSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const saveSettings = async () => {
    if (!user) {
      // Save to localStorage for non-authenticated users
      localStorage.setItem('theme-settings', JSON.stringify(settings));
      return;
    }

    try {
      const settingsToUpdate = Object.entries(settings).map(([key, value]) => ({
        user_id: user.id,
        setting_key: key,
        setting_value: value,
        category: 'appearance',
      }));

      const { error } = await supabase
        .from('user_settings')
        .upsert(settingsToUpdate, {
          onConflict: 'user_id,setting_key'
        });

      if (error) {
        throw error;
      }

      console.log('Theme settings saved successfully');
    } catch (error) {
      console.error('Error saving theme settings:', error);
      throw error;
    }
  };

  return (
    <ThemeContext.Provider value={{
      settings,
      updateSetting,
      loading,
      saveSettings,
      availableColors: colorOptions,
      availableFonts: fontOptions
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

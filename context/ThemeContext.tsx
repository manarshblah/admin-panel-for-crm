import React, { createContext, useState, useContext, useEffect, useMemo } from 'react';
import { generateColorShades } from '../utils/colors';

interface ThemeContextType {
  primaryColor: string;
  setPrimaryColor: (color: string) => void;
  logoUrl: string | null;
  setLogoUrl: (url: string | null) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const DEFAULT_PRIMARY_COLOR = '#3b82f6';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [primaryColor, setPrimaryColor] = useState(() => {
    return localStorage.getItem('primaryColor') || DEFAULT_PRIMARY_COLOR;
  });
  
  const [logoUrl, setLogoUrl] = useState<string | null>(() => {
    return localStorage.getItem('logoUrl') || null;
  });

  useEffect(() => {
    localStorage.setItem('primaryColor', primaryColor);
    
    const shades = generateColorShades(primaryColor);
    const root = document.documentElement;

    for (const [shade, hslValue] of Object.entries(shades)) {
      root.style.setProperty(`--color-primary-${shade}`, hslValue);
    }
  }, [primaryColor]);

  const handleSetLogoUrl = (url: string | null) => {
    if (url) {
        localStorage.setItem('logoUrl', url);
    } else {
        localStorage.removeItem('logoUrl');
    }
    setLogoUrl(url);
  };

  const value = useMemo(() => ({
    primaryColor,
    setPrimaryColor,
    logoUrl,
    setLogoUrl: handleSetLogoUrl,
  }), [primaryColor, logoUrl]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
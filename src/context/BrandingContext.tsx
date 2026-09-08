'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { BrandingConfig } from '@/types';

interface BrandingContextType {
  branding: BrandingConfig;
  updateBranding: (newBranding: Partial<BrandingConfig>) => void;
  resetBranding: () => void;
}

const DEFAULT_BRANDING: BrandingConfig = {
  appName: 'LaunchPad OS',
  primaryColor: '#3F7659',
  secondaryColor: '#DDEEDF',
  font: 'Inter',
  buttonStyle: 'rounded',
  borderRadius: '0.625rem',
};

const BrandingContext = createContext<BrandingContextType | undefined>(undefined);

export function BrandingProvider({ children }: { children: React.ReactNode }) {
  const [branding, setBranding] = useState<BrandingConfig>(DEFAULT_BRANDING);

  useEffect(() => {
    // Dynamically apply CSS variables to document root
    const root = document.documentElement;
    root.style.setProperty('--lp-primary', branding.primaryColor);
    root.style.setProperty('--lp-pistachio', branding.secondaryColor);
    root.style.setProperty('--lp-border-radius', branding.borderRadius);
  }, [branding]);

  const updateBranding = (newBranding: Partial<BrandingConfig>) => {
    setBranding((prev) => ({ ...prev, ...newBranding }));
  };

  const resetBranding = () => {
    setBranding(DEFAULT_BRANDING);
  };

  return (
    <BrandingContext.Provider value={{ branding, updateBranding, resetBranding }}>
      {children}
    </BrandingContext.Provider>
  );
}

export function useBranding() {
  const context = useContext(BrandingContext);
  if (!context) {
    throw new Error('useBranding must be used within a BrandingProvider');
  }
  return context;
}

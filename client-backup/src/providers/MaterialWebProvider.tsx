'use client';

import { useEffect } from 'react';
import { themeFromSourceColor, applyTheme } from '@material/material-color-utilities';

const MaterialWebProvider = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    const theme = themeFromSourceColor(0xFF6750A4); // Using hex value for the color #6750A4

    // Apply the theme to the document
    applyTheme(theme, { target: document.body, dark: false });
  }, []);

  return <>{children}</>;
};

export default MaterialWebProvider;

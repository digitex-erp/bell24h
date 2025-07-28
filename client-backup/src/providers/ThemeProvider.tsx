'use client';

import { ThemeProvider as MUIThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { prefixer } from 'stylis';
import rtlPlugin from 'stylis-plugin-rtl';
import { theme } from '@/theme';

// Create RTL cache
const cacheRtl = createCache({
  key: 'muirtl',
  stylisPlugins: [prefixer, rtlPlugin],
});

// Create LTR cache
const cacheLtr = createCache({
  key: 'mui',
});

interface ThemeProviderProps {
  children: React.ReactNode;
  direction?: 'ltr' | 'rtl';
}

export function ThemeProvider({ children, direction = 'ltr' }: ThemeProviderProps) {
  const cache = direction === 'rtl' ? cacheRtl : cacheLtr;

  return (
    <CacheProvider value={cache}>
      <MUIThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MUIThemeProvider>
    </CacheProvider>
  );
}

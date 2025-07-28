# Bell24H Next.js App Architecture

## Emotion SSR + MUI + Tailwind Solution

This document outlines the architecture of the Bell24H dashboard application, focusing on the integration of Material UI, Emotion, and Tailwind CSS within the Next.js App Router framework.

### Core Architecture

The application follows Next.js App Router conventions with specific patterns to ensure proper functioning of client-side libraries in a server component environment.

#### Key Components

1. **Root Layout (`src/app/layout.tsx`)**
   - Pure server component
   - Minimal HTML structure
   - No client component imports
   - No Emotion JSX transforms

2. **Route-Specific Layouts (`src/app/[route]/layout.tsx`)**
   - Client components (marked with `"use client"`)
   - Provide MUI `ThemeProvider`
   - Provide Emotion cache via `AppRouterCacheProvider`
   - Apply global styles like `CssBaseline`

3. **Page Components (`src/app/[route]/page.tsx`)**
   - Client components when using MUI
   - Standard React components with MUI

### CSS Solution

The application uses a hybrid styling approach:

- **Material UI**: For component styling and theming
- **Tailwind CSS**: For utility classes and rapid styling
- **Emotion**: As the CSS-in-JS engine (used internally by MUI)

### Important Configuration

1. **tsconfig.json**
   - ⚠️ IMPORTANT: No global `jsxImportSource` set
   - This allows Next.js to handle JSX appropriately for each component type

2. **next.config.js**
   - No special Emotion compiler options needed
   - Standard Next.js configuration

### Adding New Routes

When creating new routes that require MUI components:

1. Create a route folder (`src/app/your-route/`)
2. Create a layout.tsx file with:
   ```tsx
   "use client"
   
   import { ThemeProvider } from '@mui/material/styles'
   import CssBaseline from '@mui/material/CssBaseline'
   import { AppRouterCacheProvider } from '@mui/material-nextjs/v13-appRouter'
   import { theme } from '@/theme' // Your theme import

   export default function YourRouteLayout({
     children,
   }: {
     children: React.ReactNode
   }) {
     return (
       <AppRouterCacheProvider>
         <ThemeProvider theme={theme}>
           <CssBaseline />
           {children}
         </ThemeProvider>
       </AppRouterCacheProvider>
     )
   }
   ```
3. Create a page.tsx file marked with `"use client"` for MUI usage

### Common Issues and Solutions

- **"createContext only works in Client Components"**: This error appears when client libraries like MUI are imported in server components. Solution: Use the route-specific layout pattern.

- **Flash of Unstyled Content**: This happens when styles aren't properly server-rendered. Solution: Ensure proper use of `AppRouterCacheProvider` in client layouts.

- **Missing styles in production**: Check that the route has a client layout that provides the proper themes and cache.

### Dependencies

- Next.js 14+
- React 18+
- Material UI 5+
- @mui/material-nextjs/v13-appRouter (for Emotion cache handling)
- Tailwind CSS 3+ (via PostCSS)

### Legacy Notes

- Previous implementation used a global client-providers.tsx for all routes
- Chakra UI was removed in favor of Material UI

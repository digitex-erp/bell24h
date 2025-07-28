declare module 'react-i18next' {
  export interface UseTranslationResponse {
    t: (key: string, options?: any) => string;
    i18n: {
      changeLanguage: (lng: string) => Promise<void>;
      language: string;
      loadLanguages: (langs: string[]) => Promise<void>;
      hasLoadedNamespace: (ns: string) => boolean;
      isInitialized: boolean;
      store: {
        getResource: (lng: string, ns: string, key: string) => any;
      };
    };
  }

  export function useTranslation(namespace?: string | string[]): UseTranslationResponse;
}

declare module '@mui/material' {
  export interface Theme {
    palette: {
      primary: {
        main: string;
      };
      secondary: {
        main: string;
      };
    };
  }

  export interface ThemeOptions {
    palette?: {
      primary?: {
        main?: string;
      };
      secondary?: {
        main?: string;
      };
    };
  }

  export const Box: React.FC<{
    sx?: any;
    children?: React.ReactNode;
    className?: string;
  }>;

  export const Typography: React.FC<{
    variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'subtitle1' | 'subtitle2' | 'body1' | 'body2';
    gutterBottom?: boolean;
    children?: React.ReactNode;
  }>;

  export const CircularProgress: React.FC<{
    size?: number | string;
  }>;

  export const Card: React.FC<{
    children?: React.ReactNode;
  }>;

  export const CardContent: React.FC<{
    children?: React.ReactNode;
  }>;

  export const CardHeader: React.FC<{
    title?: React.ReactNode;
  }>;

  export const Divider: React.FC;

  export const Button: React.FC<{
    variant?: 'text' | 'outlined' | 'contained';
    fullWidth?: boolean;
    onClick?: () => void;
    children?: React.ReactNode;
    className?: string;
    size?: 'small' | 'medium' | 'large';
    color?: 'inherit' | 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning';
    startIcon?: React.ReactNode;
    endIcon?: React.ReactNode;
    disabled?: boolean;
  }>;

  export const Grid: React.FC<{
    container?: boolean;
    item?: boolean;
    xs?: number;
    sm?: number;
    spacing?: number;
    children?: React.ReactNode;
  }>;
}

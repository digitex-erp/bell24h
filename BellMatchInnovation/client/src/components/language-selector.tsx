import React from 'react';
import { useTranslation, LANGUAGES, Language } from '../lib/translations';
import { Button } from './ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from './ui/dropdown-menu';
import { Globe } from 'lucide-react';

interface LanguageSelectorProps {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ 
  variant = 'outline',
  size = 'default'
}) => {
  const { language, changeLanguage, t } = useTranslation();
  
  // Get the current language display name
  const currentLanguage = LANGUAGES.find(lang => lang.code === language)?.name || language;
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} className="gap-1">
          <Globe className="h-4 w-4" />
          {size !== 'icon' && (
            <span>{currentLanguage}</span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {LANGUAGES.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => changeLanguage(lang.code as Language)}
            className={language === lang.code ? "bg-accent font-medium" : ""}
          >
            {lang.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// Export a more compact version for headers, navbars, etc.
export const LanguageSelectorCompact: React.FC = () => {
  return <LanguageSelector variant="ghost" size="icon" />;
};
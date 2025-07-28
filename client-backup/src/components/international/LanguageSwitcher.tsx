import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Menu, MenuItem, IconButton, Tooltip } from '@mui/material';
import { Language as LanguageIcon } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useSnackbar } from 'notistack';

interface LanguageSwitcherProps {
  className?: string;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ className = '' }) => {
  const { i18n, t } = useTranslation();
  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
  ];

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const changeLanguage = useCallback(async (lang: string) => {
    try {
      await i18n.changeLanguage(lang);
      if (user) {
        // TODO: Implement API call to update user's language preference
        // await updateUserLanguagePreference(user.id, lang);
      }
      localStorage.setItem('userLanguage', lang);
      enqueueSnackbar(t('common.languageChanged'), { variant: 'success' });
    } catch (error) {
      console.error('Error changing language:', error);
      enqueueSnackbar(t('common.languageChangeError'), { variant: 'error' });
    }
    handleClose();
  }, [i18n, user, enqueueSnackbar, t]);

  const currentLanguage = languages.find(l => l.code === i18n.language) || languages[0];

  return (
    <div className={className}>
      <Tooltip title={t('common.changeLanguage')}>
        <IconButton
          onClick={handleClick}
          size="small"
          sx={{
            ml: 2,
            color: 'inherit',
            '&:hover': {
              backgroundColor: 'action.hover',
            },
          }}
          aria-controls={Boolean(anchorEl) ? 'language-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={Boolean(anchorEl) ? 'true' : undefined}
        >
          <LanguageIcon />
          <span style={{ marginLeft: 8, fontSize: '0.875rem' }}>
            {currentLanguage.flag} {currentLanguage.name}
          </span>
        </IconButton>
      </Tooltip>
      <Menu
        id="language-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'language-button',
        }}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
          },
        }}
      >
        {languages.map((lang) => (
          <MenuItem
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            selected={lang.code === i18n.language}
            sx={{
              fontSize: '0.875rem',
              minWidth: 140,
              '&.Mui-selected': {
                backgroundColor: 'action.selected',
              },
            }}
          >
            <span style={{ marginRight: 8 }}>{lang.flag}</span>
            {lang.name}
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
};

export default LanguageSwitcher;

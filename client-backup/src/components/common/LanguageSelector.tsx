import React from 'react';
import {
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  Box,
  Typography
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { LanguageService, SUPPORTED_LANGUAGES } from '../../../src/services/i18n/LanguageService';

export const LanguageSelector: React.FC = () => {
  const { t, i18n } = useTranslation();
  const languageService = LanguageService.getInstance();

  const handleLanguageChange = async (event: SelectChangeEvent) => {
    const newLang = event.target.value;
    await languageService.changeLanguage(newLang);
  };

  return (
    <Box sx={{ minWidth: 120 }}>
      <FormControl fullWidth>
        <InputLabel id="language-select-label">
          {t('common.language')}
        </InputLabel>
        <Select
          labelId="language-select-label"
          id="language-select"
          value={i18n.language}
          label={t('common.language')}
          onChange={handleLanguageChange}
        >
          {Object.entries(SUPPORTED_LANGUAGES).map(([code, name]) => (
            <MenuItem key={code} value={code}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography>{name}</Typography>
                {code === i18n.language && (
                  <Typography
                    component="span"
                    sx={{ ml: 1, color: 'text.secondary' }}
                  >
                    (Current)
                  </Typography>
                )}
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
}; 
import { format, parse, isValid, formatDistanceToNow } from 'date-fns';
import { enUS, hi, ar, bn, ta, te, es, fr, de } from 'date-fns/locale';

export interface DateLocale {
  locale: any;
  name: string;
  nativeName: string;
}

export const supportedLocales: Record<string, DateLocale> = {
  en: { locale: enUS, name: 'English', nativeName: 'English' },
  hi: { locale: hi, name: 'Hindi', nativeName: 'हिंदी' },
  ar: { locale: ar, name: 'Arabic', nativeName: 'العربية' },
  bn: { locale: bn, name: 'Bengali', nativeName: 'বাংলা' },
  ta: { locale: ta, name: 'Tamil', nativeName: 'தமிழ்' },
  te: { locale: te, name: 'Telugu', nativeName: 'తెలుగు' },
  es: { locale: es, name: 'Spanish', nativeName: 'Español' },
  fr: { locale: fr, name: 'French', nativeName: 'Français' },
  de: { locale: de, name: 'German', nativeName: 'Deutsch' },
};

export function formatDate(date: Date | string, language: string, formatStr: string = 'PPP'): string {
  if (!date) return '';
  const parsedDate = typeof date === 'string' ? parse(date, 'yyyy-MM-dd', new Date()) : date;
  
  if (!isValid(parsedDate)) return '';
  
  const locale = supportedLocales[language]?.locale || enUS;
  
  return format(parsedDate, formatStr, { locale });
}

export function formatTime(date: Date | string, language: string, formatStr: string = 'p'): string {
  if (!date) return '';
  const parsedDate = typeof date === 'string' ? parse(date, 'HH:mm', new Date()) : date;
  
  if (!isValid(parsedDate)) return '';
  
  const locale = supportedLocales[language]?.locale || enUS;
  
  return format(parsedDate, formatStr, { locale });
}

export function formatDateTime(date: Date | string, language: string): string {
  return `${formatDate(date, language, 'PP')} ${formatTime(date, language, 'p')}`;
}

export function getTimeAgo(date: Date | string, language: string): string {
  if (!date) return '';
  const parsedDate = typeof date === 'string' ? parse(date, 'yyyy-MM-dd', new Date()) : date;
  
  if (!isValid(parsedDate)) return '';
  
  const locale = supportedLocales[language]?.locale || enUS;
  
  return formatDistanceToNow(parsedDate, { addSuffix: true, locale });
}

// Removed formatInUserTimeZone function as it referenced invalid functions

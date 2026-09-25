export const LANGUAGES = [
  { label: 'Afrikaans', value: 'Afrikaans' },
  { label: 'Amharic', value: 'Amharic' },
  { label: 'Arabic', value: 'Arabic' },
  { label: 'Bengali', value: 'Bengali' },
  { label: 'Chichewa', value: 'Chichewa' },
  { label: 'Chinese', value: 'Chinese' },
  { label: 'Dutch', value: 'Dutch' },
  { label: 'English', value: 'English' },
  { label: 'French', value: 'French' },
  { label: 'German', value: 'German' },
  { label: 'Hausa', value: 'Hausa' },
  { label: 'Hindi', value: 'Hindi' },
  { label: 'Igbo', value: 'Igbo' },
  { label: 'Indonesian', value: 'Indonesian' },
  { label: 'Italian', value: 'Italian' },
  { label: 'Japanese', value: 'Japanese' },
  { label: 'Kinyarwanda (Rwanda)', value: 'Kinyarwanda' },
  { label: 'Korean', value: 'Korean' },
  { label: 'Lingala', value: 'Lingala' },
  { label: 'Luganda', value: 'Luganda' },
  { label: 'Malagasy', value: 'Malagasy' },
  { label: 'Oromo', value: 'Oromo' },
  { label: 'Polish', value: 'Polish' },
  { label: 'Portuguese', value: 'Portuguese' },
  { label: 'Russian', value: 'Russian' },
  { label: 'Sesotho', value: 'Sesotho' },
  { label: 'Shona', value: 'Shona' },
  { label: 'Somali', value: 'Somali' },
  { label: 'Spanish', value: 'Spanish' },
  { label: 'Swahili', value: 'Swahili' },
  { label: 'Tamil', value: 'Tamil' },
  { label: 'Thai', value: 'Thai' },
  { label: 'Turkish', value: 'Turkish' },
  { label: 'Twi', value: 'Twi' },
  { label: 'Urdu', value: 'Urdu' },
  { label: 'Vietnamese', value: 'Vietnamese' },
  { label: 'Xhosa', value: 'Xhosa' },
  { label: 'Yoruba', value: 'Yoruba' },
  { label: 'Zulu', value: 'Zulu' },
] as const;

export type LanguageValue = typeof LANGUAGES[number]['value'];

export interface LanguageInfo {
  name: string;
  code: string; // BCP-47 / ISO
  flag: string; // Emoji flag
  speechCode: string; // e.g. en-US, fr-FR, sw-KE
  rtl?: boolean;
}

export const LANGUAGE_METADATA: Record<string, LanguageInfo> = {
  Afrikaans: { name: 'Afrikaans', code: 'af', flag: '🇿🇦', speechCode: 'af-ZA' },
  Amharic: { name: 'Amharic', code: 'am', flag: '🇪🇹', speechCode: 'am-ET' },
  Arabic: { name: 'Arabic', code: 'ar', flag: '🇸🇦', speechCode: 'ar-SA', rtl: true },
  Bengali: { name: 'Bengali', code: 'bn', flag: '🇧🇩', speechCode: 'bn-BD' },
  Chichewa: { name: 'Chichewa', code: 'ny', flag: '🇲🇼', speechCode: 'ny-MW' },
  Chinese: { name: 'Chinese', code: 'zh', flag: '🇨🇳', speechCode: 'zh-CN' },
  Dutch: { name: 'Dutch', code: 'nl', flag: '🇳🇱', speechCode: 'nl-NL' },
  English: { name: 'English', code: 'en', flag: '🇺🇸', speechCode: 'en-US' },
  French: { name: 'French', code: 'fr', flag: '🇫🇷', speechCode: 'fr-FR' },
  German: { name: 'German', code: 'de', flag: '🇩🇪', speechCode: 'de-DE' },
  Hausa: { name: 'Hausa', code: 'ha', flag: '🇳🇬', speechCode: 'ha-NG' },
  Hindi: { name: 'Hindi', code: 'hi', flag: '🇮🇳', speechCode: 'hi-IN' },
  Igbo: { name: 'Igbo', code: 'ig', flag: '🇳🇬', speechCode: 'ig-NG' },
  Indonesian: { name: 'Indonesian', code: 'id', flag: '🇮🇩', speechCode: 'id-ID' },
  Italian: { name: 'Italian', code: 'it', flag: '🇮🇹', speechCode: 'it-IT' },
  Japanese: { name: 'Japanese', code: 'ja', flag: '🇯🇵', speechCode: 'ja-JP' },
  Kinyarwanda: { name: 'Kinyarwanda', code: 'rw', flag: '🇷🇼', speechCode: 'rw-RW' },
  Korean: { name: 'Korean', code: 'ko', flag: '🇰🇷', speechCode: 'ko-KR' },
  Lingala: { name: 'Lingala', code: 'ln', flag: '🇨🇩', speechCode: 'ln-CD' },
  Luganda: { name: 'Luganda', code: 'lg', flag: '🇺🇬', speechCode: 'lg-UG' },
  Malagasy: { name: 'Malagasy', code: 'mg', flag: '🇲🇬', speechCode: 'mg-MG' },
  Oromo: { name: 'Oromo', code: 'om', flag: '🇪🇹', speechCode: 'om-ET' },
  Polish: { name: 'Polish', code: 'pl', flag: '🇵🇱', speechCode: 'pl-PL' },
  Portuguese: { name: 'Portuguese', code: 'pt', flag: '🇵🇹', speechCode: 'pt-PT' },
  Russian: { name: 'Russian', code: 'ru', flag: '🇷🇺', speechCode: 'ru-RU' },
  Sesotho: { name: 'Sesotho', code: 'st', flag: '🇱🇸', speechCode: 'st-ZA' },
  Shona: { name: 'Shona', code: 'sn', flag: '🇿🇼', speechCode: 'sn-ZW' },
  Somali: { name: 'Somali', code: 'so', flag: '🇸🇴', speechCode: 'so-SO' },
  Spanish: { name: 'Spanish', code: 'es', flag: '🇪🇸', speechCode: 'es-ES' },
  Swahili: { name: 'Swahili', code: 'sw', flag: '🇰🇪', speechCode: 'sw-KE' },
  Tamil: { name: 'Tamil', code: 'ta', flag: '🇮🇳', speechCode: 'ta-IN' },
  Thai: { name: 'Thai', code: 'th', flag: '🇹🇭', speechCode: 'th-TH' },
  Turkish: { name: 'Turkish', code: 'tr', flag: '🇹🇷', speechCode: 'tr-TR' },
  Twi: { name: 'Twi', code: 'ak', flag: '🇬🇭', speechCode: 'ak-GH' },
  Urdu: { name: 'Urdu', code: 'ur', flag: '🇵🇰', speechCode: 'ur-PK', rtl: true },
  Vietnamese: { name: 'Vietnamese', code: 'vi', flag: '🇻🇳', speechCode: 'vi-VN' },
  Xhosa: { name: 'Xhosa', code: 'xh', flag: '🇿🇦', speechCode: 'xh-ZA' },
  Yoruba: { name: 'Yoruba', code: 'yo', flag: '🇳🇬', speechCode: 'yo-NG' },
  Zulu: { name: 'Zulu', code: 'zu', flag: '🇿🇦', speechCode: 'zu-ZA' },
};

export const POPULAR_LANGUAGES: string[] = [
  'English',
  'Kinyarwanda',
  'Spanish',
  'French',
  'Swahili',
  'Yoruba',
  'Hausa',
  'Arabic',
  'German',
  'Portuguese',
  'Chinese',
];

export function getLanguageMetadata(name?: string | null): LanguageInfo {
  if (!name) return { name: 'English', code: 'en', flag: '🇺🇸', speechCode: 'en-US' };
  return (
    LANGUAGE_METADATA[name] || {
      name,
      code: 'en',
      flag: '🌐',
      speechCode: 'en-US',
    }
  );
}

export const EARLY_ADOPTER_LIMIT = 5000;
export const EARLY_ADOPTER_PLAN = 'early_adopter_pioneer';
export const STANDARD_PLAN = 'standard';

export const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,30}$/;
export const MAX_MESSAGE_LENGTH = 5000;


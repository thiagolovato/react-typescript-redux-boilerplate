import { useTranslation } from 'react-i18next';

export type Language = 'pt-BR' | 'en-US';

export const useI18n = () => {
  const { t, i18n } = useTranslation();

  const currentLanguage = i18n.language as Language;

  const changeLanguage = async (language: Language) => {
    try {
      await i18n.changeLanguage(language);
      // Explicitly save to localStorage to ensure persistence
      localStorage.setItem('language', language);
      console.log(`Language changed to: ${language}`);
    } catch (error) {
      console.error('Error changing language:', error);
    }
  };

  const languages = [
    { code: 'pt-BR' as Language, name: 'Português', flag: '🇧🇷' },
    { code: 'en-US' as Language, name: 'English', flag: '🇺🇸' },
  ];

  // Get the stored language or default to pt-BR
  const getStoredLanguage = (): Language => {
    const stored = localStorage.getItem('language') as Language;
    if (stored && ['pt-BR', 'en-US'].includes(stored)) {
      return stored;
    }
    return 'pt-BR';
  };

  // Initialize language from storage if not already set
  const initializeLanguage = () => {
    const storedLang = getStoredLanguage();
    if (currentLanguage !== storedLang) {
      changeLanguage(storedLang);
    }
  };

  return {
    t,
    currentLanguage,
    changeLanguage,
    languages,
    isLoading: i18n.isInitialized === false,
    getStoredLanguage,
    initializeLanguage,
  };
};

import type { Language } from '../types/i18n';

// Texts kept in mentor-mentee-core (consent documents, interest area names) are stored per language with core's
// own language codes; this maps the interface language to them.
export const CORE_LANGUAGE_BY_UI_LANGUAGE: Record<Language, string> = {
  'pt-BR': 'pt_BR',
  'en-US': 'en_US',
};

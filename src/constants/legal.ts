import type { Language } from '../types/i18n';

// Consent texts (terms, research) come from mentor-mentee-core, versioned in the database.
// Core stores them per language with its own language codes; this maps the interface language to them.
export const CONSENT_LANGUAGE_BY_UI_LANGUAGE: Record<Language, string> = {
  'pt-BR': 'pt_BR',
  'en-US': 'en_US',
};

// In the document body, a block starting with this is a heading.
export const CONSENT_HEADING_PREFIX = '## ';
// Blocks of the document body are separated by a blank line.
export const CONSENT_BLOCK_SEPARATOR = /\n\s*\n/;

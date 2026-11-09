import { Link } from 'react-router';
import { LanguageToggle } from './ui';
import { useI18n } from '../hooks/useI18n';
import { TERMS_VERSION } from '../constants/legal';

// Order of the sections under "privacy.sections" in the locale files.
const SECTIONS = ['programme', 'data', 'use', 'access', 'research', 'rights', 'conduct'] as const;

/** Terms of use and privacy notice. Public: people read it before they register. */
export function Privacy() {
  const { t } = useI18n();

  return (
    <main className="relative mx-auto flex max-w-3xl flex-col gap-8 px-4 py-16 sm:px-8">
      <LanguageToggle className="absolute top-4 right-4" />
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">{t('privacy.title')}</h1>
        <p className="text-sm text-neutral-600">{t('privacy.version', { version: TERMS_VERSION })}</p>
      </div>
      <article className="flex flex-col gap-6 rounded-2xl border border-neutral-200 bg-white p-6 sm:p-8">
        {SECTIONS.map((section) => (
          <section key={section} className="flex flex-col gap-2">
            <h2 className="text-lg font-medium">{t(`privacy.sections.${section}.title`)}</h2>
            <p className="leading-relaxed text-neutral-700">{t(`privacy.sections.${section}.body`)}</p>
          </section>
        ))}
      </article>
      <Link to="/" className="self-start font-medium text-primary-700 underline-offset-2 hover:underline">
        {t('privacy.back')}
      </Link>
    </main>
  );
}

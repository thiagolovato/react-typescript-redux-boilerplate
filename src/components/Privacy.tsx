import { Link } from 'react-router';
import { ApiErrorAlert, LanguageToggle } from './ui';
import { useI18n } from '../hooks/useI18n';
import { useConsentDocuments } from '../hooks/useConsentDocuments';
import { ConsentText } from './legal/ConsentText';

/** Terms of use and privacy notice in force, from the server. Public: people read it before they register. */
export function Privacy() {
  const { t } = useI18n();
  const { documents, error, loading } = useConsentDocuments();
  const terms = documents.TERMS;

  return (
    <main className="relative mx-auto flex max-w-3xl flex-col gap-8 px-4 py-16 sm:px-8">
      <LanguageToggle className="absolute top-4 right-4" />
      {loading && <p role="status" className="text-lg text-neutral-600">{t('privacy.loading')}</p>}
      <ApiErrorAlert error={error} fallback={t('privacy.loadError')} />
      {!loading && terms && (
        <>
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-semibold tracking-tight">{terms.title}</h1>
            <p className="text-sm text-neutral-600">{t('privacy.version', { version: terms.version })}</p>
          </div>
          <article className="rounded-2xl border border-neutral-200 bg-white p-6 sm:p-8">
            <ConsentText body={terms.body} />
          </article>
        </>
      )}
      <Link to="/" className="self-start font-medium text-primary-700 underline-offset-2 hover:underline">
        {t('privacy.back')}
      </Link>
    </main>
  );
}

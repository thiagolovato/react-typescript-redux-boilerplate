import { useI18n } from '../hooks/useI18n';

// Coordinator home. The panel with candidates, proposals and pairs comes in phase 2 (PLANO.md, step 6).
export function Coordination() {
  const { t } = useI18n();

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-10">
      <header className="max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{t('coordination.title')}</h1>
        <p className="mt-3 text-lg text-neutral-600">{t('coordination.subtitle')}</p>
      </header>
    </div>
  );
}

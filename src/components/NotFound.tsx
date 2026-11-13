import { useState } from 'react';
import { Link } from 'react-router';
import { Bird, LanguageToggle } from './ui';
import { useI18n } from '../hooks/useI18n';
import { useAppSelector } from '../redux/hooks';
import { homePathFor } from '../constants/auth';
import { APP_ROUTES } from '../constants/routes';

/**
 * Page for any unknown address. The mentee bird has flown off the branch and circles the 0; the mentor waits on
 * the branch. Clicking the bird brings it back. Motion lives in src/index.css (nf-*) and stops under reduced motion.
 */
export function NotFound() {
  const { t } = useI18n();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const [isBirdHome, setIsBirdHome] = useState(false);
  const homePath = isAuthenticated ? homePathFor(user?.customerType) : APP_ROUTES.root;

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-16
      text-center">
      <LanguageToggle className="absolute top-4 right-4" />

      <div className="nf-rise flex items-center gap-[0.18em] text-[clamp(6rem,26vw,12rem)] leading-none font-semibold
        tracking-tight text-neutral-900">
        <span aria-hidden="true">4</span>
        <span className="relative">
          <svg
            viewBox="0 0 100 32"
            preserveAspectRatio="none"
            aria-hidden="true"
            className="absolute top-1/2 left-1/2 h-[0.32em] w-[1em] -translate-x-1/2 -translate-y-1/2 overflow-visible"
          >
            <ellipse
              cx="50"
              cy="16"
              rx="50"
              ry="16"
              fill="none"
              stroke="var(--color-neutral-300)"
              strokeWidth="1.5"
              strokeDasharray="4 6"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          <span aria-hidden="true" className="relative z-1">0</span>
          {!isBirdHome && (
            <span className="nf-orbit-x absolute top-1/2 left-1/2 -mt-[0.15em] -ml-[0.18em] block w-[0.36em]">
              <span className="nf-orbit-y block">
                <button
                  type="button"
                  onClick={() => setIsBirdHome(true)}
                  aria-label={t('notFound.callBird')}
                  className="nf-face block w-full rounded-full"
                >
                  <Bird role="MENTEE" flapping />
                </button>
              </span>
            </span>
          )}
        </span>
        <span aria-hidden="true">4</span>
      </div>

      <div className="relative mt-4 h-32 w-full max-w-88">
        <div className="nf-grow absolute right-0 bottom-6 left-0 h-2.5 rounded-full bg-perch" />
        <span className="absolute bottom-[1.7rem] left-[16%] block w-28">
          <span className={`block ${isBirdHome ? 'nf-hop' : 'nf-look'}`}>
            <span className="nf-drop block">
              <Bird role="MENTOR" />
            </span>
          </span>
        </span>
        {isBirdHome && (
          <span className="absolute right-[16%] bottom-[1.85rem] block w-20 -scale-x-100">
            <span className="nf-land block">
              <Bird role="MENTEE" flapping className="nf-flap-brief" />
            </span>
          </span>
        )}
      </div>

      <p aria-live="polite" className="text-sm text-neutral-600">
        {t(isBirdHome ? 'notFound.birdHome' : 'notFound.hint')}
      </p>

      <h1 className="mt-10 text-2xl font-semibold tracking-tight sm:text-3xl">{t('notFound.title')}</h1>
      <p className="mt-3 max-w-md text-neutral-600">{t('notFound.description')}</p>
      <Link
        to={homePath}
        className="mt-8 inline-flex h-12 items-center rounded-lg bg-primary-600 px-6 font-medium text-white
          hover:bg-primary-700 active:bg-primary-800"
      >
        {t('notFound.back')}
      </Link>
    </main>
  );
}

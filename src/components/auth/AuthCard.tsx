import React from 'react';
import { useI18n } from '../../hooks/useI18n';
import { LanguageToggle } from '../ui';
import birds from '../../assets/mentor-mentee-birds-640.jpg';

interface AuthCardProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export function AuthCard({ title, subtitle, children }: AuthCardProps) {
  const { t } = useI18n();

  return (
    <main className="relative flex min-h-screen items-center justify-center px-4 py-20 sm:px-8">
      <LanguageToggle className="absolute top-4 right-4" />

      <div className="grid w-full max-w-5xl items-center gap-10 lg:grid-cols-[1fr_28rem] lg:gap-20">
        <section className="flex flex-col items-start gap-6">
          {/* The birds stand on the perch: mentor blue fading into mentee green. */}
          <div className="w-44 sm:w-56 lg:w-full lg:max-w-md">
            <div className="aspect-[1024/505] overflow-hidden">
              <img
                src={birds}
                alt=""
                className="size-full object-cover object-[50%_40%] mix-blend-multiply mask-x-from-90% mask-t-from-94%"
              />
            </div>
            <div aria-hidden="true" className="h-1.5 rounded-full bg-perch" />
          </div>
          <div className="flex flex-col gap-3">
            <p className="text-3xl font-semibold tracking-tight text-neutral-900 lg:text-5xl">{t('app.name')}</p>
            <p className="max-w-sm text-base leading-relaxed text-neutral-600 lg:text-lg">{t('app.tagline')}</p>
          </div>
        </section>

        <section className="flex flex-col gap-6 rounded-2xl border border-neutral-200 bg-white p-6 sm:p-8">
          <header>
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            <p className="mt-1 text-neutral-600">{subtitle}</p>
          </header>
          {children}
        </section>
      </div>
    </main>
  );
}

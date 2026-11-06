import React from 'react';
import { useI18n } from '../../hooks/useI18n';
import { LanguageToggle } from '../ui';
import logo from '../../assets/mentor-mentee-logo.png';

interface AuthCardProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export function AuthCard({ title, subtitle, children }: AuthCardProps) {
  const { t } = useI18n();

  return (
    <main className="relative flex min-h-screen items-center justify-center px-4 py-16">
      <LanguageToggle className="absolute top-4 right-4" />
      <div className="grid w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-xl lg:grid-cols-2">
        <section
          className="flex flex-col items-center justify-center gap-4 bg-linear-135 from-primary-600 via-primary-800
            to-secondary-600 p-6 text-center text-white lg:p-10"
        >
          <img src={logo} alt={t('app.name')} className="size-20 rounded-full lg:size-64" />
          <p className="max-w-xs text-base opacity-90 lg:text-lg">{t('app.tagline')}</p>
        </section>

        <section className="flex flex-col gap-6 p-6 sm:p-10">
          <header className="text-center">
            <h1 className="text-2xl font-bold text-neutral-900">{title}</h1>
            <p className="mt-2 text-neutral-600">{subtitle}</p>
          </header>
          {children}
        </section>
      </div>
    </main>
  );
}

export function FormError({ children }: { children: React.ReactNode }) {
  return (
    <p role="alert" className="rounded-md border border-error-main bg-error-light p-3 text-sm text-error-dark">
      {children}
    </p>
  );
}

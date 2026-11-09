import type { ReactNode } from 'react';

interface SpecimenProps {
  id: string;
  title: string;
  description: string;
  code?: string;
  children: ReactNode;
}

/** One design-system entry: what it is, a live preview, and the code that produced it. */
export function Specimen({ id, title, description, code, children }: SpecimenProps) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="flex scroll-mt-8 flex-col gap-4">
      <header className="max-w-2xl">
        <h2 id={`${id}-title`} className="text-2xl font-semibold tracking-tight">{title}</h2>
        <p className="mt-2 leading-relaxed text-neutral-600">{description}</p>
      </header>
      <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
        <div className="p-6">{children}</div>
        {code && (
          <pre className="overflow-x-auto border-t border-neutral-200 bg-neutral-100 px-6 py-4 text-sm leading-relaxed
            text-neutral-800"
          >
            <code>{code.trim()}</code>
          </pre>
        )}
      </div>
    </section>
  );
}

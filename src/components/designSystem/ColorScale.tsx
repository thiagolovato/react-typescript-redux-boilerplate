interface ColorScaleProps {
  name: string;
  scale: Readonly<Record<string | number, string>>;
}

/** Swatches for one palette scale, read straight from constants/colors.ts so the page never drifts. */
export function ColorScale({ name, scale }: ColorScaleProps) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="font-mono text-sm text-neutral-700">{name}</h3>
      <ul className="grid grid-cols-[repeat(auto-fill,minmax(8rem,1fr))] gap-2">
        {Object.entries(scale).map(([step, hex]) => (
          <li key={step} className="overflow-hidden rounded-lg border border-neutral-200">
            <span aria-hidden="true" className="block h-12" style={{ backgroundColor: hex }} />
            <span className="block px-2 py-1.5 font-mono text-xs leading-tight">
              <span className="block text-neutral-900">{`${name}-${step}`}</span>
              <span className="block text-neutral-600">{hex}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

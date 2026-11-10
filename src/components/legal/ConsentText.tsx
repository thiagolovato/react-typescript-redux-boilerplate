import { CONSENT_BLOCK_SEPARATOR, CONSENT_HEADING_PREFIX } from '../../constants/legal';

interface ConsentTextProps {
  /** Document body: headings start with "## ", a blank line separates blocks. */
  body: string;
}

/** Renders a consent document body as headings and paragraphs. Plain text only: nothing is parsed as HTML. */
export function ConsentText({ body }: ConsentTextProps) {
  const blocks = body.split(CONSENT_BLOCK_SEPARATOR).map((block) => block.trim()).filter(Boolean);

  return (
    <div className="flex flex-col gap-3">
      {blocks.map((block, index) => (block.startsWith(CONSENT_HEADING_PREFIX)
        ? (
          <h2 key={index} className="mt-3 text-lg font-medium first:mt-0">
            {block.slice(CONSENT_HEADING_PREFIX.length)}
          </h2>
        )
        : <p key={index} className="leading-relaxed text-neutral-700">{block}</p>))}
    </div>
  );
}

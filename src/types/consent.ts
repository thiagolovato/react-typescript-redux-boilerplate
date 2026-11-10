// Consent texts in force, from mentor-mentee-core (GET /consents/current).

export type ConsentKind = 'TERMS' | 'RESEARCH';

/** One consent document in force, with its text in one language. Same shape as ConsentDocumentResponse in core. */
export interface ConsentDocument {
  /** Sent back on a profile save to say which text the person accepted. */
  id: number;
  kind: ConsentKind;
  version: string;
  publishedAt: string;
  /** Language of `title` and `body`, a core language code such as `pt_BR`. */
  language: string;
  title: string;
  /** Headings start with "## "; a blank line separates blocks. */
  body: string;
  sha256: string;
  /** Every language this document has a text in. */
  languages: string[];
}

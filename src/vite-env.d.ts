/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of the API gateway, e.g. `http://localhost:8765`. */
  readonly VITE_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_IS_NATIVE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_OPENROUTER_API_KEY: string
  readonly VITE_OPENROUTER_BASE_URL: string
  readonly VITE_LLM_MODEL: string
  readonly VITE_EMBEDDING_MODEL: string
  readonly VITE_CHUNK_SIZE: string
  readonly VITE_CHUNK_OVERLAP: string
  readonly VITE_TOP_K: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

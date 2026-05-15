export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  loading?: boolean
}

export interface ResumeState {
  loaded: boolean
  fileName: string
  chunkCount: number
}

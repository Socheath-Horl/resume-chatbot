import { ref } from 'vue'
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import { MemoryVectorStore } from 'langchain/vectorstores/memory'
import { OpenAIEmbeddings } from '@langchain/openai'
import type { ResumeState } from '../types'

const resume = ref<ResumeState>({ loaded: false, fileName: '', chunkCount: 0 })
let vectorStore: MemoryVectorStore | null = null

const {
  VITE_OPENROUTER_API_KEY: apiKey,
  VITE_OPENROUTER_BASE_URL: baseUrl,
  VITE_EMBEDDING_MODEL: embeddingModel,
  VITE_CHUNK_SIZE: chunkSize,
  VITE_CHUNK_OVERLAP: chunkOverlap,
} = import.meta.env

async function extractTextFromPDF(file: File): Promise<string> {
  const PDFJS = await import('pdfjs-dist')
  PDFJS.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
  ).toString()

  const arrayBuffer = await file.arrayBuffer()
  const pdf = await PDFJS.getDocument({ data: arrayBuffer }).promise
  let text = ''
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    text += content.items.map((item: any) => item.str).join(' ') + '\n'
  }
  return text
}

function createEmbeddings() {
  return new OpenAIEmbeddings({
    modelName: embeddingModel,
    configuration: { baseURL: baseUrl },
    openAIApiKey: apiKey,
  })
}

export function useResume() {
  async function loadResume(file: File) {
    resume.value = { loaded: false, fileName: file.name, chunkCount: 0 }

    const rawText = await extractTextFromPDF(file)

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: Number(chunkSize),
      chunkOverlap: Number(chunkOverlap),
    })
    const chunks = await splitter.createDocuments([rawText])

    const embeddings = createEmbeddings()
    vectorStore = await MemoryVectorStore.fromDocuments(chunks, embeddings)

    resume.value = {
      loaded: true,
      fileName: file.name,
      chunkCount: chunks.length,
    }
  }

  function getVectorStore(): MemoryVectorStore {
    if (!vectorStore) throw new Error('No resume loaded')
    return vectorStore
  }

  function reset() {
    vectorStore = null
    resume.value = { loaded: false, fileName: '', chunkCount: 0 }
  }

  return { resume, loadResume, getVectorStore, reset }
}

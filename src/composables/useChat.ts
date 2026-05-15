import { ref } from 'vue'
import { ChatOpenAI } from '@langchain/openai'
import { ChatPromptTemplate } from '@langchain/core/prompts'
import { createStuffDocumentsChain } from 'langchain/chains/combine_documents'
import type { ChatMessage } from '../types'

const messages = ref<ChatMessage[]>([])
const processing = ref(false)

const {
  VITE_OPENROUTER_API_KEY: apiKey,
  VITE_OPENROUTER_BASE_URL: baseUrl,
  VITE_LLM_MODEL: llmModel,
  VITE_TOP_K: topK,
} = import.meta.env

const prompt = ChatPromptTemplate.fromTemplate(`
You are an HR assistant helping recruiters learn about job candidates.
Answer the question based ONLY on the provided resume context.
If the information is not in the context, say you don't know.
Be concise and professional.

Context:
{context}

Question:
{question}

Answer:`)

let chain: Awaited<ReturnType<typeof createStuffDocumentsChain>> | null = null

async function initChain() {
  const llm = new ChatOpenAI({
    modelName: llmModel,
    configuration: { baseURL: baseUrl },
    openAIApiKey: apiKey,
    temperature: 0,
  })

  chain = await createStuffDocumentsChain({
    llm,
    prompt,
  })
}

export function useChat() {
  async function ask(question: string, getVectorStore: () => any) {
    if (!chain) await initChain()

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: question,
    }
    messages.value.push(userMsg)

    const assistantMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: '',
      loading: true,
    }
    messages.value.push(assistantMsg)
    processing.value = true

    try {
      const vectorStore = getVectorStore()
      const retriever = vectorStore.asRetriever(Number(topK))
      const docs = await retriever.invoke(question)
      const answer = (await chain!.invoke({ context: docs, question })) as string

      assistantMsg.content = answer
      assistantMsg.loading = false
    } catch (err) {
      assistantMsg.content = 'Sorry, an error occurred while processing your question.'
      assistantMsg.loading = false
    } finally {
      processing.value = false
    }
  }

  function reset() {
    messages.value = []
    chain = null
  }

  return { messages, processing, ask, reset }
}

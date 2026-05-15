<script setup lang="ts">
import { ref, nextTick } from 'vue'
import MarkdownIt from 'markdown-it'
import { useChat } from '../composables/useChat'

const md = new MarkdownIt({ html: false, linkify: true })

const props = defineProps<{ getVectorStore: () => any }>()

const { messages, processing, ask } = useChat()
const input = ref('')
const chatEl = ref<HTMLElement | null>(null)
const textareaEl = ref<HTMLTextAreaElement | null>(null)

function render(content: string) {
  return md.render(content)
}

function autoResize() {
  const el = textareaEl.value
  if (!el) return
  el.style.height = 'auto'
  el.style.height = el.scrollHeight + 'px'
}

async function send() {
  const text = input.value.trim()
  if (!text || processing.value) return
  input.value = ''
  if (textareaEl.value) textareaEl.value.style.height = 'auto'
  await ask(text, props.getVectorStore)
  await nextTick()
  chatEl.value?.scrollTo({ top: chatEl.value.scrollHeight, behavior: 'smooth' })
}
</script>

<template>
  <div class="flex flex-1 flex-col overflow-hidden">
    <div ref="chatEl" class="flex-1 overflow-y-auto">
      <div class="mx-auto max-w-3xl space-y-6 px-4 py-8">
        <div v-for="msg in messages" :key="msg.id" class="msg-enter">
          <div class="flex items-start gap-3" :class="msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'">
            <div
              :class="[
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold shadow-sm',
                msg.role === 'user'
                  ? 'bg-gradient-to-br from-indigo-500 to-violet-500 text-white'
                  : 'bg-white text-slate-600 ring-1 ring-slate-200',
              ]"
            >
              {{ msg.role === 'user' ? 'H' : 'AI' }}
            </div>

            <div
              :class="[
                'max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm',
                msg.role === 'user'
                  ? 'rounded-tr-sm bg-gradient-to-br from-indigo-500 to-violet-500 text-white'
                  : 'rounded-tl-sm bg-white text-slate-700 ring-1 ring-slate-200',
              ]"
            >
              <template v-if="msg.loading">
                <span class="inline-flex items-center gap-1.5">
                  <span class="flex gap-1">
                    <span class="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:0ms]"></span>
                    <span class="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:150ms]"></span>
                    <span class="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:300ms]"></span>
                  </span>
                  <span class="text-xs opacity-70">Thinking...</span>
                </span>
              </template>
              <div v-else-if="msg.role === 'assistant'" class="prose max-w-none" v-html="render(msg.content)"></div>
              <template v-else>{{ msg.content }}</template>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="border-t border-slate-200/60 bg-white px-4 pb-4 pt-3">
      <div class="mx-auto max-w-3xl">
        <form
          class="flex items-center gap-3 rounded-2xl border-2 border-slate-200 bg-white py-2.5 pl-4 pr-2 shadow-sm transition-all focus-within:border-indigo-400 focus-within:shadow-lg focus-within:shadow-indigo-100"
          @submit.prevent="send"
        >
          <textarea
            ref="textareaEl"
            v-model="input"
            :placeholder="'Ask a question about this candidate\u2026'"
            :disabled="processing"
            rows="1"
            class="max-h-32 flex-1 resize-none border-none bg-transparent py-1 text-base outline-none placeholder:text-slate-400 disabled:opacity-50"
            @keydown.enter.exact.prevent="send"
            @input="autoResize"
          ></textarea>
          <button
            type="submit"
            :disabled="!input.trim() || processing"
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-md transition-all disabled:opacity-30 enabled:hover:shadow-lg enabled:hover:shadow-indigo-200 enabled:active:scale-90"
          >
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14m-7-7l7 7-7 7" />
            </svg>
          </button>
        </form>
        <p class="mt-2 text-center text-xs text-slate-400">
          Powered by
          <a href="https://openrouter.ai" target="_blank" class="font-medium text-indigo-500 hover:text-indigo-600">OpenRouter</a>
          {{ messages.length > 0 ? '· ' + messages.length + ' messages' : '' }}
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.prose h1,
.prose h2,
.prose h3,
.prose h4 {
  font-weight: 600;
  color: #1e293b;
  margin-top: 1em;
  margin-bottom: 0.5em;
}
.prose h1 { font-size: 1rem; }
.prose h2 { font-size: 0.875rem; }
.prose h3 { font-size: 0.875rem; }
.prose p { margin-bottom: 0.75em; }
.prose p:last-child { margin-bottom: 0; }
.prose ul,
.prose ol {
  padding-left: 1.25em;
  margin-bottom: 0.75em;
}
.prose li { margin-bottom: 0.25em; }
.prose code {
  border-radius: 0.25rem;
  background: #f1f5f9;
  padding: 0.125rem 0.25rem;
  font-size: 0.75rem;
  font-family: ui-monospace, monospace;
  color: #0f172a;
}
.prose pre {
  border-radius: 0.5rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  padding: 0.75rem;
  overflow-x: auto;
  margin-bottom: 0.75em;
}
.prose pre code {
  background: transparent;
  padding: 0;
  font-size: 0.75rem;
}
.prose strong { font-weight: 600; color: #1e293b; }
.prose a { color: #6366f1; text-decoration: underline; }
.prose blockquote {
  border-left: 2px solid #c7d2fe;
  padding-left: 0.75rem;
  font-style: italic;
  color: #64748b;
  margin-bottom: 0.75em;
}
.prose table {
  width: 100%;
  text-align: left;
  font-size: 0.75rem;
  margin-bottom: 0.75em;
  border-collapse: collapse;
}
.prose th {
  border-bottom: 1px solid #e2e8f0;
  padding: 0.375rem 0.5rem;
  font-weight: 600;
  background: #f8fafc;
}
.prose td {
  border-bottom: 1px solid #f1f5f9;
  padding: 0.375rem 0.5rem;
}
.prose hr { margin: 0.75rem 0; border-color: #e2e8f0; }
.prose ul li::marker { color: #a5b4fc; }
</style>

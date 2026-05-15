<script setup lang="ts">
import { useResume } from './composables/useResume'
import { useChat } from './composables/useChat'
import ResumeUploader from './components/ResumeUploader.vue'
import ChatWindow from './components/ChatWindow.vue'

const { resume, getVectorStore, reset: resetResume } = useResume()
const { reset: resetChat } = useChat()

function newSession() {
  resetChat()
  resetResume()
}
</script>

<template>
  <div class="flex h-screen flex-col bg-gradient-to-br from-slate-50 via-white to-indigo-50/40">
    <header class="flex-none border-b border-slate-200/60 bg-white/80 px-4 py-3 backdrop-blur-sm">
      <div class="mx-auto flex max-w-3xl items-center justify-between">
        <div class="flex items-center gap-2.5">
          <div class="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 shadow-sm">
            <svg class="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <span class="text-sm font-semibold text-slate-800">Resume Chatbot</span>
        </div>
        <div class="flex items-center gap-3">
          <button
            v-if="resume.loaded"
            class="flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-500 transition-all hover:bg-slate-100 hover:text-slate-700 active:scale-95"
            @click="newSession"
          >
            <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            New Session
          </button>
          <div v-if="resume.loaded" class="flex items-center gap-1.5 rounded-lg bg-indigo-50 px-2.5 py-1.5 text-xs font-medium text-indigo-600">
            <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {{ resume.fileName }}
          </div>
        </div>
      </div>
    </header>

    <Transition name="fade" mode="out-in">
      <div v-if="!resume.loaded" key="upload" class="flex flex-1 items-center justify-center">
        <ResumeUploader />
      </div>
      <ChatWindow v-else key="chat" :get-vector-store="getVectorStore" />
    </Transition>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.fade-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>

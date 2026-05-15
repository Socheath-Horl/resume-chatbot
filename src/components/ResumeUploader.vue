<script setup lang="ts">
import { ref } from 'vue'
import { useResume } from '../composables/useResume'

const emit = defineEmits<{ loaded: [] }>()
const { loadResume } = useResume()

const dragging = ref(false)
const loading = ref(false)

async function handleFile(file: File) {
  if (!file.name.endsWith('.pdf')) return
  loading.value = true
  await loadResume(file)
  loading.value = false
  emit('loaded')
}

async function handleFileUpload(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  await handleFile(file)
}

function onDragOver(e: DragEvent) {
  e.preventDefault()
  dragging.value = true
}
function onDragLeave() {
  dragging.value = false
}
function onDrop(e: DragEvent) {
  e.preventDefault()
  dragging.value = false
  const file = e.dataTransfer?.files[0]
  if (file) handleFile(file)
}
</script>

<template>
  <div class="flex flex-col items-center gap-8">
    <div class="float-icon">
      <div class="rounded-2xl bg-gradient-to-br from-indigo-100 to-violet-100 p-4 shadow-sm ring-1 ring-indigo-200/50">
        <div class="flex h-16 w-16 items-center justify-center rounded-xl bg-white shadow-sm">
          <svg class="h-8 w-8 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </div>
      </div>
    </div>

    <div class="text-center">
      <h2 class="text-xl font-semibold text-slate-800">Upload a resume to get started</h2>
      <p class="mt-1.5 text-sm text-slate-500">Drop a PDF or click to browse — we'll index it for Q&A</p>
    </div>

    <label
      class="group relative cursor-pointer overflow-hidden rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-6 py-3 text-sm font-medium text-white shadow-lg shadow-indigo-200 transition-all hover:shadow-xl hover:shadow-indigo-300 active:scale-[0.97]"
      @dragover="onDragOver"
      @dragleave="onDragLeave"
      @drop="onDrop"
    >
      <span class="relative z-10 flex items-center gap-2">
        <template v-if="loading">
          <svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Indexing...
        </template>
        <template v-else>
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Upload PDF
        </template>
      </span>
      <div class="absolute inset-0 -translate-x-full bg-white/10 transition-transform group-hover:translate-x-0"></div>
      <input id="resume-upload" type="file" accept=".pdf" class="hidden" @change="handleFileUpload" />
    </label>

    <p class="text-xs text-slate-400">Supports PDF files only</p>
  </div>
</template>

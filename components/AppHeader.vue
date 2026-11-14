<script setup lang="ts">
import type { HealthResponse } from '~/types/todo'

const { data: health } = useFetch<HealthResponse>('/api/health', { key: 'health' })
const isDemo = computed(
  () => health.value?.assistant === 'demo' || health.value?.storage === 'memory',
)
const demoTitle = computed(() => {
  const parts: string[] = []
  if (health.value?.assistant === 'demo') parts.push('keyword-based assistant (no Gemini key)')
  if (health.value?.storage === 'memory') parts.push('in-memory storage (no Supabase)')
  return `Demo mode: ${parts.join(', ')}`
})
</script>

<template>
  <header
    class="z-20 shrink-0 border-b border-stone-200 bg-stone-50/85 backdrop-blur dark:border-stone-800 dark:bg-stone-950/85"
  >
    <div class="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:px-6">
      <NuxtLink to="/" class="flex items-center gap-2.5 rounded-lg" aria-label="Convo-Todo home">
        <img src="/favicon.png" alt="" width="32" height="32" class="h-8 w-8 rounded-lg" />
        <span class="text-lg font-semibold tracking-tight">Convo-Todo</span>
      </NuxtLink>
      <span
        v-if="isDemo"
        :title="demoTitle"
        class="hidden rounded-full border border-amber-300 bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-900 sm:inline-flex dark:border-amber-700/60 dark:bg-amber-950/60 dark:text-amber-200"
      >
        Demo mode
      </span>
      <div class="ml-auto flex items-center gap-1">
        <slot name="actions" />
        <ThemeToggle />
      </div>
    </div>
  </header>
</template>

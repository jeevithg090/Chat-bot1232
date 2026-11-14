<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()
const notFound = computed(() => props.error.statusCode === 404)

useSeoMeta({ title: () => (notFound.value ? 'Page not found' : 'Something went wrong') })

const goHome = () => clearError({ redirect: '/' })
</script>

<template>
  <div class="flex min-h-dvh flex-col">
    <AppHeader />
    <main class="flex flex-1 items-center justify-center px-4 py-16">
      <div class="max-w-md text-center">
        <p class="text-sm font-semibold tracking-wide text-teal-700 dark:text-teal-400">
          {{ error.statusCode || 'Error' }}
        </p>
        <h1 class="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
          {{ notFound ? 'This page wandered off' : 'Something went wrong' }}
        </h1>
        <p class="mt-3 text-[15px] text-stone-600 dark:text-stone-400">
          {{
            notFound
              ? "We couldn't find the page you were looking for. It might have been moved or never existed."
              : 'An unexpected error occurred. Please try again in a moment.'
          }}
        </p>
        <button type="button" class="btn-primary mt-8" @click="goHome">
          <Icon name="lucide:arrow-left" class="h-4 w-4" aria-hidden="true" />
          Back to your tasks
        </button>
      </div>
    </main>
  </div>
</template>

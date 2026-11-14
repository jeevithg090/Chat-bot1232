<script setup lang="ts">
import type { ChatMessage } from '~/composables/useChat'

const props = defineProps<{ message: ChatMessage }>()
const html = computed(() => renderMarkdown(props.message.text))
const isUser = computed(() => props.message.role === 'user')
</script>

<template>
  <!-- eslint-disable vue/no-v-html -->
  <li class="flex animate-fade-up gap-3" :class="isUser ? 'justify-end' : 'justify-start'">
    <span
      v-if="!isUser"
      class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
      :class="
        message.error
          ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
          : 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300'
      "
      aria-hidden="true"
    >
      <Icon :name="message.error ? 'lucide:triangle-alert' : 'lucide:bot'" class="h-4 w-4" />
    </span>
    <div
      class="min-w-0 max-w-[85%] rounded-2xl px-4 py-2.5 sm:max-w-[75%]"
      :class="
        isUser
          ? 'rounded-br-md bg-teal-700 text-white dark:bg-teal-700'
          : message.error
            ? 'rounded-bl-md border border-red-200 bg-red-50 text-red-900 dark:border-red-900 dark:bg-red-950/60 dark:text-red-100'
            : 'rounded-bl-md border border-stone-200 bg-white text-stone-900 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-100'
      "
      :role="message.error ? 'alert' : undefined"
    >
      <span class="sr-only">{{ isUser ? 'You said:' : 'Assistant said:' }}</span>
      <!-- renderMarkdown escapes raw HTML and unsafe links, so v-html is safe here. -->
      <div
        class="prose prose-sm max-w-none break-words prose-p:my-1 prose-ol:my-1.5 prose-ul:my-1.5 prose-li:my-0.5 sm:text-[15px]"
        :class="
          isUser
            ? 'prose-invert text-white prose-p:text-white prose-strong:text-white'
            : message.error
              ? 'text-red-900 dark:text-red-100'
              : 'text-stone-900 dark:prose-invert prose-a:text-teal-700 dark:text-stone-100 dark:prose-a:text-teal-300'
        "
        v-html="html"
      />
    </div>
  </li>
</template>

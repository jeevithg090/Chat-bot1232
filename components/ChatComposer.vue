<script setup lang="ts">
import { MAX_MESSAGE_LENGTH } from '~/composables/useChat'

const props = defineProps<{ disabled?: boolean }>()
const emit = defineEmits<{ send: [text: string] }>()

const text = ref('')
const textarea = ref<HTMLTextAreaElement | null>(null)
const tooLong = computed(() => text.value.length > MAX_MESSAGE_LENGTH)
const canSend = computed(() => !props.disabled && !!text.value.trim() && !tooLong.value)

function resize() {
  const el = textarea.value
  if (!el) return
  el.style.height = 'auto'
  el.style.height = `${Math.min(el.scrollHeight, 160)}px`
}

function submit() {
  if (!canSend.value) return
  emit('send', text.value)
  text.value = ''
  nextTick(resize)
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
    e.preventDefault()
    submit()
  }
}

defineExpose({ focus: () => textarea.value?.focus() })
</script>

<template>
  <form
    class="card flex flex-col gap-1 p-2 transition-shadow focus-within:border-teal-600 focus-within:ring-2 focus-within:ring-teal-600/25 dark:focus-within:border-teal-400"
    @submit.prevent="submit"
  >
    <div class="flex items-end gap-2">
      <label for="composer" class="sr-only">Message the assistant</label>
      <textarea
        id="composer"
        ref="textarea"
        v-model="text"
        rows="1"
        class="max-h-40 min-h-11 flex-1 resize-none bg-transparent px-2.5 py-2.5 text-[15px] leading-6 text-stone-900 placeholder:text-stone-500 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 dark:text-stone-100 dark:placeholder:text-stone-400"
        placeholder="Add, complete or list tasks…"
        autocomplete="off"
        enterkeyhint="send"
        :aria-invalid="tooLong || undefined"
        aria-describedby="composer-hint"
        @input="resize"
        @keydown="onKeydown"
      />
      <button
        type="submit"
        class="btn-primary h-11 w-11 shrink-0 px-0"
        :disabled="!canSend"
        aria-label="Send message"
      >
        <Icon name="lucide:send-horizontal" class="h-5 w-5" aria-hidden="true" />
      </button>
    </div>
    <p
      id="composer-hint"
      class="px-2.5 pb-1 text-xs"
      :class="tooLong ? 'text-red-700 dark:text-red-400' : 'text-stone-500 dark:text-stone-400'"
      :aria-live="tooLong ? 'polite' : undefined"
    >
      <template v-if="tooLong">
        That message is {{ text.length - MAX_MESSAGE_LENGTH }} characters too long ({{
          MAX_MESSAGE_LENGTH
        }}
        max).
      </template>
      <template v-else>
        <span class="hidden sm:inline">Press Enter to send · Shift + Enter for a new line</span>
        <span class="sm:hidden">Type <strong>help</strong> to see what I can do</span>
      </template>
    </p>
  </form>
</template>

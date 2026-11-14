<script setup lang="ts">
useSeoMeta({ title: 'Chat with your to-do list' })

const { messages, isSending, send } = useChat()
const { status, counts, refresh } = useTodos()

const scroller = ref<HTMLElement | null>(null)
const composer = ref<{ focus: () => void } | null>(null)
const panelOpen = ref(false)
const panelEl = ref<HTMLElement | null>(null)
const tasksButton = ref<HTMLButtonElement | null>(null)

const suggestions = ['Add buy milk to my list', 'Show my todos', 'How many tasks are left?', 'help']

onMounted(() => {
  if (status.value === 'idle') refresh()
})

watch(
  () => [messages.value.length, isSending.value],
  () =>
    nextTick(() => {
      scroller.value?.scrollTo({ top: scroller.value.scrollHeight, behavior: 'smooth' })
    }),
)

function sendSuggestion(text: string) {
  send(text)
  composer.value?.focus()
}

function openPanel() {
  panelOpen.value = true
  nextTick(() => panelEl.value?.querySelector<HTMLElement>('[data-autofocus]')?.focus())
}

function closePanel() {
  panelOpen.value = false
  nextTick(() => tasksButton.value?.focus())
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && panelOpen.value) closePanel()
}
onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <div class="flex h-dvh flex-col overflow-hidden">
    <a
      href="#composer"
      class="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-teal-700 focus:px-4 focus:py-2 focus:text-white"
    >
      Skip to message box
    </a>
    <AppHeader>
      <template #actions>
        <button
          ref="tasksButton"
          type="button"
          class="btn-ghost lg:hidden"
          aria-controls="tasks-panel"
          :aria-expanded="panelOpen"
          @click="openPanel"
        >
          <Icon name="lucide:list-checks" class="h-5 w-5" aria-hidden="true" />
          Tasks
          <span
            v-if="counts.open"
            class="rounded-full bg-teal-700 px-1.5 text-xs font-semibold leading-5 text-white"
          >
            {{ counts.open }}<span class="sr-only"> open</span>
          </span>
        </button>
      </template>
    </AppHeader>

    <div
      class="mx-auto grid min-h-0 w-full max-w-6xl flex-1 gap-6 px-0 sm:px-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:py-6"
    >
      <!-- Chat -->
      <main class="flex min-h-0 flex-col">
        <h1 class="sr-only">Chat with your to-do list</h1>
        <div ref="scroller" class="min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-1 lg:pt-0">
          <!-- Empty state -->
          <div
            v-if="!messages.length"
            class="mx-auto flex max-w-lg flex-col items-center pt-6 text-center sm:pt-12"
          >
            <span
              class="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300"
            >
              <Icon name="lucide:message-square-text" class="h-7 w-7" aria-hidden="true" />
            </span>
            <h2 class="mt-5 text-2xl font-semibold tracking-tight sm:text-3xl">
              What do you need to get done?
            </h2>
            <p class="mt-2 text-[15px] text-stone-600 dark:text-stone-400">
              Tell me in your own words. I can add, complete, re-open and delete tasks, or answer
              questions about your list.
            </p>
            <ul class="mt-6 flex flex-wrap justify-center gap-2" aria-label="Example messages">
              <li v-for="s in suggestions" :key="s">
                <button type="button" class="chip" :disabled="isSending" @click="sendSuggestion(s)">
                  {{ s }}
                </button>
              </li>
            </ul>
          </div>

          <ol
            v-else
            class="mx-auto flex max-w-3xl flex-col gap-4"
            role="log"
            aria-live="polite"
            aria-label="Conversation"
          >
            <ChatBubble v-for="m in messages" :key="m.id" :message="m" />
            <TypingIndicator v-if="isSending" />
          </ol>
        </div>

        <div class="mx-auto w-full max-w-3xl px-3 pb-3 sm:px-1 sm:pb-4 lg:pb-0">
          <ChatComposer ref="composer" :disabled="isSending" @send="send" />
        </div>
      </main>

      <!-- Tasks: sidebar on desktop -->
      <aside class="card hidden min-h-0 overflow-hidden lg:flex lg:flex-col" aria-label="Tasks">
        <TaskPanel />
      </aside>
    </div>

    <!-- Tasks: slide-over on phones and tablets -->
    <Transition
      enter-active-class="transition-opacity duration-200"
      leave-active-class="transition-opacity duration-150"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="panelOpen"
        class="fixed inset-0 z-30 bg-stone-950/40 backdrop-blur-sm lg:hidden"
        aria-hidden="true"
        @click="closePanel"
      />
    </Transition>
    <Transition
      enter-active-class="transition-transform duration-200 ease-out"
      leave-active-class="transition-transform duration-150 ease-in"
      enter-from-class="translate-x-full"
      leave-to-class="translate-x-full"
    >
      <div
        v-if="panelOpen"
        id="tasks-panel"
        ref="panelEl"
        class="fixed inset-y-0 right-0 z-40 flex w-full max-w-sm flex-col border-l border-stone-200 bg-white shadow-xl lg:hidden dark:border-stone-800 dark:bg-stone-900"
        role="dialog"
        aria-modal="true"
        aria-label="Your tasks"
      >
        <TaskPanel closable @close="closePanel" />
      </div>
    </Transition>
  </div>
</template>

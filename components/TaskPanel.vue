<script setup lang="ts">
import type { Todo } from '~/types/todo'

defineEmits<{ close: [] }>()
defineProps<{ closable?: boolean }>()

const { todos, status, error, pending, counts, refresh, add, toggle, remove } = useTodos()

const newTask = ref('')
const formError = ref<string | null>(null)
const actionError = ref<string | null>(null)
const adding = ref(false)
const MAX_TASK_LENGTH = 300

async function onAdd() {
  const content = newTask.value.trim()
  formError.value = null
  if (!content) {
    formError.value = 'Please enter a task before adding it.'
    return
  }
  if (content.length > MAX_TASK_LENGTH) {
    formError.value = `Tasks can be at most ${MAX_TASK_LENGTH} characters long.`
    return
  }
  adding.value = true
  try {
    await add(content)
    newTask.value = ''
  } catch (e) {
    formError.value = getErrorMessage(e, 'Could not add the task.')
  } finally {
    adding.value = false
  }
}

async function run(fn: (t: Todo) => Promise<void>, todo: Todo, fallback: string) {
  actionError.value = null
  try {
    await fn(todo)
  } catch (e) {
    actionError.value = getErrorMessage(e, fallback)
  }
}

const progress = computed(() =>
  counts.value.total ? Math.round((counts.value.done / counts.value.total) * 100) : 0,
)
</script>

<template>
  <section class="flex h-full min-h-0 flex-col" aria-labelledby="tasks-heading">
    <div
      class="flex items-start justify-between gap-3 border-b border-stone-200 p-4 dark:border-stone-800"
    >
      <div class="min-w-0">
        <h2 id="tasks-heading" class="text-base font-semibold">Your tasks</h2>
        <p class="mt-0.5 text-sm text-stone-600 dark:text-stone-400">
          <template v-if="counts.total"> {{ counts.open }} open · {{ counts.done }} done </template>
          <template v-else>Nothing here yet</template>
        </p>
      </div>
      <div class="flex items-center gap-1">
        <button
          type="button"
          class="btn-icon"
          aria-label="Refresh tasks"
          title="Refresh"
          :disabled="status === 'loading'"
          @click="refresh"
        >
          <Icon
            name="lucide:refresh-cw"
            class="h-4 w-4"
            :class="{ 'animate-spin': status === 'loading' }"
            aria-hidden="true"
          />
        </button>
        <button
          v-if="closable"
          type="button"
          class="btn-icon"
          aria-label="Close tasks panel"
          data-autofocus
          @click="$emit('close')"
        >
          <Icon name="lucide:x" class="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
    </div>

    <div
      v-if="counts.total"
      class="px-4 pt-3"
      role="progressbar"
      :aria-valuenow="progress"
      aria-valuemin="0"
      aria-valuemax="100"
      :aria-label="`${progress}% of tasks done`"
    >
      <div class="h-1.5 overflow-hidden rounded-full bg-stone-200 dark:bg-stone-800">
        <div
          class="h-full rounded-full bg-teal-600 transition-[width] duration-300 dark:bg-teal-400"
          :style="{ width: `${progress}%` }"
        />
      </div>
    </div>

    <div class="min-h-0 flex-1 overflow-y-auto p-2" aria-live="polite">
      <!-- Loading -->
      <ul
        v-if="status === 'loading' && !todos.length"
        class="space-y-2 p-2"
        aria-label="Loading tasks"
      >
        <li
          v-for="i in 3"
          :key="i"
          class="h-10 animate-pulse rounded-lg bg-stone-200/80 dark:bg-stone-800"
        />
      </ul>

      <!-- Error -->
      <div
        v-else-if="status === 'error'"
        class="m-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900 dark:border-red-900 dark:bg-red-950/50 dark:text-red-100"
        role="alert"
      >
        <p class="font-medium">Couldn’t load your tasks</p>
        <p class="mt-1 text-red-800 dark:text-red-200">{{ error }}</p>
        <button
          type="button"
          class="btn-ghost mt-3 -ml-2 text-red-900 dark:text-red-100"
          @click="refresh"
        >
          <Icon name="lucide:rotate-ccw" class="h-4 w-4" aria-hidden="true" /> Try again
        </button>
      </div>

      <!-- Empty -->
      <div v-else-if="!todos.length" class="flex flex-col items-center px-6 py-10 text-center">
        <span
          class="flex h-12 w-12 items-center justify-center rounded-full bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300"
        >
          <Icon name="lucide:list-checks" class="h-6 w-6" aria-hidden="true" />
        </span>
        <p class="mt-3 font-medium">Your list is empty</p>
        <p class="mt-1 text-sm text-stone-600 dark:text-stone-400">
          Add a task below, or just tell the assistant what you need to do.
        </p>
      </div>

      <!-- List -->
      <ul v-else class="space-y-0.5">
        <li
          v-for="(todo, index) in todos"
          :key="todo.id"
          class="group flex items-center gap-1 rounded-lg pr-1 transition-colors hover:bg-stone-100 dark:hover:bg-stone-800/60"
          :class="{ 'opacity-60': pending.includes(todo.id) }"
        >
          <label class="flex min-h-11 min-w-0 flex-1 cursor-pointer items-center gap-3 px-2 py-2">
            <input
              type="checkbox"
              class="h-5 w-5 shrink-0 cursor-pointer rounded border-stone-400 accent-teal-700 dark:accent-teal-500"
              :checked="todo.completed"
              :disabled="pending.includes(todo.id)"
              @change="run(toggle, todo, 'Could not update the task.')"
            />
            <span
              class="w-5 shrink-0 text-right text-xs tabular-nums text-stone-500 dark:text-stone-400"
              aria-hidden="true"
              >{{ index + 1 }}.</span
            >
            <span
              class="min-w-0 break-words text-[15px]"
              :class="todo.completed ? 'text-stone-500 line-through dark:text-stone-400' : ''"
            >
              {{ todo.content }}
            </span>
          </label>
          <button
            type="button"
            class="btn-icon h-9 w-9 text-stone-500 opacity-100 hover:text-red-700 sm:opacity-0 sm:focus-visible:opacity-100 sm:group-hover:opacity-100 dark:hover:text-red-400"
            :aria-label="`Delete task: ${todo.content}`"
            :disabled="pending.includes(todo.id)"
            @click="run(remove, todo, 'Could not delete the task.')"
          >
            <Icon name="lucide:trash-2" class="h-4 w-4" aria-hidden="true" />
          </button>
        </li>
      </ul>
      <p v-if="actionError" class="mx-2 mt-2 text-sm text-red-700 dark:text-red-400" role="alert">
        {{ actionError }}
      </p>
    </div>

    <form
      class="border-t border-stone-200 p-3 dark:border-stone-800"
      novalidate
      @submit.prevent="onAdd"
    >
      <label for="new-task" class="mb-1.5 block text-sm font-medium">Quick add</label>
      <div class="flex gap-2">
        <input
          id="new-task"
          v-model="newTask"
          type="text"
          class="input"
          placeholder="e.g. Water the plants"
          :maxlength="MAX_TASK_LENGTH + 50"
          :aria-invalid="!!formError || undefined"
          :aria-describedby="formError ? 'new-task-error' : undefined"
          @input="formError = null"
        />
        <button type="submit" class="btn-primary shrink-0" :disabled="adding">
          <Icon
            v-if="adding"
            name="lucide:loader-circle"
            class="h-4 w-4 animate-spin"
            aria-hidden="true"
          />
          <Icon v-else name="lucide:plus" class="h-4 w-4" aria-hidden="true" />
          Add
        </button>
      </div>
      <p
        v-if="formError"
        id="new-task-error"
        class="mt-1.5 text-sm text-red-700 dark:text-red-400"
        role="alert"
      >
        {{ formError }}
      </p>
    </form>
  </section>
</template>

<template>
  <li class="flex animate-fade-up gap-3">
    <span
      class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300"
      aria-hidden="true"
    >
      <Icon name="lucide:bot" class="h-4 w-4" />
    </span>
    <div
      class="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-stone-200 bg-white px-4 py-3.5 dark:border-stone-800 dark:bg-stone-900"
    >
      <span class="sr-only">Assistant is typing…</span>
      <span
        v-for="i in 3"
        :key="i"
        class="h-2 w-2 animate-bounce rounded-full bg-stone-400 dark:bg-stone-500"
        :style="{ animationDelay: `${(i - 1) * 150}ms` }"
        aria-hidden="true"
      />
    </div>
  </li>
</template>

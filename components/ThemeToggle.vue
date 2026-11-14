<script setup lang="ts">
const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')
const toggle = () => {
  colorMode.preference = isDark.value ? 'light' : 'dark'
}
</script>

<template>
  <ClientOnly>
    <button
      type="button"
      class="btn-icon"
      :aria-label="isDark ? 'Switch to light theme' : 'Switch to dark theme'"
      :title="isDark ? 'Light theme' : 'Dark theme'"
      @click="toggle"
    >
      <Icon :name="isDark ? 'lucide:sun' : 'lucide:moon'" class="h-5 w-5" aria-hidden="true" />
    </button>
    <template #fallback>
      <span class="h-10 w-10" aria-hidden="true" />
    </template>
  </ClientOnly>
</template>

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: false },

  modules: ['@nuxtjs/tailwindcss', '@nuxtjs/color-mode', '@nuxt/icon', '@nuxt/eslint'],

  css: ['@fontsource-variable/geist', '~/assets/css/main.css'],

  // Secrets live in the private (server-only) runtime config. They are
  // populated at runtime from NUXT_* environment variables, e.g.
  // NUXT_GEMINI_API_KEY overrides `geminiApiKey`. Nothing here is ever
  // shipped to the browser.
  runtimeConfig: {
    geminiApiKey: '',
    geminiModel: 'gemini-2.5-flash',
    supabaseUrl: '',
    supabaseKey: '',
    supabaseTable: 'todos',
    public: {
      siteUrl: '',
    },
  },

  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1, viewport-fit=cover',
      titleTemplate: '%s · Convo-Todo',
      meta: [
        {
          name: 'description',
          content: 'Convo-Todo: manage your to-do list by simply chatting with an AI assistant.',
        },
        { name: 'author', content: 'Sumir Seth' },
        { name: 'theme-color', content: '#0f766e' },
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'Convo-Todo' },
        { property: 'og:title', content: 'Convo-Todo — a to-do list you can talk to' },
        {
          property: 'og:description',
          content: 'Add, complete and review tasks in plain language with an AI assistant.',
        },
        { property: 'og:image', content: '/og-image.png' },
        { name: 'twitter:card', content: 'summary_large_image' },
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/favicon.png' },
        { rel: 'apple-touch-icon', href: '/favicon.png' },
      ],
    },
  },

  colorMode: {
    classSuffix: '',
    preference: 'system',
    fallback: 'dark',
  },

  icon: {
    serverBundle: { collections: ['lucide'] },
  },

  tailwindcss: {
    cssPath: false,
  },

  typescript: {
    strict: true,
  },
})

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: ['@nuxt/content', '@nuxt/fonts', '@nuxt/ui'],

  fonts: {
    providers: {
      google: false
    }
  },

  content: {
    build: {
      csv: {
        // Convert CSV data to JSON objects
        json: true,
        // Specify custom delimiter (default is ',')
        delimiter: ','
      }
    }
  }
})

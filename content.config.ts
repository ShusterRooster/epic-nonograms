import {defineCollection, defineContentConfig, z} from '@nuxt/content'

export default defineContentConfig({
    collections: {
        theme: defineCollection({
            type: 'data',
            source: 'settings/**.csv',
            schema: z.object({
                var: z.string(),
                value: z.string(),
                name: z.string(),
                desc: z.string(),
            })
        }),

        yaml: defineCollection({
            type: 'page',
            source: '**.yml',
            schema: z.object({
                catalogue: z.string(),
                title: z.string(),
                by: z.string(),
                copyright: z.string(),
                license: z.string(),
                width: z.number(),
                height: z.number(),
                rows: z.string(),
                columns: z.string(),
                goal: z.string(),
            })
        })
    }
})
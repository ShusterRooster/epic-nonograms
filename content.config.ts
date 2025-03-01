import {defineCollection, defineContentConfig, z} from '@nuxt/content'

export default defineContentConfig({
    collections: {
        puzzles: defineCollection({
            source: '**',
            type: 'data',
            schema: z.object({
                rawbody: z.string()
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
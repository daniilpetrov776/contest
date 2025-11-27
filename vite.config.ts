import type { Plugin } from 'vite'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import handlebars from 'vite-plugin-handlebars'
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer'
import { handlebarsContext } from './data/handlebars-context'

export default defineConfig({
    plugins: [
        ViteImageOptimizer({
            test: /\.(jpe?g|png|gif|tiff|webp|avif)$/i,
        }),
        handlebars({
            reloadOnPartialChange: true,
            partialDirectory: resolve(__dirname, 'partials'),
            context: handlebarsContext,
        }) as unknown as Plugin,
    ],
    build: {
        minify: false,
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
            },
        },
    },
    server: {
        port: 3000,
        host: '0.0.0.0',
        open: true,
    },
    css: {
        devSourcemap: true,
        preprocessorOptions: {
            scss: {
                silenceDeprecations: ['import'],
            },
        },
    },
})

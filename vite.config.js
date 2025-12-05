import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import handlebars from 'vite-plugin-handlebars'
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import { imageHelpers } from './js/handlebars-helpers.js'
import { headerContext } from './partials/header/header.data'
import { heroContext } from './partials/hero/hero.data'
import { portfolioContext } from './partials/portfolio/portfolio.data'
import { bannerContext } from './partials/banner/banner.data'
import { footerContext } from './partials/footer/footer.data'
import { clientsContext } from './partials/clients/clients.data'

const templateContext = {
    header: headerContext,
    hero: heroContext,
    portfolio: portfolioContext,
    banner: bannerContext,
    footer: footerContext,
    clients: clientsContext,
}

export default defineConfig({
    plugins: [
        ViteImageOptimizer({
            test: /\.(jpe?g|png|gif|tiff|webp|avif)$/i,
        }),
        createSvgIconsPlugin({
            iconDirs: [resolve(__dirname, 'public/icons')],
            symbolId: 'icon-[dir]-[name]',
            inject: 'body-last',
            customDomId: '__svg__icons__dom__',
        }),
        handlebars({
            reloadOnPartialChange: true,
            partialDirectory: resolve(__dirname, 'partials'),
            context: templateContext,
            helpers: imageHelpers,
        })
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

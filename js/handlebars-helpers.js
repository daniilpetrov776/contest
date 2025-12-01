import hbs from 'handlebars'

function getOptions(arg1, arg2) {
    if (arg1 && arg1.hash) {
        return arg1
    }
    if (arg2 && arg2.hash) {
        return arg2
    }
    return { hash: {} }
}

export const imageHelpers = {
    picture(...args) {
        const options = getOptions(args[0], args[1])
        const {
            src,
            srcset,
            webp,
            alt = '',
            class: className = '',
            loading = 'lazy',
            width,
            height,
            sizes,
        } = options.hash || {}

        let sources = ''
        if (webp) {
            sources += `<source srcset="${webp}" type="image/webp">`
        }
        if (srcset) {
            const media = options.hash?.media || ''
            sources += `<source srcset="${srcset}"${media ? ` media="${media}"` : ''}${sizes ? ` sizes="${sizes}"` : ''}>`
        }

        const imgAttrs = [
            src ? `src="${src}"` : '',
            alt ? `alt="${alt}"` : '',
            className ? `class="${className}"` : '',
            loading ? `loading="${loading}"` : '',
            width ? `width="${width}"` : '',
            height ? `height="${height}"` : '',
        ]
            .filter(Boolean)
            .join(' ')

        return new hbs.SafeString(`
            <picture>
                ${sources}
                <img ${imgAttrs}>
            </picture>
        `)
    },

    pictureRetina(...args) {
        const options = getOptions(args[0], args[1])
        const hash = options.hash || {}

        // Поддержка передачи объекта image целиком или отдельных свойств
        const imageData = hash.image || hash
        const {
            webp = imageData?.webp,
            'webp@2x': webp2x = imageData?.['webp@2x'],
            png = imageData?.png,
            'png@2x': png2x = imageData?.['png@2x'],
            jpeg = imageData?.jpeg,
            'jpeg@2x': jpeg2x = imageData?.['jpeg@2x'],
            jpg = imageData?.jpg,
            'jpg@2x': jpg2x = imageData?.['jpg@2x'],
            alt = hash.alt || '',
            class: className = hash.class || '',
            loading = hash.loading || 'lazy',
            width = hash.width,
            height = hash.height,
            sizes = hash.sizes,
        } = hash

        // Определяем fallback формат (png или jpeg/jpg)
        const fallback = png || jpeg || jpg
        const fallback2x = png2x || jpeg2x || jpg2x

        if (!fallback) {
            return new hbs.SafeString('<!-- pictureRetina helper: png, jpeg or jpg is required -->')
        }

        // Формируем srcset для webp
        let webpSrcset = ''
        if (webp) {
            webpSrcset = webp
            if (webp2x) {
                webpSrcset += `, ${webp2x} 2x`
            }
        }

        // Формируем srcset для fallback
        let fallbackSrcset = fallback
        if (fallback2x) {
            fallbackSrcset += `, ${fallback2x} 2x`
        }

        // Создаем source для webp
        let sources = ''
        if (webpSrcset) {
            sources += `<source srcset="${webpSrcset}" type="image/webp"${sizes ? ` sizes="${sizes}"` : ''}>`
        }

        // Атрибуты для img
        const imgAttrs = [
            `src="${fallback}"`,
            fallbackSrcset !== fallback ? `srcset="${fallbackSrcset}"` : '',
            alt ? `alt="${alt}"` : '',
            className ? `class="${className}"` : '',
            loading ? `loading="${loading}"` : '',
            width ? `width="${width}"` : '',
            height ? `height="${height}"` : '',
        ]
            .filter(Boolean)
            .join(' ')

        return new hbs.SafeString(`
            <picture>
                ${sources}
                <img ${imgAttrs}>
            </picture>
        `)
    },

    svg(...args) {
        const options = getOptions(args[0], args[1])
        const hash = options.hash || {}

        const src = hash.src
        const alt = hash.alt || ''
        const className = hash.class || ''
        const width = hash.width
        const height = hash.height

        if (!src) {
            return new hbs.SafeString('<!-- SVG helper: src is required -->')
        }

        const attrs = [
            `src="${src}"`,
            alt ? `alt="${alt}"` : '',
            className ? `class="${className}"` : '',
            width ? `width="${width}"` : '',
            height ? `height="${height}"` : '',
        ]
            .filter(Boolean)
            .join(' ')

        return new hbs.SafeString(`<img ${attrs}>`)
    },

    sprite(...args) {
        const options = getOptions(args[0], args[1])
        const hash = options.hash || {}

        const name = hash.name
        const className = hash.class || ''
        const width = hash.width
        const height = hash.height
        const dir = hash.dir || ''

        if (!name) {
            return new hbs.SafeString('<!-- Sprite helper: name is required -->')
        }

        const symbolId = dir ? `icon-${dir}-${name}` : `icon-${name}`

        const svgAttrs = [
            className ? `class="${className}"` : '',
            width ? `width="${width}"` : '',
            height ? `height="${height}"` : '',
        ]
            .filter(Boolean)
            .join(' ')

        return new hbs.SafeString(`
            <svg ${svgAttrs}>
                <use href="#${symbolId}"></use>
            </svg>
        `)
    },
}

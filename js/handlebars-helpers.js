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

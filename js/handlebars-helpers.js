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
            alt = hash.alt || imageData?.alt || '',
            class: className = hash.class || imageData?.class || '',
            loading = hash.loading || imageData?.loading || 'lazy',
            width = hash.width || imageData?.width,
            height = hash.height || imageData?.height,
            sizes = hash.sizes || imageData?.sizes,
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

    titleWithSprites(parts) {
        // Handlebars передает значение напрямую при вызове {{titleWithSprites title.parts}}
        // Если parts не массив, пытаемся извлечь его из объекта
        if (parts && !Array.isArray(parts)) {
            // Если это объект с hash (как в других хелперах), извлекаем parts из hash
            if (parts.hash && parts.hash.parts) {
                parts = parts.hash.parts
            }
            // Если это объект с свойством parts
            else if (parts.parts) {
                parts = parts.parts
            }
        }

        if (!Array.isArray(parts)) {
            return new hbs.SafeString('')
        }

        // Группируем части по строкам (разделенные br)
        const lines = []
        let currentLine = []

        parts.forEach((part) => {
            if (part.br) {
                if (currentLine.length > 0) {
                    lines.push(currentLine)
                    currentLine = []
                }
            } else {
                currentLine.push(part)
            }
        })

        // Добавляем последнюю строку, если она не пустая
        if (currentLine.length > 0) {
            lines.push(currentLine)
        }

        // Рендерим каждую строку в div
        let html = ''

        lines.forEach((line, lineIndex) => {
            let lineHtml = ''

            line.forEach((part, partIndex) => {
                // Добавляем пробел перед элементом, если это не первый элемент в строке
                if (partIndex > 0) {
                    lineHtml += ' '
                }

                if (part.sprite) {
                    const spriteWidth = part.sprite.width || 16
                    const spriteHeight = part.sprite.height || 16
                    const spriteClass = part.sprite.class || ''
                    const spritePosition = part.sprite.position || 'after' // 'before' или 'after'

                    let iconHtml = ''

                    // Единый синтаксис: всегда используем name, автоматически определяем тип файла
                    if (part.sprite.name) {
                        const spriteName = part.sprite.name
                        const spriteDir = part.sprite.dir || ''
                        const spriteAlt = part.sprite.alt || ''
                        const spriteSrc2x = part.sprite.src2x || ''

                        // Определяем тип файла по расширению в имени
                        const imageExtensions = ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg']
                        const hasImageExtension = imageExtensions.some((ext) => spriteName.toLowerCase().endsWith(ext))

                        if (hasImageExtension) {
                            // Обычное изображение (png, jpg, webp и т.д.)
                            const imageSrc = `/icons/${spriteName}`
                            const imageSrc2x = spriteSrc2x ? `/icons/${spriteSrc2x}` : ''

                            const imgAttrs = [
                                `src="${imageSrc}"`,
                                spriteClass ? `class="${spriteClass}"` : '',
                                `width="${spriteWidth}"`,
                                `height="${spriteHeight}"`,
                                spriteAlt ? `alt="${spriteAlt}"` : '',
                                imageSrc2x ? `srcset="${imageSrc} 1x, ${imageSrc2x} 2x"` : '',
                            ]
                                .filter(Boolean)
                                .join(' ')

                            iconHtml = `<img ${imgAttrs}>`
                        } else {
                            // SVG спрайт (через <use>)
                            const symbolId = spriteDir ? `icon-${spriteDir}-${spriteName}` : `icon-${spriteName}`

                            const svgAttrs = [
                                spriteClass ? `class="${spriteClass}"` : '',
                                `width="${spriteWidth}"`,
                                `height="${spriteHeight}"`,
                            ]
                                .filter(Boolean)
                                .join(' ')

                            iconHtml = `<svg ${svgAttrs}><use href="#${symbolId}"></use></svg>`
                        }
                    } else if (part.sprite.cssSprite) {
                        // CSS спрайт (background-image с background-position)
                        const spriteSheet = part.sprite.cssSprite.sheet || part.sprite.cssSprite.url
                        const bgX = part.sprite.cssSprite.x || 0
                        const bgY = part.sprite.cssSprite.y || 0
                        const bgSize = part.sprite.cssSprite.size || 'auto'

                        const style = [
                            `background-image: url(${spriteSheet})`,
                            `background-position: ${bgX}px ${bgY}px`,
                            bgSize !== 'auto' ? `background-size: ${bgSize}` : '',
                        ]
                            .filter(Boolean)
                            .join('; ')

                        const spanAttrs = [
                            spriteClass ? `class="${spriteClass}"` : '',
                            `style="${style}"`,
                            `width="${spriteWidth}"`,
                            `height="${spriteHeight}"`,
                        ]
                            .filter(Boolean)
                            .join(' ')

                        iconHtml = `<span ${spanAttrs}></span>`
                    } else if (part.sprite.src || part.sprite.url || part.sprite.image) {
                        // Обратная совместимость: поддержка старого синтаксиса
                        const imageSrc = part.sprite.src || part.sprite.url || part.sprite.image
                        const imageSrc2x = part.sprite.src2x || part.sprite.url2x || part.sprite.image2x
                        const imageAlt = part.sprite.alt || ''

                        const imgAttrs = [
                            `src="${imageSrc}"`,
                            spriteClass ? `class="${spriteClass}"` : '',
                            `width="${spriteWidth}"`,
                            `height="${spriteHeight}"`,
                            imageAlt ? `alt="${imageAlt}"` : '',
                            imageSrc2x ? `srcset="${imageSrc} 1x, ${imageSrc2x} 2x"` : '',
                        ]
                            .filter(Boolean)
                            .join(' ')

                        iconHtml = `<img ${imgAttrs}>`
                    } else {
                        // Если нет ни name, ни src/url/image, ни cssSprite, пропускаем
                        iconHtml = ''
                    }

                    // Обрабатываем текст: может быть строкой или объектом с value и class
                    let text = ''
                    let textClass = ''

                    if (part.text) {
                        if (typeof part.text === 'string') {
                            text = part.text
                            // Проверяем, есть ли отдельное свойство textClass
                            textClass = part.textClass || ''
                        } else if (typeof part.text === 'object') {
                            // Если text - объект с value и class
                            text = part.text.value || part.text.text || ''
                            textClass = part.text.class || ''
                        }
                    }

                    // Определяем порядок: если sprite идет первым в объекте (до text), то он должен быть до текста
                    const objectKeys = Object.keys(part)
                    const spriteBeforeText = objectKeys.indexOf('sprite') < objectKeys.indexOf('text')

                    if (iconHtml) {
                        const textHtml = textClass ? `<span class="${textClass}">${text}</span>` : text
                        // Убираем внешний span, оставляем элементы на одном уровне
                        if (spriteBeforeText || spritePosition === 'before') {
                            lineHtml += `${iconHtml} ${textHtml}`
                        } else {
                            lineHtml += `${textHtml} ${iconHtml}`
                        }
                    } else if (text) {
                        lineHtml += textClass ? `<span class="${textClass}">${text}</span>` : text
                    }
                } else if (part.text) {
                    // Текст без спрайта
                    let text = ''
                    let textClass = ''

                    if (typeof part.text === 'string') {
                        text = part.text
                        textClass = part.textClass || ''
                    } else if (typeof part.text === 'object') {
                        text = part.text.value || part.text.text || ''
                        textClass = part.text.class || ''
                    }

                    lineHtml += textClass ? `<span class="${textClass}">${text}</span>` : text
                }
            })

            // Оборачиваем каждую строку в div с классом
            if (lineHtml) {
                html += `<div class="banner__title-line">${lineHtml}</div>`
            }
        })

        return new hbs.SafeString(html)
    },

    extractText(parts) {
        // Извлекает только текст из parts для доступности (без спрайтов)
        if (!Array.isArray(parts)) {
            return ''
        }

        let text = ''

        parts.forEach((part) => {
            if (part.text) {
                if (typeof part.text === 'string') {
                    text += part.text + ' '
                } else if (typeof part.text === 'object') {
                    const textValue = part.text.value || part.text.text || ''
                    text += textValue + ' '
                }
            }
        })

        return text.trim()
    },

    getBemModifier(className, baseClass) {
        // Извлекает модификатор из BEM класса
        // Например: getBemModifier('banner__image banner__image--building', 'banner__image') -> '--building'
        if (!className || typeof className !== 'string') {
            return ''
        }

        const classes = className.split(' ')
        const modifierClass = classes.find((cls) => cls.startsWith(`${baseClass}--`))

        if (modifierClass) {
            return modifierClass.replace(baseClass, '')
        }

        return ''
    },

    getWrapperClass(className, wrapperBase) {
        // Создает класс wrapper с модификатором из класса элемента
        // Например: getWrapperClass('banner__image banner__image--building', 'banner__image-wrapper') -> 'banner__image-wrapper banner__image-wrapper--building'
        if (!className || typeof className !== 'string') {
            return wrapperBase || ''
        }

        const classes = className.split(' ')
        // Ищем класс с модификатором (формат: base--modifier)
        const modifierClass = classes.find((cls) => {
            const parts = cls.split('--')
            return parts.length === 2 && parts[0] && parts[1]
        })

        if (modifierClass) {
            const modifier = modifierClass.split('--')[1]
            return `${wrapperBase} ${wrapperBase}--${modifier}`
        }

        return wrapperBase || ''
    },
}

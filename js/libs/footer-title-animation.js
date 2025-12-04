import { gsap } from 'gsap'

/**
 * Парсит значение data-scroll-animation атрибута
 * @param {string} animationValue - Значение атрибута data-scroll-animation
 * @returns {object | null} - Объект с параметрами анимации или null
 */
function parseAnimationParams(animationValue) {
    if (!animationValue) {
        return null
    }

    const parts = animationValue.split(',').map(part => part.trim())

    if (parts.length < 4) {
        console.warn('Неверный формат data-scroll-animation. Ожидается: direction, offset, duration, staggerDelay')
        return null
    }

    const [direction, offset, duration, staggerDelay] = parts

    return {
        direction,
        offset,
        duration: Number.parseFloat(duration) || 1,
        staggerDelay: Number.parseFloat(staggerDelay) || 0.1,
    }
}

/**
 * Разбивает текст на слова и оборачивает каждое слово в span
 * @param {HTMLElement} element - Элемент с текстом
 * @returns {HTMLElement[]} - Массив span элементов со словами
 */
function wrapWordsInSpans(element) {
    // Сохраняем исходный HTML для сохранения <br> тегов
    const originalHTML = element.innerHTML

    // Очищаем содержимое элемента
    element.innerHTML = ''

    const wordSpans = []

    // Разбиваем оригинальный HTML на части, сохраняя <br> теги
    const parts = originalHTML.split(/(<br\s*\/?>)/i)

    parts.forEach((part, partIndex) => {
        if (part.match(/<br\s*\/?>/i)) {
            // Это <br> тег - добавляем как есть
            element.appendChild(document.createRange().createContextualFragment(part))
        } else {
            // Это текст - разбиваем на слова
            const partWords = part.trim().split(/\s+/).filter(word => word.length > 0)

            partWords.forEach((word, index) => {
                const span = document.createElement('span')
                span.textContent = word
                span.style.display = 'inline-block'
                span.style.whiteSpace = 'nowrap'
                wordSpans.push(span)

                element.appendChild(span)

                // Добавляем пробел после слова, кроме последнего в части
                if (index < partWords.length - 1) {
                    element.appendChild(document.createTextNode(' '))
                }
            })

            // Добавляем пробел после текстовой части, если следующая часть не <br>
            if (parts[partIndex + 1] && !parts[partIndex + 1].match(/<br\s*\/?>/i)) {
                element.appendChild(document.createTextNode(' '))
            }
        }
    })

    return wordSpans
}

/**
 * Анимирует слова последовательно
 * @param {HTMLElement[]} wordSpans - Массив span элементов со словами
 * @param {object} params - Параметры анимации
 * @param {boolean} reverse - Анимировать в обратном порядке
 */
function animateWords(wordSpans, params, reverse = false) {
    const words = reverse ? [...wordSpans].reverse() : wordSpans

    words.forEach((wordSpan, index) => {
        const delay = index * params.staggerDelay

        // Устанавливаем начальное состояние
        const offsetValue = Number.parseFloat(params.offset) || 20
        const offsetUnit = params.offset.replace(/\d/g, '') || 'px'
        let initialX = 0
        let initialY = 0

        switch (params.direction) {
            case 'from-down':
                initialY = offsetValue
                break
            case 'from-up':
                initialY = -offsetValue
                break
            case 'from-left':
                initialX = -offsetValue
                break
            case 'from-right':
                initialX = offsetValue
                break
            default:
                initialY = offsetValue
        }

        gsap.set(wordSpan, {
            x: `${initialX}${offsetUnit}`,
            y: `${initialY}${offsetUnit}`,
        })

        // Запускаем анимацию
        gsap.to(wordSpan, {
            x: 0,
            y: 0,
            duration: params.duration,
            delay,
            ease: 'power2.out',
        })
    })
}

/**
 * Анимирует слова в обратном порядке (исчезновение)
 * @param {HTMLElement[]} wordSpans - Массив span элементов со словами
 * @param {object} params - Параметры анимации
 */
function animateWordsReverse(wordSpans, params) {
    const words = [...wordSpans].reverse()

    words.forEach((wordSpan, index) => {
        const delay = index * params.staggerDelay

        const offsetValue = Number.parseFloat(params.offset) || 20
        const offsetUnit = params.offset.replace(/\d/g, '') || 'px'
        let finalX = 0
        let finalY = 0

        switch (params.direction) {
            case 'from-down':
                finalY = offsetValue
                break
            case 'from-up':
                finalY = -offsetValue
                break
            case 'from-left':
                finalX = -offsetValue
                break
            case 'from-right':
                finalX = offsetValue
                break
            default:
                finalY = offsetValue
        }

        // Анимируем обратно в начальное состояние
        gsap.to(wordSpan, {
            x: `${finalX}${offsetUnit}`,
            y: `${finalY}${offsetUnit}`,
            duration: params.duration,
            delay,
            ease: 'power2.in',
        })
    })
}

/**
 * Инициализирует анимацию footer__title по скроллу
 */
function initFooterTitleAnimation() {
    const footerTitle = document.querySelector('.footer__title')

    if (!footerTitle) {
        return
    }

    const animationValue = footerTitle.dataset.scrollAnimation

    if (!animationValue) {
        return
    }

    const params = parseAnimationParams(animationValue)

    if (!params) {
        return
    }

    // Устанавливаем overflow: hidden на родительский элемент для скрытия слов за границей
    footerTitle.style.overflow = 'hidden'

    // Разбиваем текст на слова и оборачиваем в spans
    const wordSpans = wrapWordsInSpans(footerTitle)

    if (wordSpans.length === 0) {
        return
    }

    // Устанавливаем начальные состояния для всех слов
    const offsetValue = Number.parseFloat(params.offset) || 20
    const offsetUnit = params.offset.replace(/\d/g, '') || 'px'
    let initialX = 0
    let initialY = 0

    switch (params.direction) {
        case 'from-down':
            initialY = offsetValue
            break
        case 'from-up':
            initialY = -offsetValue
            break
        case 'from-left':
            initialX = -offsetValue
            break
        case 'from-right':
            initialX = offsetValue
            break
        default:
            initialY = offsetValue
    }

    wordSpans.forEach((wordSpan) => {
        gsap.set(wordSpan, {
            x: `${initialX}${offsetUnit}`,
            y: `${initialY}${offsetUnit}`,
        })
    })

    // Отслеживаем состояние анимации и направление скролла
    let lastScrollY = window.scrollY
    let isAnimating = false
    let wasVisible = false
    let animationTimeout = null

    /**
     * Останавливает текущую анимацию и сбрасывает флаги
     */
    function stopCurrentAnimation() {
        if (animationTimeout) {
            clearTimeout(animationTimeout)
            animationTimeout = null
        }

        // Останавливаем все текущие анимации
        wordSpans.forEach((wordSpan) => {
            gsap.killTweensOf(wordSpan)
        })

        isAnimating = false
    }

    /**
     * Запускает анимацию появления слов
     * @param {boolean} reverse - Анимировать в обратном порядке
     */
    function startShowAnimation(reverse = false) {
        stopCurrentAnimation()
        isAnimating = true

        // Устанавливаем начальные состояния для всех слов
        const offsetValue = Number.parseFloat(params.offset) || 20
        const offsetUnit = params.offset.replace(/\d/g, '') || 'px'
        let initialX = 0
        let initialY = 0

        switch (params.direction) {
            case 'from-down':
                initialY = offsetValue
                break
            case 'from-up':
                initialY = -offsetValue
                break
            case 'from-left':
                initialX = -offsetValue
                break
            case 'from-right':
                initialX = offsetValue
                break
            default:
                initialY = offsetValue
        }

        wordSpans.forEach((wordSpan) => {
            gsap.set(wordSpan, {
                x: `${initialX}${offsetUnit}`,
                y: `${initialY}${offsetUnit}`,
            })
        })

        // Запускаем анимацию
        if (reverse) {
            animateWords(wordSpans, params, true)
        } else {
            animateWords(wordSpans, params, false)
        }

        wasVisible = true

        // Сбрасываем флаг после завершения анимации
        animationTimeout = setTimeout(() => {
            isAnimating = false
            animationTimeout = null
        }, (wordSpans.length * params.staggerDelay + params.duration) * 1000)
    }

    /**
     * Запускает анимацию исчезновения слов
     */
    function startHideAnimation() {
        stopCurrentAnimation()
        isAnimating = true

        animateWordsReverse(wordSpans, params)
        wasVisible = false

        // Сбрасываем флаг после завершения анимации
        animationTimeout = setTimeout(() => {
            isAnimating = false
            animationTimeout = null
        }, (wordSpans.length * params.staggerDelay + params.duration) * 1000)
    }

    // Intersection Observer для отслеживания появления элемента в viewport
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1,
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            const currentScrollY = window.scrollY
            const scrollingDown = currentScrollY > lastScrollY

            if (entry.isIntersecting) {
                // Элемент появился в viewport
                // Если элемент был виден и мы анимируем исчезновение, останавливаем и запускаем появление
                if (wasVisible && isAnimating) {
                    // Проверяем, идет ли анимация исчезновения (слова двигаются вниз)
                    // Если да, останавливаем и запускаем появление
                    startShowAnimation(!scrollingDown)
                } else if (!wasVisible || !isAnimating) {
                    // Элемент только появился или анимация завершена
                    startShowAnimation(!scrollingDown)
                }
            } else if (!entry.isIntersecting) {
                // Элемент вышел из viewport
                // Если элемент был виден и мы анимируем появление, останавливаем и запускаем исчезновение
                if (wasVisible && isAnimating) {
                    // Проверяем, идет ли анимация появления (слова двигаются вверх)
                    // Если да, останавливаем и запускаем исчезновение
                    startHideAnimation()
                } else if (wasVisible && !isAnimating) {
                    // Элемент был виден, но анимация завершена - запускаем исчезновение
                    startHideAnimation()
                }
            }

            lastScrollY = currentScrollY
        })
    }, observerOptions)

    // Отслеживаем скролл для определения направления и переключения анимаций
    let scrollTimeout
    let lastKnownScrollY = window.scrollY

    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY
        const scrollingDown = currentScrollY > lastKnownScrollY

        // Если анимация идет и направление скролла изменилось, проверяем состояние
        if (isAnimating) {
            const rect = footerTitle.getBoundingClientRect()
            const isVisible = rect.top < window.innerHeight && rect.bottom > 0

            // Если элемент виден, но мы анимируем исчезновение, переключаем на появление
            if (isVisible && !wasVisible) {
                startShowAnimation(!scrollingDown)
            }
            // Если элемент не виден, но мы анимируем появление, переключаем на исчезновение
            else if (!isVisible && wasVisible) {
                startHideAnimation()
            }
        }

        lastKnownScrollY = currentScrollY

        clearTimeout(scrollTimeout)
        scrollTimeout = setTimeout(() => {
            lastScrollY = currentScrollY
        }, 50)
    }, { passive: true })

    // Начинаем наблюдение за элементом
    observer.observe(footerTitle)
}

/**
 * Инициализирует анимацию footer__policy по скроллу (вся строка целиком)
 */
function initFooterPolicyAnimation() {
    const footerPolicy = document.querySelector('.footer__policy')

    if (!footerPolicy) {
        return
    }

    const animationValue = footerPolicy.dataset.scrollAnimation

    if (!animationValue) {
        return
    }

    const params = parseAnimationParams(animationValue)

    if (!params) {
        return
    }

    // Устанавливаем overflow: hidden на родительский элемент для скрытия текста за границей
    footerPolicy.style.overflow = 'hidden'

    // Устанавливаем начальное состояние
    const offsetValue = Number.parseFloat(params.offset) || 20
    const offsetUnit = params.offset.replace(/\d/g, '') || 'px'
    let initialX = 0
    let initialY = 0

    switch (params.direction) {
        case 'from-down':
            initialY = offsetValue
            break
        case 'from-up':
            initialY = -offsetValue
            break
        case 'from-left':
            initialX = -offsetValue
            break
        case 'from-right':
            initialX = offsetValue
            break
        default:
            initialY = offsetValue
    }

    gsap.set(footerPolicy, {
        x: `${initialX}${offsetUnit}`,
        y: `${initialY}${offsetUnit}`,
    })

    // Отслеживаем состояние анимации
    let isAnimating = false
    let wasVisible = false
    let animationTimeout = null

    /**
     * Останавливает текущую анимацию и сбрасывает флаги
     */
    function stopCurrentAnimation() {
        if (animationTimeout) {
            clearTimeout(animationTimeout)
            animationTimeout = null
        }

        gsap.killTweensOf(footerPolicy)
        isAnimating = false
    }

    /**
     * Запускает анимацию появления
     */
    function startShowAnimation() {
        stopCurrentAnimation()
        isAnimating = true

        // Устанавливаем начальное состояние
        const offsetValue = Number.parseFloat(params.offset) || 20
        const offsetUnit = params.offset.replace(/\d/g, '') || 'px'
        let initialX = 0
        let initialY = 0

        switch (params.direction) {
            case 'from-down':
                initialY = offsetValue
                break
            case 'from-up':
                initialY = -offsetValue
                break
            case 'from-left':
                initialX = -offsetValue
                break
            case 'from-right':
                initialX = offsetValue
                break
            default:
                initialY = offsetValue
        }

        gsap.set(footerPolicy, {
            x: `${initialX}${offsetUnit}`,
            y: `${initialY}${offsetUnit}`,
        })

        // Запускаем анимацию
        gsap.to(footerPolicy, {
            x: 0,
            y: 0,
            duration: params.duration,
            ease: 'power2.out',
        })

        wasVisible = true

        // Сбрасываем флаг после завершения анимации
        animationTimeout = setTimeout(() => {
            isAnimating = false
            animationTimeout = null
        }, params.duration * 1000)
    }

    /**
     * Запускает анимацию исчезновения
     */
    function startHideAnimation() {
        stopCurrentAnimation()
        isAnimating = true

        const offsetValue = Number.parseFloat(params.offset) || 20
        const offsetUnit = params.offset.replace(/\d/g, '') || 'px'
        let finalX = 0
        let finalY = 0

        switch (params.direction) {
            case 'from-down':
                finalY = offsetValue
                break
            case 'from-up':
                finalY = -offsetValue
                break
            case 'from-left':
                finalX = -offsetValue
                break
            case 'from-right':
                finalX = offsetValue
                break
            default:
                finalY = offsetValue
        }

        gsap.to(footerPolicy, {
            x: `${finalX}${offsetUnit}`,
            y: `${finalY}${offsetUnit}`,
            duration: params.duration,
            ease: 'power2.in',
        })

        wasVisible = false

        // Сбрасываем флаг после завершения анимации
        animationTimeout = setTimeout(() => {
            isAnimating = false
            animationTimeout = null
        }, params.duration * 1000)
    }

    // Intersection Observer для отслеживания появления элемента в viewport
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1,
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                // Элемент появился в viewport
                if (wasVisible && isAnimating) {
                    startShowAnimation()
                } else if (!wasVisible || !isAnimating) {
                    startShowAnimation()
                }
            } else if (!entry.isIntersecting) {
                // Элемент вышел из viewport
                if (wasVisible && isAnimating) {
                    startHideAnimation()
                } else if (wasVisible && !isAnimating) {
                    startHideAnimation()
                }
            }
        })
    }, observerOptions)

    // Отслеживаем скролл для переключения анимаций
    let scrollTimeout

    window.addEventListener('scroll', () => {
        // Если анимация идет, проверяем состояние
        if (isAnimating) {
            const rect = footerPolicy.getBoundingClientRect()
            const isVisible = rect.top < window.innerHeight && rect.bottom > 0

            // Если элемент виден, но мы анимируем исчезновение, переключаем на появление
            if (isVisible && !wasVisible) {
                startShowAnimation()
            }
            // Если элемент не виден, но мы анимируем появление, переключаем на исчезновение
            else if (!isVisible && wasVisible) {
                startHideAnimation()
            }
        }

        clearTimeout(scrollTimeout)
        scrollTimeout = setTimeout(() => {
            // Таймер для debounce
        }, 50)
    }, { passive: true })

    // Начинаем наблюдение за элементом
    observer.observe(footerPolicy)
}

/**
 * Инициализация при загрузке DOM
 */
function initFooterAnimations() {
    initFooterTitleAnimation()
    initFooterPolicyAnimation()
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFooterAnimations)
} else {
    initFooterAnimations()
}

export { initFooterPolicyAnimation, initFooterTitleAnimation }

// Экспорт всех модулей анимаций
export { animateFade } from './fade.js'
export { animateScale } from './scale.js'
export { animateSlide } from './slide.js'
export { animateText } from './text.js'

// Импорт для использования в основном коде
import { gsap } from 'gsap'
import { animateFade } from './fade.js'
import { animateScale } from './scale.js'
import { animateSlide } from './slide.js'
import { animateText } from './text.js'

const animations = {
    animateFade,
    animateScale,
    animateSlide,
    animateText,
}

/**
 * Парсит значение data-sequence атрибута
 * @param {string} sequenceValue - Значение атрибута data-sequence
 * @returns {object | null} - Объект с параметрами анимации или null
 */
function parseSequence(sequenceValue) {
    if (!sequenceValue) {
        return null
    }

    const parts = sequenceValue.split(',').map(part => part.trim())

    if (parts.length < 5) {
        console.warn('Неверный формат data-sequence. Ожидается: animationType, direction, offset, duration, order [, shift]')
        return null
    }

    const [animationType, direction, offset, duration, order, shiftLine] = parts

    return {
        animationType,
        direction,
        offset,
        duration: Number.parseFloat(duration) || 1,
        order: Number.parseInt(order, 10) || 0,
        shiftLine: shiftLine === 'shift', // Опциональный параметр для сдвига строки
    }
}

/**
 * Устанавливает начальные состояния для элементов слайда без запуска анимации
 * @param {HTMLElement} slide - Элемент слайда
 */
function setInitialStates(slide) {
    const elements = slide.querySelectorAll('[data-sequence]')

    if (elements.length === 0) {
        return
    }

    elements.forEach((element) => {
        const sequenceValue = element.dataset.sequence
        const params = parseSequence(sequenceValue)

        if (!params) {
            return
        }

        const { animationType, direction, offset, shiftLine } = params

        // Устанавливаем начальные состояния в зависимости от типа анимации
        switch (animationType) {
            case 'text': {
                const offsetValue = Number.parseFloat(offset) || 20
                const offsetUnit = offset.replace(/\d/g, '') || 'px'
                let initialX = 0
                let initialY = 0

                switch (direction) {
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

                gsap.set(element, {
                    opacity: 0,
                    x: `${initialX}${offsetUnit}`,
                    y: `${initialY}${offsetUnit}`,
                })
                break
            }

            case 'fade': {
                gsap.set(element, {
                    opacity: 0,
                })
                break
            }

            case 'slide': {
                const offsetValue = Number.parseFloat(offset) || 20
                const offsetUnit = offset.replace(/\d/g, '') || 'px'
                let initialX = 0
                let initialY = 0

                switch (direction) {
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

                gsap.set(element, {
                    x: `${initialX}${offsetUnit}`,
                    y: `${initialY}${offsetUnit}`,
                })
                break
            }

            case 'scale': {
                let transformOrigin = 'bottom'
                const isHorizontal = direction === 'from-left' || direction === 'from-right'

                switch (direction) {
                    case 'from-down':
                        transformOrigin = 'bottom'
                        break
                    case 'from-up':
                        transformOrigin = 'top'
                        break
                    case 'from-left':
                        transformOrigin = 'left'
                        break
                    case 'from-right':
                        transformOrigin = 'right'
                        break
                    default:
                        transformOrigin = 'bottom'
                }

                gsap.set(element, {
                    scale: 0,
                    transformOrigin,
                })

                // Если включен shiftLine, устанавливаем начальное состояние для родительской строки
                if (isHorizontal && shiftLine) {
                    const parentLine = element.closest('.banner__title-line')
                    if (parentLine) {
                        // Временно устанавливаем scale: 1 для измерения ширины
                        const originalVisibility = element.style.visibility
                        gsap.set(element, {
                            scale: 1,
                            visibility: 'hidden',
                        })
                        const elementWidth = element.offsetWidth || element.getBoundingClientRect().width || 0
                        gsap.set(element, {
                            scale: 0,
                            visibility: originalVisibility || 'visible',
                        })

                        const initialTranslateX = direction === 'from-left' ? -elementWidth : elementWidth
                        gsap.set(parentLine, {
                            x: initialTranslateX,
                        })
                    }
                }
                break
            }
        }
    })
}

/**
 * Инициализирует анимации для banner слайда
 * @param {HTMLElement} slide - Элемент слайда
 */
function initSlideAnimations(slide) {
    // Находим все элементы с data-sequence атрибутом в слайде
    const elements = slide.querySelectorAll('[data-sequence]')

    if (elements.length === 0) {
        return
    }

    // Сбрасываем все анимации для элементов слайда
    elements.forEach((element) => {
        gsap.killTweensOf(element)
    })

    // Собираем все анимации с их порядком выполнения
    const animationQueue = []

    elements.forEach((element) => {
        const sequenceValue = element.dataset.sequence
        const params = parseSequence(sequenceValue)

        if (!params) {
            return
        }

        // Получаем функцию анимации
        const animationFunction = animations[`animate${params.animationType.charAt(0).toUpperCase() + params.animationType.slice(1)}`]

        if (!animationFunction) {
            console.warn(`Анимация "${params.animationType}" не найдена`)
            return
        }

        animationQueue.push({
            element,
            params,
            animationFunction,
        })
    })

    // Сортируем по порядку выполнения
    animationQueue.sort((a, b) => a.params.order - b.params.order)

    // Группируем анимации по порядку выполнения
    const animationGroups = new Map()

    animationQueue.forEach(({ element, params, animationFunction }) => {
        const order = params.order

        if (!animationGroups.has(order)) {
            animationGroups.set(order, [])
        }

        animationGroups.get(order).push({
            element,
            params,
            animationFunction,
        })
    })

    // Запускаем группы анимаций последовательно
    // Элементы внутри одной группы запускаются одновременно
    const sortedOrders = Array.from(animationGroups.keys()).sort((a, b) => a - b)

    sortedOrders.forEach((order, index) => {
        const group = animationGroups.get(order)
        // Задержка между группами: 0.1 секунды на единицу разницы order
        // Например, между order=1 и order=2 будет задержка 0.1 секунды
        const delay = index > 0 ? (order - sortedOrders[index - 1]) * 0.1 : 0

        // Запускаем все анимации в группе одновременно
        group.forEach(({ element, params, animationFunction }) => {
            // Передаем дополнительный параметр shiftLine для scale анимации
            let animation
            if (params.animationType === 'scale' && params.shiftLine) {
                animation = animationFunction(
                    element,
                    params.direction,
                    params.offset,
                    params.duration,
                    params.shiftLine
                )
            } else {
                animation = animationFunction(
                    element,
                    params.direction,
                    params.offset,
                    params.duration
                )
            }

            // Применяем задержку, если она есть
            if (delay > 0 && animation) {
                animation.delay(delay)
            }
        })
    })
}

/**
 * Инициализирует анимации для banner
 */
function initBannerAnimation() {
    const bannerSwiper = document.querySelector('.banner__swiper')
    const bannerSection = document.querySelector('.banner')

    if (!bannerSwiper || !bannerSection) {
        return
    }

    // Получаем все слайды
    const slides = bannerSwiper.querySelectorAll('.banner__slide')

    if (slides.length === 0) {
        return
    }

    // Устанавливаем начальные состояния для всех элементов сразу при загрузке
    // Это предотвращает "прыжки" элементов при скролле
    slides.forEach((slide) => {
        setInitialStates(slide)
    })

    // Флаг для отслеживания, были ли уже запущены анимации при первом появлении
    let hasAnimatedOnScroll = false

    // Функция для инициализации анимаций активного слайда
    const initActiveSlideAnimation = () => {
        const activeSlide = bannerSwiper.querySelector('.swiper-slide-active') || slides[0]
        if (activeSlide) {
            initSlideAnimations(activeSlide)
        }
    }

    // Функция для запуска анимаций при первом появлении в viewport
    const triggerAnimationsOnScroll = () => {
        if (hasAnimatedOnScroll) {
            return
        }

        hasAnimatedOnScroll = true
        initActiveSlideAnimation()
    }

    // Проверяем, виден ли баннер уже при загрузке (если страница загрузилась с прокруткой)
    const checkInitialVisibility = () => {
        const rect = bannerSection.getBoundingClientRect()
        const isVisible = rect.top < window.innerHeight && rect.bottom > 0

        if (isVisible) {
            // Небольшая задержка для инициализации Swiper
            setTimeout(() => {
                triggerAnimationsOnScroll()
            }, 200)
        }
    }

    // Intersection Observer для отслеживания появления баннера в viewport
    const observerOptions = {
        root: null, // viewport
        rootMargin: '0px',
        threshold: 0.1, // Запускаем когда 10% баннера видно
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                // Небольшая задержка для инициализации Swiper
                setTimeout(() => {
                    triggerAnimationsOnScroll()
                }, 200)
                // Отключаем observer после первого срабатывания
                observer.unobserve(entry.target)
            }
        })
    }, observerOptions)

    // Начинаем наблюдение за баннером
    observer.observe(bannerSection)

    // Проверяем видимость при загрузке
    checkInitialVisibility()

    // Слушаем события Swiper для анимации при смене слайдов
    // Проверяем наличие swiper instance через небольшую задержку
    setTimeout(() => {
        const swiperInstance = bannerSwiper.swiper

        if (swiperInstance) {
            swiperInstance.on('slideChange', () => {
                const currentSlide = swiperInstance.slides[swiperInstance.activeIndex]
                if (currentSlide) {
                    initSlideAnimations(currentSlide)
                }
            })
        }
    }, 200)
}

/**
 * Инициализация при загрузке DOM
 */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBannerAnimation)
} else {
    // Небольшая задержка для инициализации Swiper
    setTimeout(initBannerAnimation, 100)
}

export { initBannerAnimation }

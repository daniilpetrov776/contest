import { gsap } from 'gsap'

function initHeroHeaderAnimation() {
    const heroHeader = document.querySelector('.hero__header')

    if (!heroHeader) {
        return
    }

    // Устанавливаем начальное состояние
    gsap.set(heroHeader, {
        y: '0%',
    })

    // Обработчик скролла для анимации hero__header
    let lastScrollY = window.scrollY
    let currentStep = 0
    const stepSize = 13 // Шаг в процентах
    const maxStep = Math.ceil(150 / stepSize) // Максимальный шаг для -150%

    const handleScroll = () => {
        const currentScrollY = window.scrollY

        // Пропускаем обработку, если скролл не изменился
        if (currentScrollY === lastScrollY) {
            return
        }

        // Вычисляем новый шаг на основе позиции скролла
        // Используем высоту окна как единицу измерения
        const viewportHeight = window.innerHeight
        const scrollProgress = Math.min(currentScrollY / viewportHeight, 1)
        const newStep = Math.floor(scrollProgress * maxStep)

        // Ограничиваем шаг максимальным значением
        const clampedStep = Math.min(newStep, maxStep)

        // Вычисляем значение translateY
        const translateY = -clampedStep * stepSize

        // Ограничиваем крайним значением -150%
        const finalTranslateY = Math.max(translateY, -150)

        // Анимируем только если значение изменилось
        if (clampedStep !== currentStep) {
            currentStep = clampedStep

            gsap.to(heroHeader, {
                y: `${finalTranslateY}%`,
                duration: 1.6,
                ease: 'power2.out',
            })
        }

        lastScrollY = currentScrollY
    }

    // Добавляем обработчик скролла с оптимизацией через requestAnimationFrame
    let scrollTimeout
    window.addEventListener('scroll', () => {
        if (scrollTimeout) {
            cancelAnimationFrame(scrollTimeout)
        }
        scrollTimeout = requestAnimationFrame(handleScroll)
    })
}

// Запускаем анимацию после загрузки DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHeroHeaderAnimation)
} else {
    initHeroHeaderAnimation()
}

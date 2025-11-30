import { gsap } from 'gsap'

function initHeroAfterAnimation() {
    const hero = document.querySelector('.hero')

    if (!hero) {
        return
    }

    // Устанавливаем начальное состояние псевдоэлемента
    gsap.set(hero, {
        '--after-height': '0%',
    })

    // Анимация при загрузке - вычисляем начальную высоту в процентах
    const getInitialHeightPercent = () => {
        const heroHeight = hero.offsetHeight
        const isTablet = window.innerWidth >= 768 && window.innerWidth < 1440
        const initialHeightPx = isTablet ? 120 : 130
        return (initialHeightPx / heroHeight) * 100
    }

    const timeline = gsap.timeline({
        delay: 0.3, // Небольшая задержка после загрузки
    })

    // Анимация ::after - расширение до начальной высоты в процентах
    const initialHeightPercent = getInitialHeightPercent()

    timeline.to(hero, {
        '--after-height': `${initialHeightPercent}%`,
        'duration': 2,
        'ease': 'power2.out',
    })

    // Обработчик скролла для анимации ::after
    let lastScrollY = window.scrollY
    let currentStep = 0
    let currentAnimation = null
    const stepSize = 1 // Шаг в процентах
    const maxStep = Math.ceil(100 / stepSize) // Максимальный шаг для 100% (50% контейнера)

    const handleScroll = () => {
        const currentScrollY = window.scrollY

        // Пропускаем обработку, если скролл не изменился
        if (currentScrollY === lastScrollY) {
            return
        }

        // Получаем высоту hero контейнера
        const heroHeight = hero.offsetHeight

        // Получаем начальную высоту в процентах от контейнера
        const isTablet = window.innerWidth >= 768 && window.innerWidth < 1440
        const initialHeightPx = isTablet ? 120 : 130 // Начальная высота в пикселях
        const initialHeightPercent = (initialHeightPx / heroHeight) * 100 // Начальная высота в процентах

        // Максимальная высота - 50% от контейнера
        const maxHeightPercent = 50

        // Вычисляем диапазон от начальной высоты до максимальной в процентах
        const heightRangePercent = maxHeightPercent - initialHeightPercent

        // Вычисляем новый шаг на основе позиции скролла
        // Используем высоту окна как единицу измерения
        const viewportHeight = window.innerHeight
        const scrollProgress = Math.min(currentScrollY / viewportHeight, 1)
        const newStep = Math.floor(scrollProgress * maxStep)

        // Ограничиваем шаг максимальным значением
        const clampedStep = Math.min(newStep, maxStep)

        // Вычисляем процент прогресса от 0 до 1
        const stepPercent = clampedStep / maxStep

        // Вычисляем высоту в процентах: начальная + процент от диапазона
        const targetHeightPercent = initialHeightPercent + heightRangePercent * stepPercent

        // Прерываем текущую анимацию, если она есть
        if (currentAnimation) {
            currentAnimation.kill()
        }

        // Анимируем только если значение изменилось
        if (clampedStep !== currentStep) {
            currentStep = clampedStep

            // Анимируем от текущего значения до целевого (в процентах)
            currentAnimation = gsap.to(hero, {
                '--after-height': `${targetHeightPercent}%`,
                'duration': 1.6,
                'ease': 'power2.out',
                'onComplete': () => {
                    currentAnimation = null
                },
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
    document.addEventListener('DOMContentLoaded', initHeroAfterAnimation)
} else {
    initHeroAfterAnimation()
}

import { gsap } from 'gsap'

function initHeaderAnimation() {
    const header = document.querySelector('.header')

    if (!header) {
        return
    }

    // Устанавливаем начальное состояние псевдоэлемента
    gsap.set(header, {
        '--before-width': '0%',
    })

    // Анимация при загрузке
    const timeline = gsap.timeline({
        delay: 0.3, // Небольшая задержка после загрузки
    })

    // Анимация ::before - расширение до 100% в обе стороны с центра
    timeline.to(header, {
        '--before-width': '100%',
        'duration': 2,
        'ease': 'power2.out',
    })

    // Обработчик скролла для скрытия/показа хедера только на десктопе
    let lastScrollY = window.scrollY
    let isAnimating = false
    let isHeaderVisible = true

    const handleScroll = () => {
        const isDesktop = window.innerWidth >= 1440

        if (!isDesktop) {
            return
        }

        const currentScrollY = window.scrollY

        // Пропускаем обработку, если скролл не изменился
        if (currentScrollY === lastScrollY) {
            return
        }

        // Определяем направление скролла
        const isScrollingDown = currentScrollY > lastScrollY
        const shouldHide = isScrollingDown && currentScrollY > 0
        const shouldShow = !isScrollingDown || currentScrollY === 0

        // Анимируем только если нужно изменить состояние
        if ((shouldHide && isHeaderVisible) || (shouldShow && !isHeaderVisible)) {
            if (!isAnimating) {
                isAnimating = true

                const targetY = shouldHide ? '-100%' : '0%'

                gsap.to(header, {
                    y: targetY,
                    duration: 0.3,
                    ease: 'power2.out',
                    onComplete: () => {
                        isAnimating = false
                        isHeaderVisible = !shouldHide
                    },
                })
            }
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
    document.addEventListener('DOMContentLoaded', initHeaderAnimation)
} else {
    initHeaderAnimation()
}

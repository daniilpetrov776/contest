import { gsap } from 'gsap'

function initChildrenAnimation() {
    // Находим все контейнеры с data-атрибутом для анимации
    const containers = document.querySelectorAll('[data-animate-children]')

    if (containers.length === 0) {
        return
    }

    // Создаем Intersection Observer для отслеживания появления контейнеров в viewport
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1, // Срабатывает, когда 10% элемента видно
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const container = entry.target
                const children = Array.from(container.children)

                if (children.length === 0) {
                    return
                }

                // Парсим значение из data-атрибута (формат: "translateY,duration" или просто "translateY")
                const attrValue = container.dataset.animateChildren || '30px'
                const parts = attrValue.split(',').map(part => part.trim())
                const translateYValue = parts[0] || '30px'
                const duration = parts[1] ? Number.parseFloat(parts[1]) : 0.8

                // Устанавливаем начальное состояние для всех детей
                gsap.set(children, {
                    opacity: 0,
                    y: translateYValue,
                })

                // Анимируем детей последовательно
                gsap.to(children, {
                    opacity: 1,
                    y: 0,
                    duration,
                    ease: 'power2.out',
                    stagger: 0.1, // Задержка между анимациями детей
                })

                // Отключаем наблюдение после первой анимации
                observer.unobserve(container)
            }
        })
    }, observerOptions)

    // Начинаем наблюдение за всеми контейнерами
    containers.forEach((container) => {
        observer.observe(container)
    })
}

// Запускаем анимацию после загрузки DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initChildrenAnimation)
} else {
    initChildrenAnimation()
}

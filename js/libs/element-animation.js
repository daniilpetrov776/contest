import { gsap } from 'gsap'

function initElementAnimation() {
    // Находим все элементы с data-атрибутом для анимации
    const elements = document.querySelectorAll('[data-animate-element]')

    if (elements.length === 0) {
        return
    }

    // Создаем Intersection Observer для отслеживания появления элементов в viewport
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1, // Срабатывает, когда 10% элемента видно
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const element = entry.target

                // Парсим значение из data-атрибута (формат: "translateY,duration" или просто "translateY")
                const attrValue = element.dataset.animateElement || '30px'
                const parts = attrValue.split(',').map(part => part.trim())
                const translateYValue = parts[0] || '30px'
                const duration = parts[1] ? Number.parseFloat(parts[1]) : 0.8

                // Устанавливаем начальное состояние
                gsap.set(element, {
                    opacity: 0,
                    y: translateYValue,
                })

                // Анимируем элемент
                gsap.to(element, {
                    opacity: 1,
                    y: 0,
                    duration,
                    ease: 'power2.out',
                })

                // Отключаем наблюдение после первой анимации
                observer.unobserve(element)
            }
        })
    }, observerOptions)

    // Начинаем наблюдение за всеми элементами
    elements.forEach((element) => {
        observer.observe(element)
    })
}

// Запускаем анимацию после загрузки DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initElementAnimation)
} else {
    initElementAnimation()
}


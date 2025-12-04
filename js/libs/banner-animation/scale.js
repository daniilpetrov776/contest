import { gsap } from 'gsap'

/**
 * Анимация scale (масштабирование) с настраиваемым origin
 * @param {HTMLElement} element - Элемент для анимации
 * @param {string} direction - Направление анимации (from-down, from-up, from-left, from-right)
 * @param {string} offset - Начальный scale (не используется, всегда начинается с 0)
 * @param {number} duration - Длительность анимации в секундах
 * @param {boolean} shiftLine - Сдвигать ли родительскую строку (опционально)
 * @returns {gsap.core.Tween} - GSAP анимация
 */
export function animateScale(element, direction, offset, duration, shiftLine = false) {
    // Определяем transform-origin в зависимости от направления
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

    // Устанавливаем начальное состояние
    gsap.set(element, {
        scale: 0,
        transformOrigin,
    })

    // Если это горизонтальная анимация (from-left или from-right) и включен shiftLine, анимируем также сдвиг родительской строки
    if (isHorizontal && shiftLine) {
        // Ищем родительскую строку (banner__title-line)
        const parentLine = element.closest('.banner__title-line')

        if (parentLine) {
            // Получаем ширину элемента для расчета сдвига
            // Используем временное скрытие для измерения без визуального эффекта
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

            // Определяем начальный сдвиг строки
            const initialTranslateX = direction === 'from-left' ? -elementWidth : elementWidth

            // Устанавливаем начальное состояние для строки
            gsap.set(parentLine, {
                x: initialTranslateX,
            })

            // Создаем timeline для синхронной анимации scale и translateX
            const timeline = gsap.timeline()

            timeline.to(element, {
                scale: 1,
                duration,
                ease: 'power2.out',
            })

            timeline.to(
                parentLine,
                {
                    x: 0,
                    duration,
                    ease: 'power2.out',
                },
                0 // Запускаем одновременно
            )

            return timeline
        }
    }

    // Запускаем анимацию для вертикальных направлений или если не найдена строка
    return gsap.to(element, {
        scale: 1,
        duration,
        ease: 'power2.out',
    })
}

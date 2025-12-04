import { gsap } from 'gsap'

/**
 * Анимация slide (скольжение)
 * @param {HTMLElement} element - Элемент для анимации
 * @param {string} direction - Направление анимации (from-down, from-up, from-left, from-right)
 * @param {string} offset - Смещение (например, '20px')
 * @param {number} duration - Длительность анимации в секундах
 * @returns {gsap.core.Tween} - GSAP анимация
 */
export function animateSlide(element, direction, offset, duration) {
    // Парсим смещение
    const offsetValue = Number.parseFloat(offset) || 20
    const offsetUnit = offset.replace(/\d/g, '') || 'px'

    // Определяем начальные значения в зависимости от направления
    let initialX = 0
    let initialY = 0
    const finalX = 0
    const finalY = 0

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

    // Устанавливаем начальное состояние
    gsap.set(element, {
        x: `${initialX}${offsetUnit}`,
        y: `${initialY}${offsetUnit}`,
    })

    // Запускаем анимацию
    return gsap.to(element, {
        x: `${finalX}${offsetUnit}`,
        y: `${finalY}${offsetUnit}`,
        duration,
        ease: 'power2.out',
    })
}

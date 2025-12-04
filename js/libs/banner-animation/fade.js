import { gsap } from 'gsap'

/**
 * Анимация fade (появление)
 * @param {HTMLElement} element - Элемент для анимации
 * @param {string} direction - Направление анимации (не используется для fade, но оставлено для совместимости)
 * @param {string} offset - Смещение (не используется для fade, но оставлено для совместимости)
 * @param {number} duration - Длительность анимации в секундах
 * @returns {gsap.core.Tween} - GSAP анимация
 */
export function animateFade(element, direction, offset, duration) {
    // Устанавливаем начальное состояние
    gsap.set(element, {
        opacity: 0,
    })

    // Запускаем анимацию
    return gsap.to(element, {
        opacity: 1,
        duration,
        ease: 'power2.out',
    })
}

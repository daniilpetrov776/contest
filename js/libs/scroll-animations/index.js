import { Animation } from './animation'

export function initScrollAnimations() {
    const scrollAnim = new Animation('animate')
    scrollAnim
        .fadeScaleGroup({
            itemSelector: null, // анимируем сами карточки
            start: 'top 80%',
            duration: 0.6,
            stagger: 0.1,
        })
}

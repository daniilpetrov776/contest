import Swiper from 'swiper'
import 'swiper/css'

const MOBILE_BREAKPOINT = 768

const portfolioSwipers = new Map()

function initPortfolioSliders() {
    const categories = document.querySelectorAll('.portfolio__category.swiper')

    if (window.innerWidth >= MOBILE_BREAKPOINT) {
        destroyPortfolioSliders()
        return
    }

    if (!categories || categories.length === 0) {
        return
    }

    categories.forEach((category) => {
        // Если свайпер уже инициализирован для этого элемента, пропускаем
        if (portfolioSwipers.has(category)) {
            return
        }

        const swiper = new Swiper(category, {
            slidesPerView: 'auto',
            spaceBetween: 10,
            speed: 800,
            observer: true,
            observeParents: true,
        })

        portfolioSwipers.set(category, swiper)
    })
}

function destroyPortfolioSliders() {
    portfolioSwipers.forEach((swiper, element) => {
        swiper.destroy(true, true)
        portfolioSwipers.delete(element)
    })
}

function handleResize() {
    if (window.innerWidth >= MOBILE_BREAKPOINT) {
        destroyPortfolioSliders()
    } else {
        initPortfolioSliders()
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPortfolioSliders)
} else {
    initPortfolioSliders()
}

// Обработка изменения размера окна с debounce
let resizeTimer = null
window.addEventListener('resize', () => {
    if (resizeTimer) {
        clearTimeout(resizeTimer)
    }
    resizeTimer = setTimeout(handleResize, 250)
})

// Экспорт для возможности ручного управления
export { destroyPortfolioSliders, initPortfolioSliders }

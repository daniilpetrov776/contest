import type { Swiper as SwiperType } from 'swiper'
import Swiper from 'swiper'
import { Autoplay, EffectFade, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/effect-fade'
import 'swiper/css/pagination'

let bannerSwiper: SwiperType | null = null

function initBannerSlider(): void {
    const bannerElement = document.querySelector<HTMLElement>('.banner__swiper')

    if (!bannerElement) {
        return
    }

    // Уничтожаем существующий экземпляр, если есть
    if (bannerSwiper) {
        bannerSwiper.destroy(true, true)
        bannerSwiper = null
    }

    bannerSwiper = new Swiper(bannerElement, {
        modules: [Autoplay, EffectFade, Pagination],
        effect: 'fade',
        fadeEffect: {
            crossFade: true,
        },
        slidesPerView: 1,
        spaceBetween: 0,
        speed: 800,
        autoplay: {
            delay: 5000,
            disableOnInteraction: false,
        },
        pagination: {
            el: '.banner__pagination',
            clickable: true,
        },
        observer: true,
        observeParents: true,
    })
}

// Инициализация при загрузке DOM
// Временно отключено для верстки
// if (document.readyState === 'loading') {
//     document.addEventListener('DOMContentLoaded', initBannerSlider)
// } else {
//     initBannerSlider()
// }

// Экспорт для возможности ручного управления
export { initBannerSlider }

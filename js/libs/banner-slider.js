import Swiper from 'swiper'
import { Autoplay, EffectFade, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/effect-fade'
import 'swiper/css/pagination'

let bannerSwiper = null

function initBannerSlider() {
    const bannerElement = document.querySelector ('.banner__swiper')

    if (!bannerElement) {
        return
    }

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
        speed: 300,
        pagination: {
            el: '.banner__pagination',
            clickable: false, // Управляем кликами вручную
            renderBullet: () => '', // Отключаем стандартное создание точек
        },
        observer: true,
        observeParents: true,
        on: {
            init: (swiper) => {
                // Небольшая задержка для полной инициализации Swiper
                setTimeout(() => {
                    updatePaginationStyles(swiper)
                }, 50)
            },
            slideChange: (swiper) => {
                updatePaginationStyles(swiper)
            },
        },
    })

    /**
     * Обновляет стили пагинации в зависимости от активного слайда
     * @param {Swiper} swiper - Экземпляр Swiper
     */
    function updatePaginationStyles(swiper) {
        const paginationEl = swiper.pagination.el
        const activeIndex = swiper.activeIndex
        const totalSlides = swiper.slides.length

        if (!paginationEl) {
            return
        }

        // Удаляем все существующие точки
        paginationEl.innerHTML = ''

        // Определяем, какие точки показывать и как их стилизовать
        let visibleIndices = []
        let activeBulletIndex = 0

        // Всегда показываем 4 точки
        if (totalSlides <= 4) {
            // Если слайдов 4 или меньше, показываем все существующие
            visibleIndices = Array.from({ length: Math.min(4, totalSlides) }, (_, i) => i)
            activeBulletIndex = activeIndex
        } else {
            // Если слайдов больше 4, показываем только 4 точки
            if (activeIndex === 0) {
                // Первый слайд: показываем первые 4
                visibleIndices = [0, 1, 2, 3]
                activeBulletIndex = 0
            } else if (activeIndex === totalSlides - 1) {
                // Последний слайд: показываем последние 4
                visibleIndices = [totalSlides - 4, totalSlides - 3, totalSlides - 2, totalSlides - 1]
                activeBulletIndex = 3
            } else {
                // Промежуточный слайд
                const slidesBefore = activeIndex
                const slidesAfter = totalSlides - activeIndex - 1

                if (slidesBefore >= 2 && slidesAfter >= 1) {
                    // Можно показать 2 слева и 1 справа
                    visibleIndices = [activeIndex - 2, activeIndex - 1, activeIndex, activeIndex + 1]
                    activeBulletIndex = 2
                } else if (slidesBefore >= 1 && slidesAfter >= 2) {
                    // Можно показать 1 слева и 2 справа
                    visibleIndices = [activeIndex - 1, activeIndex, activeIndex + 1, activeIndex + 2]
                    activeBulletIndex = 1
                } else if (slidesBefore < 2) {
                    // Близко к началу
                    visibleIndices = [0, 1, 2, 3]
                    activeBulletIndex = activeIndex
                } else {
                    // Близко к концу
                    visibleIndices = [totalSlides - 4, totalSlides - 3, totalSlides - 2, totalSlides - 1]
                    activeBulletIndex = activeIndex - (totalSlides - 4)
                }
            }
        }

        // Создаем 4 точки (или меньше, если слайдов меньше 4)
        const bulletsToCreate = Math.min(4, totalSlides)
        for (let i = 0; i < bulletsToCreate; i++) {
            // Если слайдов меньше 4 и индекс выходит за пределы, пропускаем
            if (i >= visibleIndices.length) {
                break
            }

            const bullet = document.createElement('span')
            bullet.className = 'swiper-pagination-bullet'

            // Принудительно применяем transition для плавной анимации
            bullet.style.transition = 'background-color 0.3s ease, transform 0.3s ease'

            const realSlideIndex = visibleIndices[i]
            const isActive = i === activeBulletIndex

            if (isActive) {
                bullet.classList.add('swiper-pagination-bullet-active')
            }

            // Определяем стили в зависимости от позиции
            if (isActive) {
                // Активная точка - черная (уже через CSS класс)
            } else if (activeIndex === 0) {
                // Первый слайд активен: [черная, серая, серая, бледная]
                if (i === 1 || i === 2) {
                    bullet.classList.add('banner__pagination-bullet--gray')
                } else if (i === 3) {
                    bullet.classList.add('banner__pagination-bullet--light')
                }
            } else if (activeIndex === totalSlides - 1) {
                // Последний слайд активен: [бледная, серая, серая, черная]
                if (i === 1 || i === 2) {
                    bullet.classList.add('banner__pagination-bullet--gray')
                } else if (i === 0) {
                    bullet.classList.add('banner__pagination-bullet--light')
                }
            } else {
                // Промежуточный слайд активен
                const slidesBefore = activeIndex
                const slidesAfter = totalSlides - activeIndex - 1

                if (i === activeBulletIndex - 1) {
                    // Слева от активной - серая
                    bullet.classList.add('banner__pagination-bullet--gray')
                } else if (i === activeBulletIndex + 1) {
                    // Справа от активной - серая
                    bullet.classList.add('banner__pagination-bullet--gray')
                } else if (slidesAfter > slidesBefore && i === activeBulletIndex + 2) {
                    // Бледная справа, если справа больше слайдов
                    bullet.classList.add('banner__pagination-bullet--light')
                } else if (slidesBefore > slidesAfter && i === activeBulletIndex - 2) {
                    // Бледная слева, если слева больше слайдов
                    bullet.classList.add('banner__pagination-bullet--light')
                }
            }

            // Устанавливаем обработчик клика
            bullet.addEventListener('click', () => {
                swiper.slideTo(realSlideIndex)
            })

            paginationEl.appendChild(bullet)
        }

        // Обновляем ссылки на bullets в Swiper
        swiper.pagination.bullets = Array.from(paginationEl.querySelectorAll('.swiper-pagination-bullet'))
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBannerSlider)
} else {
    initBannerSlider()
}

export { initBannerSlider }

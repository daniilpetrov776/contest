import Swiper from 'swiper';
import { Autoplay, EffectFade, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/pagination';

const SLIDES_PER_VIEW = 1;
const SPACE_BETWEEN = 0;
const SWIPER_SPEED = 300;
const INIT_DELAY = 50;
const RADIX_DECIMAL = 10;
const TABINDEX_DISABLED = -1;
const TABINDEX_ENABLED = 0;
const MAX_VISIBLE_BULLETS = 4;
const FIRST_SLIDE_INDEX = 0;
const INITIAL_BULLETS_INDICES = [0, 1, 2, 3];
const LAST_BULLET_INDEX = 3;
const ACTIVE_BULLET_INDEX_CENTER = 2;
const ACTIVE_BULLET_INDEX_OFFSET = 1;
const SLIDES_BEFORE_THRESHOLD = 2;
const SLIDES_AFTER_THRESHOLD_MIN = 1;
const SLIDES_AFTER_THRESHOLD_MAX = 2;
const BULLET_OFFSET_LEFT = -2;
const BULLET_OFFSET_RIGHT = 2;
const TRANSITION_DURATION = '0.3s';
const TRANSITION_EASE = 'ease';
const TRANSITION_PROPERTIES = `background-color ${TRANSITION_DURATION} ${TRANSITION_EASE}, transform ${TRANSITION_DURATION} ${TRANSITION_EASE}`;
const GRAY_BULLET_INDICES = [1, 2];
const LIGHT_BULLET_INDEX_END = 3;
const LIGHT_BULLET_INDEX_START = 0;
const BULLET_OFFSET_NEARBY = 1;

let bannerSwiper = null;

function initBannerSlider() {
  const bannerElement = document.querySelector ('.banner__swiper');

  if (!bannerElement) {
    return;
  }

  if (bannerSwiper) {
    bannerSwiper.destroy(true, true);
    bannerSwiper = null;
  }

  bannerSwiper = new Swiper(bannerElement, {
    modules: [Autoplay, EffectFade, Pagination],
    effect: 'fade',
    fadeEffect: {
      crossFade: true,
    },
    slidesPerView: SLIDES_PER_VIEW,
    spaceBetween: SPACE_BETWEEN,
    speed: SWIPER_SPEED,
    pagination: {
      el: '.banner__pagination',
      clickable: false, // Управляем кликами вручную
      renderBullet: () => '', // Отключаем стандартное создание точек
    },
    observer: true,
    observeParents: true,
    on: {
      init: (swiper) => {
        // Добавляем id к слайдам для доступности
        swiper.slides.forEach((slide, index) => {
          slide.id = `banner-slide-${index}`;
        });
        // Небольшая задержка для полной инициализации Swiper
        setTimeout(() => {
          updatePaginationStyles(swiper);
          updateSlideButtonsAccessibility(swiper);
        }, INIT_DELAY);
      },
      slideChange: (swiper) => {
        updatePaginationStyles(swiper);
        updateSlideButtonsAccessibility(swiper);
      },
    },
  });

  /**
   * Обновляет доступность кнопок в слайдах
   * @param {Swiper} swiper - Экземпляр Swiper
   */
  function updateSlideButtonsAccessibility(swiper) {
    const activeIndex = swiper.activeIndex;
    const slides = swiper.slides;

    slides.forEach((slide, index) => {
      // Находим все интерактивные элементы в слайде (кнопки и ссылки)
      const interactiveElements = slide.querySelectorAll('a, button, [tabindex]');

      if (index === activeIndex) {
        // В активном слайде делаем элементы доступными
        interactiveElements.forEach((element) => {
          // Если элемент имеет tabindex, убираем его или устанавливаем 0
          if (element.hasAttribute('tabindex')) {
            const currentTabIndex = Number.parseInt(element.getAttribute('tabindex'), RADIX_DECIMAL);
            // Если tabindex был -1 (недоступный), убираем атрибут или ставим 0
            if (currentTabIndex === TABINDEX_DISABLED) {
              element.removeAttribute('tabindex');
            }
          }
        });
      } else {
        // В неактивных слайдах делаем элементы недоступными
        interactiveElements.forEach((element) => {
          // Устанавливаем tabindex=-1 только если элемент не был специально скрыт
          if (!element.hasAttribute('tabindex') || Number.parseInt(element.getAttribute('tabindex'), RADIX_DECIMAL) >= TABINDEX_ENABLED) {
            element.setAttribute('tabindex', TABINDEX_DISABLED.toString());
          }
        });
      }
    });
  }

  /**
   * Обновляет стили пагинации в зависимости от активного слайда
   * @param {Swiper} swiper - Экземпляр Swiper
   */
  function updatePaginationStyles(swiper) {
    const paginationEl = swiper.pagination.el;
    const activeIndex = swiper.activeIndex;
    const totalSlides = swiper.slides.length;

    if (!paginationEl) {
      return;
    }

    // Удаляем все существующие точки
    paginationEl.innerHTML = '';
    paginationEl.setAttribute('role', 'tablist');
    paginationEl.setAttribute('aria-label', 'Навигация по слайдам');
    paginationEl.tabIndex = TABINDEX_DISABLED;

    // Определяем, какие точки показывать и как их стилизовать
    let visibleIndices = [];
    let activeBulletIndex = 0;

    // Всегда показываем 4 точки
    if (totalSlides <= MAX_VISIBLE_BULLETS) {
      // Если слайдов 4 или меньше, показываем все существующие
      visibleIndices = Array.from({ length: Math.min(MAX_VISIBLE_BULLETS, totalSlides) }, (_, i) => i);
      activeBulletIndex = activeIndex;
    } else {
      // Если слайдов больше 4, показываем только 4 точки
      if (activeIndex === FIRST_SLIDE_INDEX) {
        // Первый слайд: показываем первые 4
        visibleIndices = INITIAL_BULLETS_INDICES;
        activeBulletIndex = FIRST_SLIDE_INDEX;
      } else if (activeIndex === totalSlides - 1) {
        // Последний слайд: показываем последние 4
        visibleIndices = [totalSlides - MAX_VISIBLE_BULLETS, totalSlides - 3, totalSlides - 2, totalSlides - 1];
        activeBulletIndex = LAST_BULLET_INDEX;
      } else {
        // Промежуточный слайд
        const slidesBefore = activeIndex;
        const slidesAfter = totalSlides - activeIndex - 1;

        if (slidesBefore >= SLIDES_BEFORE_THRESHOLD && slidesAfter >= SLIDES_AFTER_THRESHOLD_MIN) {
          // Можно показать 2 слева и 1 справа
          visibleIndices = [activeIndex + BULLET_OFFSET_LEFT, activeIndex - ACTIVE_BULLET_INDEX_OFFSET, activeIndex, activeIndex + ACTIVE_BULLET_INDEX_OFFSET];
          activeBulletIndex = ACTIVE_BULLET_INDEX_CENTER;
        } else if (slidesBefore >= ACTIVE_BULLET_INDEX_OFFSET && slidesAfter >= SLIDES_AFTER_THRESHOLD_MAX) {
          // Можно показать 1 слева и 2 справа
          visibleIndices = [activeIndex - ACTIVE_BULLET_INDEX_OFFSET, activeIndex, activeIndex + ACTIVE_BULLET_INDEX_OFFSET, activeIndex + BULLET_OFFSET_RIGHT];
          activeBulletIndex = ACTIVE_BULLET_INDEX_OFFSET;
        } else if (slidesBefore < SLIDES_BEFORE_THRESHOLD) {
          // Близко к началу
          visibleIndices = INITIAL_BULLETS_INDICES;
          activeBulletIndex = activeIndex;
        } else {
          // Близко к концу
          visibleIndices = [totalSlides - MAX_VISIBLE_BULLETS, totalSlides - 3, totalSlides - 2, totalSlides - 1];
          activeBulletIndex = activeIndex - (totalSlides - MAX_VISIBLE_BULLETS);
        }
      }
    }

    // Создаем 4 точки (или меньше, если слайдов меньше 4)
    const bulletsToCreate = Math.min(MAX_VISIBLE_BULLETS, totalSlides);
    for (let i = 0; i < bulletsToCreate; i++) {
      // Если слайдов меньше 4 и индекс выходит за пределы, пропускаем
      if (i >= visibleIndices.length) {
        break;
      }

      const realSlideIndex = visibleIndices[i];
      const isActive = i === activeBulletIndex;

      const bullet = document.createElement('button');
      bullet.className = 'swiper-pagination-bullet';
      bullet.type = 'button';
      bullet.setAttribute('role', 'tab');
      bullet.tabIndex = TABINDEX_ENABLED;
      bullet.setAttribute('aria-label', `Перейти к слайду ${realSlideIndex + 1} из ${totalSlides}`);
      bullet.setAttribute('aria-selected', isActive ? 'true' : 'false');
      bullet.setAttribute('aria-controls', `banner-slide-${realSlideIndex}`);
      bullet.dataset.slideIndex = realSlideIndex.toString();

      // Принудительно применяем transition для плавной анимации
      bullet.style.transition = TRANSITION_PROPERTIES;

      if (isActive) {
        bullet.classList.add('swiper-pagination-bullet-active');
      }

      // Определяем стили в зависимости от позиции
      if (isActive) {
        // Активная точка - черная (уже через CSS класс)
      } else if (activeIndex === FIRST_SLIDE_INDEX) {
        // Первый слайд активен: [черная, серая, серая, бледная]
        if (GRAY_BULLET_INDICES.includes(i)) {
          bullet.classList.add('banner__pagination-bullet--gray');
        } else if (i === LIGHT_BULLET_INDEX_END) {
          bullet.classList.add('banner__pagination-bullet--light');
        }
      } else if (activeIndex === totalSlides - 1) {
        // Последний слайд активен: [бледная, серая, серая, черная]
        if (GRAY_BULLET_INDICES.includes(i)) {
          bullet.classList.add('banner__pagination-bullet--gray');
        } else if (i === LIGHT_BULLET_INDEX_START) {
          bullet.classList.add('banner__pagination-bullet--light');
        }
      } else {
        // Промежуточный слайд активен
        const slidesBefore = activeIndex;
        const slidesAfter = totalSlides - activeIndex - 1;

        if (i === activeBulletIndex - BULLET_OFFSET_NEARBY) {
          // Слева от активной - серая
          bullet.classList.add('banner__pagination-bullet--gray');
        } else if (i === activeBulletIndex + BULLET_OFFSET_NEARBY) {
          // Справа от активной - серая
          bullet.classList.add('banner__pagination-bullet--gray');
        } else if (slidesAfter > slidesBefore && i === activeBulletIndex + BULLET_OFFSET_RIGHT) {
          // Бледная справа, если справа больше слайдов
          bullet.classList.add('banner__pagination-bullet--light');
        } else if (slidesBefore > slidesAfter && i === activeBulletIndex + BULLET_OFFSET_LEFT) {
          // Бледная слева, если слева больше слайдов
          bullet.classList.add('banner__pagination-bullet--light');
        }
      }

      // Устанавливаем обработчик клика
      const handleBulletClick = () => {
        swiper.slideTo(realSlideIndex);
      };

      bullet.addEventListener('click', handleBulletClick);

      // Обработчик клавиатуры для доступности
      bullet.addEventListener('keydown', (e) => {
        const bullets = Array.from(paginationEl.querySelectorAll('.swiper-pagination-bullet'));
        const currentIndex = bullets.indexOf(bullet);

        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleBulletClick();
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
          e.preventDefault();
          let targetIndex;

          if (e.key === 'ArrowLeft') {
            targetIndex = currentIndex > 0 ? currentIndex - 1 : bullets.length - 1;
          } else {
            targetIndex = currentIndex < bullets.length - 1 ? currentIndex + 1 : 0;
          }

          const targetBullet = bullets[targetIndex];
          if (targetBullet) {
            targetBullet.focus();
          }
        }
      });

      paginationEl.appendChild(bullet);
    }

    // Обновляем ссылки на bullets в Swiper
    swiper.pagination.bullets = Array.from(paginationEl.querySelectorAll('.swiper-pagination-bullet'));
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initBannerSlider);
} else {
  initBannerSlider();
}

export { initBannerSlider };

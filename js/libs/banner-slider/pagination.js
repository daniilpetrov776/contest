import {
  MAX_VISIBLE_BULLETS,
  FIRST_SLIDE_INDEX,
  INITIAL_BULLETS_INDICES,
  LAST_BULLET_INDEX,
  ACTIVE_BULLET_INDEX_CENTER,
  ACTIVE_BULLET_INDEX_OFFSET,
  SLIDES_BEFORE_THRESHOLD,
  SLIDES_AFTER_THRESHOLD_MIN,
  SLIDES_AFTER_THRESHOLD_MAX,
  BULLET_OFFSET_LEFT,
  BULLET_OFFSET_RIGHT,
  GRAY_BULLET_INDICES,
  LIGHT_BULLET_INDEX_END,
  LIGHT_BULLET_INDEX_START,
  BULLET_OFFSET_NEARBY,
  TABINDEX_DISABLED,
  TABINDEX_ENABLED,
  TRANSITION_PROPERTIES,
} from './constants.js';

/**
 * Обновляет стили пагинации в зависимости от активного слайда
 * @param {Swiper} swiper - Экземпляр Swiper
 */
export function updatePaginationStyles(swiper) {
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

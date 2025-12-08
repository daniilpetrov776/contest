import Swiper from 'swiper';
import { Autoplay, EffectFade, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/pagination';
import { initOnDOMReady } from '../animation-utils.js';
import {
  SLIDES_PER_VIEW,
  SPACE_BETWEEN,
  SWIPER_SPEED,
  INIT_DELAY,
} from './constants.js';
import { updateSlideButtonsAccessibility } from './accessibility.js';
import { updatePaginationStyles } from './pagination.js';

let bannerSwiper = null;

function initBannerSlider() {
  const bannerElement = document.querySelector('.banner__swiper');

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
}

initOnDOMReady(initBannerSlider);

export { initBannerSlider };

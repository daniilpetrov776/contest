import {
  RADIX_DECIMAL,
  TABINDEX_DISABLED,
  TABINDEX_ENABLED,
} from './constants.js';

/**
 * Обновляет доступность кнопок в слайдах
 * @param {Swiper} swiper - Экземпляр Swiper
 */
export function updateSlideButtonsAccessibility(swiper) {
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

import { gsap } from 'gsap';
import {
  DEFAULT_OFFSET,
  DEFAULT_DURATION,
  INITIAL_OPACITY,
  FINAL_OPACITY,
  FINAL_Y_POSITION,
  STAGGER_DELAY,
  EASE_TYPE,
} from './animation-constants.js';
import { createIntersectionObserver } from './animation-utils.js';
import { initOnDOMReady } from './animation-utils.js';

/**
 * Инициализирует анимацию для элементов с data-animate-element
 * @param {boolean} animateChildren - Если true, анимирует детей контейнера, иначе сам элемент
 */
function initElementAnimation(animateChildren = false) {
  const selector = animateChildren ? '[data-animate-children]' : '[data-animate-element]';
  const dataAttribute = animateChildren ? 'animateChildren' : 'animateElement';
  const elements = document.querySelectorAll(selector);

  if (elements.length === 0) {
    return;
  }

  const observer = createIntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const container = entry.target;

        if (animateChildren) {
          // Анимация детей контейнера
          const children = Array.from(container.children);

          if (children.length === 0) {
            return;
          }

          // Парсим значение из data-атрибута (формат: "translateY,duration" или просто "translateY")
          const attrValue = container.dataset[dataAttribute] || DEFAULT_OFFSET;
          const parts = attrValue.split(',').map((part) => part.trim());
          const translateYValue = parts[0] || DEFAULT_OFFSET;
          const duration = parts[1] ? Number.parseFloat(parts[1]) : DEFAULT_DURATION;

          // Устанавливаем начальное состояние для всех детей
          gsap.set(children, {
            opacity: INITIAL_OPACITY,
            y: translateYValue,
          });

          // Анимируем детей последовательно
          gsap.to(children, {
            opacity: FINAL_OPACITY,
            y: FINAL_Y_POSITION,
            duration,
            ease: EASE_TYPE,
            stagger: STAGGER_DELAY, // Задержка между анимациями детей
          });
        } else {
          // Анимация самого элемента
          // Парсим значение из data-атрибута (формат: "translateY,duration" или просто "translateY")
          const attrValue = container.dataset[dataAttribute] || DEFAULT_OFFSET;
          const parts = attrValue.split(',').map((part) => part.trim());
          const translateYValue = parts[0] || DEFAULT_OFFSET;
          const duration = parts[1] ? Number.parseFloat(parts[1]) : DEFAULT_DURATION;

          // Устанавливаем начальное состояние
          gsap.set(container, {
            opacity: INITIAL_OPACITY,
            y: translateYValue,
          });

          // Анимируем элемент
          gsap.to(container, {
            opacity: FINAL_OPACITY,
            y: FINAL_Y_POSITION,
            duration,
            ease: EASE_TYPE,
          });
        }

        // Отключаем наблюдение после первой анимации
        observer.unobserve(container);
      }
    });
  });

  // Начинаем наблюдение за всеми элементами
  elements.forEach((element) => {
    observer.observe(element);
  });
}

/**
 * Инициализирует анимацию для элементов
 */
function initSingleElementAnimation() {
  initElementAnimation(false);
}

/**
 * Инициализирует анимацию для детей контейнеров
 */
function initChildrenAnimation() {
  initElementAnimation(true);
}

// Запускаем анимации после загрузки DOM
initOnDOMReady(() => {
  initSingleElementAnimation();
  initChildrenAnimation();
});

export { initChildrenAnimation, initSingleElementAnimation };

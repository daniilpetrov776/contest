import { gsap } from 'gsap';
import { EASE_TYPE } from './animation-constants.js';
import { createOptimizedScrollHandler, initOnDOMReady } from './animation-utils.js';

const INITIAL_Y_PERCENT = 0;
const STEP_SIZE = 13;
const MAX_TRANSLATE_Y_PERCENT = 150;
const SCROLL_PROGRESS_MAX = 1;
const ANIMATION_DURATION = 1.6;

function initHeroHeaderAnimation() {
  const heroHeader = document.querySelector('.hero__header');

  if (!heroHeader) {
    return;
  }

  // Устанавливаем начальное состояние
  gsap.set(heroHeader, {
    y: `${INITIAL_Y_PERCENT}%`,
  });

  // Обработчик скролла для анимации hero__header
  let lastScrollY = window.scrollY;
  let currentStep = 0;
  const maxStep = Math.ceil(MAX_TRANSLATE_Y_PERCENT / STEP_SIZE);

  const handleScroll = () => {
    const currentScrollY = window.scrollY;

    // Пропускаем обработку, если скролл не изменился
    if (currentScrollY === lastScrollY) {
      return;
    }

    // Вычисляем новый шаг на основе позиции скролла
    // Используем высоту окна как единицу измерения
    const viewportHeight = window.innerHeight;
    const scrollProgress = Math.min(currentScrollY / viewportHeight, SCROLL_PROGRESS_MAX);
    const newStep = Math.floor(scrollProgress * maxStep);

    // Ограничиваем шаг максимальным значением
    const clampedStep = Math.min(newStep, maxStep);

    // Вычисляем значение translateY
    const translateY = -clampedStep * STEP_SIZE;

    // Ограничиваем крайним значением
    const finalTranslateY = Math.max(translateY, -MAX_TRANSLATE_Y_PERCENT);

    // Анимируем только если значение изменилось
    if (clampedStep !== currentStep) {
      currentStep = clampedStep;

      gsap.to(heroHeader, {
        y: `${finalTranslateY}%`,
        duration: ANIMATION_DURATION,
        ease: EASE_TYPE,
      });
    }

    lastScrollY = currentScrollY;
  };

  // Добавляем обработчик скролла с оптимизацией через requestAnimationFrame
  createOptimizedScrollHandler(handleScroll);
}

// Запускаем анимацию после загрузки DOM
initOnDOMReady(initHeroHeaderAnimation);

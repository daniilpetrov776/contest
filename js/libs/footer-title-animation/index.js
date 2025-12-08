import { initOnDOMReady } from '../animation-utils.js';
import { parseAnimationParams, wrapWordsInSpans, setInitialPosition } from './utils.js';
import { createScrollAnimation } from './scroll-animation.js';

/**
 * Инициализирует анимацию footer__title по скроллу
 */
function initFooterTitleAnimation() {
  const footerTitle = document.querySelector('.footer__title');

  if (!footerTitle) {
    return;
  }

  const animationValue = footerTitle.dataset.scrollAnimation;

  if (!animationValue) {
    return;
  }

  const params = parseAnimationParams(animationValue);

  if (!params) {
    return;
  }

  // Устанавливаем overflow: hidden на родительский элемент для скрытия слов за границей
  footerTitle.style.overflow = 'hidden';

  // Разбиваем текст на слова и оборачиваем в spans
  const wordSpans = wrapWordsInSpans(footerTitle);

  if (wordSpans.length === 0) {
    return;
  }

  // Устанавливаем начальные состояния для всех слов
  setInitialPosition(wordSpans, params.direction, params.offset);

  // Создаем анимацию с поддержкой reverse для слов
  createScrollAnimation(footerTitle, params, {
    wordSpans,
    supportsReverse: true,
  });
}

/**
 * Инициализирует анимацию footer__policy по скроллу (вся строка целиком)
 */
function initFooterPolicyAnimation() {
  const footerPolicy = document.querySelector('.footer__policy');

  if (!footerPolicy) {
    return;
  }

  const animationValue = footerPolicy.dataset.scrollAnimation;

  if (!animationValue) {
    return;
  }

  const params = parseAnimationParams(animationValue);

  if (!params) {
    return;
  }

  // Устанавливаем начальное состояние
  setInitialPosition(footerPolicy, params.direction, params.offset);

  // Создаем анимацию для элемента целиком
  createScrollAnimation(footerPolicy, params);
}

/**
 * Инициализация при загрузке DOM
 */
function initFooterAnimations() {
  initFooterTitleAnimation();
  initFooterPolicyAnimation();
}

initOnDOMReady(initFooterAnimations);

export { initFooterPolicyAnimation, initFooterTitleAnimation };

import { gsap } from 'gsap';

// Константы для scale анимации
const INITIAL_SCALE = 0;
const FINAL_SCALE = 1;

// Константы для visibility
const VISIBILITY_HIDDEN = 'hidden';
const VISIBILITY_VISIBLE = 'visible';

// Константы для позиционирования
const FINAL_X_POSITION = 0;
const TIMELINE_START_POSITION = 0;

// Константы для easing
const EASING_SCALE = 'power2.out';

/**
 * Анимация scale (масштабирование) с настраиваемым origin
 * @param {HTMLElement} element - Элемент для анимации
 * @param {string} direction - Направление анимации (from-down, from-up, from-left, from-right)
 * @param {string} offset - Начальный scale (не используется, всегда начинается с 0)
 * @param {number} duration - Длительность анимации в секундах
 * @param {boolean} shiftLine - Сдвигать ли родительскую строку (опционально)
 * @returns {gsap.core.Tween} - GSAP анимация
 */
export function animateScale(element, direction, offset, duration, shiftLine = false) {
  // Определяем transform-origin в зависимости от направления
  let transformOrigin = 'bottom';
  const isHorizontal = direction === 'from-left' || direction === 'from-right';

  switch (direction) {
    case 'from-down':
      transformOrigin = 'bottom';
      break;
    case 'from-up':
      transformOrigin = 'top';
      break;
    case 'from-left':
      transformOrigin = 'left';
      break;
    case 'from-right':
      transformOrigin = 'right';
      break;
    default:
      transformOrigin = 'bottom';
  }

  // Устанавливаем начальное состояние
  gsap.set(element, {
    scale: INITIAL_SCALE,
    transformOrigin,
  });

  // Если это горизонтальная анимация (from-left или from-right) и включен shiftLine, анимируем также сдвиг родительской строки
  if (isHorizontal && shiftLine) {
    // Ищем родительскую строку (banner__title-line)
    const parentLine = element.closest('.banner__title-line');

    if (parentLine) {
      // Получаем ширину элемента для расчета сдвига
      // Используем временное скрытие для измерения без визуального эффекта
      const originalVisibility = element.style.visibility;
      gsap.set(element, {
        scale: FINAL_SCALE,
        visibility: VISIBILITY_HIDDEN,
      });
      const elementWidth = element.offsetWidth || element.getBoundingClientRect().width || 0;
      gsap.set(element, {
        scale: INITIAL_SCALE,
        visibility: originalVisibility || VISIBILITY_VISIBLE,
      });

      // Определяем начальный сдвиг строки
      const initialTranslateX = direction === 'from-left' ? -elementWidth : elementWidth;

      // Устанавливаем начальное состояние для строки
      gsap.set(parentLine, {
        x: initialTranslateX,
      });

      // Создаем timeline для синхронной анимации scale и translateX
      const timeline = gsap.timeline();

      timeline.to(element, {
        scale: FINAL_SCALE,
        duration,
        ease: EASING_SCALE,
      });

      timeline.to(
        parentLine,
        {
          x: FINAL_X_POSITION,
          duration,
          ease: EASING_SCALE,
        },
        TIMELINE_START_POSITION,
      );

      return timeline;
    }
  }

  // Запускаем анимацию для вертикальных направлений или если не найдена строка
  return gsap.to(element, {
    scale: FINAL_SCALE,
    duration,
    ease: EASING_SCALE,
  });
}

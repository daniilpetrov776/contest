import { gsap } from 'gsap';

const DEFAULT_OFFSET = '30px';
const DEFAULT_DURATION = 0.8;
const INTERSECTION_THRESHOLD = 0.1;
const INITIAL_OPACITY = 0;
const FINAL_OPACITY = 1;
const FINAL_Y_POSITION = 0;
const EASE_TYPE = 'power2.out';

function initElementAnimation() {
  // Находим все элементы с data-атрибутом для анимации
  const elements = document.querySelectorAll('[data-animate-element]');

  if (elements.length === 0) {
    return;
  }

  // Создаем Intersection Observer для отслеживания появления элементов в viewport
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: INTERSECTION_THRESHOLD,
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const element = entry.target;

        // Парсим значение из data-атрибута (формат: "translateY,duration" или просто "translateY")
        const attrValue = element.dataset.animateElement || DEFAULT_OFFSET;
        const parts = attrValue.split(',').map((part) => part.trim());
        const translateYValue = parts[0] || DEFAULT_OFFSET;
        const duration = parts[1] ? Number.parseFloat(parts[1]) : DEFAULT_DURATION;

        // Устанавливаем начальное состояние
        gsap.set(element, {
          opacity: INITIAL_OPACITY,
          y: translateYValue,
        });

        // Анимируем элемент
        gsap.to(element, {
          opacity: FINAL_OPACITY,
          y: FINAL_Y_POSITION,
          duration,
          ease: EASE_TYPE,
        });

        // Отключаем наблюдение после первой анимации
        observer.unobserve(element);
      }
    });
  }, observerOptions);

  // Начинаем наблюдение за всеми элементами
  elements.forEach((element) => {
    observer.observe(element);
  });
}

// Запускаем анимацию после загрузки DOM
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initElementAnimation);
} else {
  initElementAnimation();
}

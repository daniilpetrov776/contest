import { gsap } from 'gsap';

const DEFAULT_DURATION = 0.8;
const DEFAULT_OFFSET = '30px';
const INTERSECTION_THRESHOLD = 0.1;
const INITIAL_OPACITY = 0;
const FINAL_OPACITY = 1;
const FINAL_Y_POSITION = 0;
const STAGGER_DELAY = 0.1;
const EASE_TYPE = 'power2.out';

function initChildrenAnimation() {
  // Находим все контейнеры с data-атрибутом для анимации
  const containers = document.querySelectorAll('[data-animate-children]');

  if (containers.length === 0) {
    return;
  }

  // Создаем Intersection Observer для отслеживания появления контейнеров в viewport
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: INTERSECTION_THRESHOLD, // Срабатывает, когда 10% элемента видно
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const container = entry.target;
        const children = Array.from(container.children);

        if (children.length === 0) {
          return;
        }

        // Парсим значение из data-атрибута (формат: "translateY,duration" или просто "translateY")
        const attrValue = container.dataset.animateChildren || DEFAULT_OFFSET;
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

        // Отключаем наблюдение после первой анимации
        observer.unobserve(container);
      }
    });
  }, observerOptions);

  // Начинаем наблюдение за всеми контейнерами
  containers.forEach((container) => {
    observer.observe(container);
  });
}

// Запускаем анимацию после загрузки DOM
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initChildrenAnimation);
} else {
  initChildrenAnimation();
}

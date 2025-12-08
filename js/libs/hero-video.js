import { gsap } from 'gsap';

// Константы для размеров экрана
const EXPANDABLE_MIN_WIDTH = 376;
const DESKTOP_MIN_WIDTH = 1280;
const TABLET_MIN_WIDTH = 768;

// Константы для размеров видео
const DESKTOP_WIDTH_PX = 456;
const DESKTOP_HEIGHT_PX = 230;
const TABLET_WIDTH_PX = 416;
const TABLET_HEIGHT_PX = 212;
const MOBILE_WIDTH_PX = 225;
const MOBILE_HEIGHT_PX = 105;

// Константы для анимации
const MAX_WIDTH = 100;
const MAX_HEIGHT = 90;
const STEP_SIZE = 25;
const ANIMATION_DURATION_NORMAL = 1.6;
const ANIMATION_DURATION_FAST = 0.6;
const ANIMATION_DURATION_RESIZE = 0.3;
const ANIMATION_EASE = 'power2.out';
const SCROLL_PROGRESS_MULTIPLIER = 0.2;
const SCROLL_PROGRESS_MAX = 1;
const PERCENT_MULTIPLIER = 100;
const MAX_STEP_CALCULATION = 100;

// Константы для видео
const VIDEO_READY_STATE_MIN = 2;
const VIDEO_CURRENT_TIME_START = 0;
const VIDEO_TABINDEX_DISABLED = '-1';
const VIDEO_TABINDEX_ENABLED = '0';

// Константы для атрибутов
const ARIA_PRESSED_FALSE = 'false';
const ARIA_PRESSED_TRUE = 'true';

// Константы для обработки событий
const RESIZE_DEBOUNCE_DELAY = 100;

function initHeroVideo() {
  const heroVideo = document.querySelector('.hero__video');
  const mutedVideo = document.querySelector('.hero__video-element--muted');
  const soundVideo = document.querySelector('.hero__video-element--sound');

  if (!heroVideo || !mutedVideo || !soundVideo) {
    return;
  }

  let isPlayingWithSound = false;
  let isExpanded = false;
  let currentAnimation = null;

  // Функция для проверки, должно ли видео расширяться при скролле
  const checkIsDesktop = () => window.innerWidth >= EXPANDABLE_MIN_WIDTH;

  // Функция для обновления aria-label в зависимости от состояния
  const updateAriaLabel = () => {
    if (checkIsDesktop()) {
      if (isExpanded) {
        heroVideo.setAttribute('aria-label', 'Видео увеличено. Нажмите для уменьшения размера');
      } else {
        heroVideo.setAttribute('aria-label', 'Видео. Нажмите для увеличения размера и воспроизведения со звуком');
      }
    } else {
      if (isPlayingWithSound) {
        heroVideo.setAttribute('aria-label', 'Видео воспроизводится со звуком. Нажмите для паузы или возобновления');
      } else {
        heroVideo.setAttribute('aria-label', 'Видео. Нажмите для воспроизведения со звуком');
      }
    }
  };

  // Настраиваем доступность видео
  heroVideo.setAttribute('role', 'button');
  heroVideo.setAttribute('tabindex', VIDEO_TABINDEX_ENABLED);
  heroVideo.setAttribute('aria-pressed', ARIA_PRESSED_FALSE);
  updateAriaLabel();

  // Функция для получения минимальных размеров в зависимости от размера экрана
  const getMinSizes = () => {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    if (windowWidth >= DESKTOP_MIN_WIDTH) {
      return {
        width: (DESKTOP_WIDTH_PX / windowWidth) * PERCENT_MULTIPLIER,
        height: (DESKTOP_HEIGHT_PX / windowHeight) * PERCENT_MULTIPLIER,
      };
    } else if (windowWidth >= TABLET_MIN_WIDTH) {
      return {
        width: (TABLET_WIDTH_PX / windowWidth) * PERCENT_MULTIPLIER,
        height: (TABLET_HEIGHT_PX / windowHeight) * PERCENT_MULTIPLIER,
      };
    } else {
      return {
        width: (MOBILE_WIDTH_PX / windowWidth) * PERCENT_MULTIPLIER,
        height: (MOBILE_HEIGHT_PX / windowHeight) * PERCENT_MULTIPLIER,
      };
    }
  };

  // Функция для вычисления размеров на основе скролла
  const calculateSizesFromScroll = (scrollY, viewportHeight, useAggressiveProgress = false) => {
    const currentMinSizes = getMinSizes();
    const scrollProgress = useAggressiveProgress
      ? Math.min(scrollY / (viewportHeight * SCROLL_PROGRESS_MULTIPLIER), SCROLL_PROGRESS_MAX)
      : Math.min(scrollY / viewportHeight, SCROLL_PROGRESS_MAX);
    const stepPercent = Math.min(scrollProgress, SCROLL_PROGRESS_MAX);

    const widthRange = MAX_WIDTH - currentMinSizes.width;
    const heightRange = MAX_HEIGHT - currentMinSizes.height;
    let targetWidth = currentMinSizes.width + widthRange * stepPercent;
    let targetHeight = currentMinSizes.height + heightRange * stepPercent;

    // Ограничиваем минимальными и максимальными значениями
    targetWidth = Math.max(targetWidth, currentMinSizes.width);
    targetWidth = Math.min(targetWidth, MAX_WIDTH);
    targetHeight = Math.max(targetHeight, currentMinSizes.height);
    targetHeight = Math.min(targetHeight, MAX_HEIGHT);

    return { targetWidth, targetHeight };
  };

  const isDesktop = checkIsDesktop();

  // Устанавливаем начальные размеры только на десктопе
  if (isDesktop) {
    const { targetWidth, targetHeight } = calculateSizesFromScroll(
      window.scrollY,
      window.innerHeight,
    );

    // Устанавливаем начальные размеры через CSS переменные
    gsap.set(heroVideo, {
      '--video-width': `${targetWidth}%`,
      '--video-height': `${targetHeight}%`,
    });
  }

  // Обработчик скролла для изменения размера видео
  let lastScrollY = window.scrollY;
  let currentStep = 0;
  const MAX_STEP = Math.ceil(MAX_STEP_CALCULATION / STEP_SIZE);

  const handleScroll = () => {
    // Работает только на десктопе
    if (!checkIsDesktop()) {
      return;
    }

    // Если видео увеличено при клике - не обрабатываем скролл
    if (isExpanded) {
      return;
    }

    const currentScrollY = window.scrollY;

    if (currentScrollY === lastScrollY) {
      return;
    }

    const viewportHeight = window.innerHeight;
    // Используем более агрессивное вычисление прогресса для быстрого раскрытия
    const scrollProgress = Math.min(
      currentScrollY / (viewportHeight * SCROLL_PROGRESS_MULTIPLIER),
      SCROLL_PROGRESS_MAX,
    );
    const newStep = Math.floor(scrollProgress * MAX_STEP);
    const clampedStep = Math.min(newStep, MAX_STEP);

    if (clampedStep !== currentStep) {
      currentStep = clampedStep;

      // Вычисляем процент прогресса от 0 до 1
      const stepPercent = clampedStep / MAX_STEP;
      const currentMinSizes = getMinSizes();
      const widthRange = MAX_WIDTH - currentMinSizes.width;
      const heightRange = MAX_HEIGHT - currentMinSizes.height;
      let targetWidth = currentMinSizes.width + widthRange * stepPercent;
      let targetHeight = currentMinSizes.height + heightRange * stepPercent;

      // Ограничиваем минимальными и максимальными значениями
      targetWidth = Math.max(targetWidth, currentMinSizes.width);
      targetWidth = Math.min(targetWidth, MAX_WIDTH);
      targetHeight = Math.max(targetHeight, currentMinSizes.height);
      targetHeight = Math.min(targetHeight, MAX_HEIGHT);

      if (currentAnimation) {
        currentAnimation.kill();
      }

      currentAnimation = gsap.to(heroVideo, {
        '--video-width': `${targetWidth}%`,
        '--video-height': `${targetHeight}%`,
        'duration': ANIMATION_DURATION_NORMAL,
        'ease': ANIMATION_EASE,
        'onComplete': () => {
          currentAnimation = null;
        },
      });
    }

    lastScrollY = currentScrollY;
  };

  const handleVideoClick = (e) => {
    // Предотвращаем стандартное поведение для клавиатуры
    if (e.type === 'keydown' && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
    }

    // Предотвращаем всплытие события от самого видео элемента
    if (e.target === mutedVideo || e.target === soundVideo) {
      e.stopPropagation();
    }

    // Работает только на десктопе
    if (!checkIsDesktop()) {
      // На планшете и мобилке просто переключаем звук без изменения размера
      if (!isPlayingWithSound) {
        isPlayingWithSound = true;

        // Останавливаем muted видео
        if (!mutedVideo.paused) {
          mutedVideo.pause();
        }
        mutedVideo.style.display = 'none';

        // Показываем и настраиваем видео со звуком
        soundVideo.style.display = 'block';
        soundVideo.currentTime = 0;
        soundVideo.muted = false;

        // Ждем готовности видео перед воспроизведением
        const playSoundVideo = () => {
          // Используем requestAnimationFrame для гарантии, что pause() завершен
          requestAnimationFrame(() => {
            if (soundVideo.readyState >= VIDEO_READY_STATE_MIN) {
              soundVideo.play().catch(() => {
                // Игнорируем ошибки воспроизведения видео
              });
            } else {
              soundVideo.addEventListener('loadeddata', playSoundVideo, { once: true });
            }
          });
        };

        playSoundVideo();
      } else {
        if (!soundVideo.paused) {
          soundVideo.pause();
        } else {
          // Проверяем готовность перед воспроизведением
          requestAnimationFrame(() => {
            if (soundVideo.readyState >= VIDEO_READY_STATE_MIN) {
              soundVideo.play().catch(() => {
                // Игнорируем ошибки воспроизведения видео
              });
            } else {
              soundVideo.addEventListener('loadeddata', () => {
                soundVideo.play().catch(() => {
                  // Игнорируем ошибки воспроизведения видео
                });
              }, { once: true });
            }
          });
        }
      }
      updateAriaLabel();
      return;
    }

    // Если видео увеличено - уменьшаем и управляем воспроизведением
    if (isExpanded) {
      // Уменьшаем видео
      isExpanded = false;
      heroVideo.setAttribute('aria-pressed', ARIA_PRESSED_FALSE);
      updateAriaLabel();

      if (currentAnimation) {
        currentAnimation.kill();
      }

      // Возвращаем к размеру на основе текущего скролла
      const { targetWidth, targetHeight } = calculateSizesFromScroll(
        window.scrollY,
        window.innerHeight,
      );

      currentAnimation = gsap.to(heroVideo, {
        '--video-width': `${targetWidth}%`,
        '--video-height': `${targetHeight}%`,
        'duration': ANIMATION_DURATION_FAST,
        'ease': ANIMATION_EASE,
        'onComplete': () => {
          currentAnimation = null;
        },
      });

      // Если видео со звуком уже активно - ставим на паузу/возобновляем
      if (isPlayingWithSound) {
        if (!soundVideo.paused) {
          soundVideo.pause();
        } else {
          soundVideo.play().catch(() => {
            // Игнорируем ошибки воспроизведения видео
          });
        }
      }
      return;
    }

    // Увеличиваем видео до максимума
    isExpanded = true;
    heroVideo.setAttribute('aria-pressed', ARIA_PRESSED_TRUE);
    updateAriaLabel();

    if (currentAnimation) {
      currentAnimation.kill();
    }

    currentAnimation = gsap.to(heroVideo, {
      '--video-width': `${MAX_WIDTH}%`,
      '--video-height': `${MAX_HEIGHT}%`,
      'duration': ANIMATION_DURATION_FAST,
      'ease': ANIMATION_EASE,
      'onComplete': () => {
        currentAnimation = null;
      },
    });

    // Если видео со звуком еще не активно - переключаем на него
    if (!isPlayingWithSound) {
      isPlayingWithSound = true;

      // Останавливаем и скрываем видео без звука
      mutedVideo.pause();
      mutedVideo.style.display = 'none';

      // Показываем и запускаем видео со звуком с начала
      soundVideo.style.display = 'block';
      soundVideo.currentTime = VIDEO_CURRENT_TIME_START;
      soundVideo.muted = false;
      soundVideo.play().catch(() => {
        // Игнорируем ошибки воспроизведения видео
      });
    } else {
      // Если уже активно - ставим на паузу/возобновляем
      if (!soundVideo.paused) {
        soundVideo.pause();
      } else {
        soundVideo.play().catch(() => {
          // Игнорируем ошибки воспроизведения видео
        });
      }
    }
  };

  // Добавляем обработчик клика на контейнер видео
  heroVideo.addEventListener('click', handleVideoClick);

  // Обработчик клавиатуры для доступности
  heroVideo.addEventListener('keydown', handleVideoClick);

  // Также добавляем обработчик на сами видео элементы
  mutedVideo.addEventListener('click', handleVideoClick);
  soundVideo.addEventListener('click', handleVideoClick);

  // Делаем видео элементы недоступными через табуляцию (доступ через контейнер)
  mutedVideo.setAttribute('tabindex', VIDEO_TABINDEX_DISABLED);
  soundVideo.setAttribute('tabindex', VIDEO_TABINDEX_DISABLED);

  // Добавляем обработчик скролла с оптимизацией через requestAnimationFrame
  let scrollTimeout;
  window.addEventListener('scroll', () => {
    if (scrollTimeout) {
      cancelAnimationFrame(scrollTimeout);
    }
    scrollTimeout = requestAnimationFrame(handleScroll);
  });

  // Обработчик изменения размера окна для пересчета минимальных размеров
  let resizeTimeout;
  window.addEventListener('resize', () => {
    // Работает только на десктопе
    if (!checkIsDesktop()) {
      return;
    }

    if (resizeTimeout) {
      clearTimeout(resizeTimeout);
    }
    resizeTimeout = setTimeout(() => {
      // Если видео не увеличено, обновляем размер на основе текущего скролла
      if (!isExpanded) {
        const { targetWidth, targetHeight } = calculateSizesFromScroll(
          window.scrollY,
          window.innerHeight,
        );

        if (currentAnimation) {
          currentAnimation.kill();
        }

        currentAnimation = gsap.to(heroVideo, {
          '--video-width': `${targetWidth}%`,
          '--video-height': `${targetHeight}%`,
          'duration': ANIMATION_DURATION_RESIZE,
          'ease': ANIMATION_EASE,
          'onComplete': () => {
            currentAnimation = null;
          },
        });
      }
    }, RESIZE_DEBOUNCE_DELAY);
  });
}

// Запускаем инициализацию после загрузки DOM
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initHeroVideo);
} else {
  initHeroVideo();
}

import { gsap } from 'gsap';
import { EASE_TYPE } from '../animation-constants.js';
import {
  VIDEO_READY_STATE_MIN,
  VIDEO_CURRENT_TIME_START,
  VIDEO_TABINDEX_DISABLED,
  VIDEO_TABINDEX_ENABLED,
  ARIA_PRESSED_FALSE,
  ARIA_PRESSED_TRUE,
  ANIMATION_DURATION_FAST,
  MAX_WIDTH,
  MAX_HEIGHT,
  TABLET_MIN_WIDTH,
} from './constants.js';
import { checkIsDesktop, calculateSizesFromScroll } from './video-utils.js';
import { getMobileTopValues } from './scroll-handler.js';

/**
 * Получает правильную ширину viewport
 * В адаптивном режиме браузера window.innerWidth может возвращать реальную ширину окна
 * @returns {number}
 */
const getViewportWidth = () => {
  // Используем visualViewport если доступен (более точный для эмуляторов)
  if (window.visualViewport && window.visualViewport.width) {
    return window.visualViewport.width;
  }
  // Иначе используем clientWidth, который более точно отражает размер viewport
  return document.documentElement.clientWidth || window.innerWidth;
};

/**
 * Получает начальное значение top для мобильных/планшетов
 * @returns {number|null}
 */
const getInitialMobileTop = () => {
  const windowWidth = getViewportWidth();

  // Для 375px и меньше используем 178px
  if (windowWidth <= 375.5) {
    return 178;
  } else if (windowWidth <= TABLET_MIN_WIDTH) {
    // Интерполяция от 240px (768px) до 178px (375px)
    const startSize = 240;
    const minSize = 178;
    const widthFrom = 768;
    const widthTo = 375;

    const value = minSize + (startSize - minSize) * (windowWidth - widthTo) / (widthFrom - widthTo);
    return Math.round(value);
  }

  return null;
};

/**
 * Получает начальное значение height для мобильных/планшетов
 * @returns {number|null}
 */
const getInitialMobileHeight = () => {
  const windowWidth = getViewportWidth();

  if (windowWidth <= 375.5) {
    return 135;
  } else if (windowWidth <= TABLET_MIN_WIDTH) {
    // Интерполируем от 226px (768px) до 135px (375px)
    const startSize = 226;
    const minSize = 135;
    const widthFrom = 768;
    const widthTo = 375;

    const value = minSize + (startSize - minSize) * (windowWidth - widthTo) / (widthFrom - widthTo);
    return Math.round(value);
  }

  return null;
};

/**
 * Получает финальные размеры видео в пикселях для мобильных/планшетов
 * @returns {object} - Объект с width и height в пикселях
 */
const getMobileFinalSizes = () => {
  const topValues = getMobileTopValues();

  if (!topValues) {
    return null;
  }

  const windowWidth = getViewportWidth();

  // Ширина всегда 100% viewport (в пикселях)
  return {
    width: windowWidth,
    height: topValues.finalHeight,
  };
};

/**
 * Обновляет aria-label в зависимости от состояния
 * @param {HTMLElement} heroVideo - Элемент видео
 * @param {boolean} isExpanded - Видео увеличено
 * @param {boolean} isPlayingWithSound - Видео воспроизводится со звуком
 */
export function updateAriaLabel(heroVideo, isExpanded, isPlayingWithSound) {
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
}

/**
 * Инициализирует доступность видео
 * @param {HTMLElement} heroVideo - Элемент видео
 * @param {HTMLElement} mutedVideo - Видео без звука
 * @param {HTMLElement} soundVideo - Видео со звуком
 * @param {boolean} isExpanded - Видео увеличено
 * @param {boolean} isPlayingWithSound - Видео воспроизводится со звуком
 */
export function initVideoAccessibility(heroVideo, mutedVideo, soundVideo, isExpanded, isPlayingWithSound) {
  // Настраиваем доступность видео
  heroVideo.setAttribute('role', 'button');
  heroVideo.setAttribute('tabindex', VIDEO_TABINDEX_ENABLED);
  heroVideo.setAttribute('aria-pressed', ARIA_PRESSED_FALSE);
  updateAriaLabel(heroVideo, isExpanded, isPlayingWithSound);

  // Делаем видео элементы недоступными через табуляцию (доступ через контейнер)
  mutedVideo.setAttribute('tabindex', VIDEO_TABINDEX_DISABLED);
  soundVideo.setAttribute('tabindex', VIDEO_TABINDEX_DISABLED);
}

/**
 * Воспроизводит видео со звуком
 * @param {HTMLElement} soundVideo - Видео со звуком
 */
function playSoundVideo(soundVideo) {
  // Загружаем видео, если оно еще не загружено (preload="none")
  if (soundVideo.readyState < VIDEO_READY_STATE_MIN) {
    soundVideo.load();
  }

  // Используем requestAnimationFrame для гарантии, что pause() завершен
  requestAnimationFrame(() => {
    if (soundVideo.readyState >= VIDEO_READY_STATE_MIN) {
      soundVideo.play().catch(() => {
        // Игнорируем ошибки воспроизведения видео
      });
    } else {
      // Ждем загрузки данных перед воспроизведением
      soundVideo.addEventListener('loadeddata', () => {
        soundVideo.play().catch(() => {
          // Игнорируем ошибки воспроизведения видео
        });
      }, { once: true });
    }
  });
}

/**
 * Обрабатывает клик по видео
 * @param {Event} e - Событие клика
 * @param {HTMLElement} heroVideo - Элемент видео
 * @param {HTMLElement} mutedVideo - Видео без звука
 * @param {HTMLElement} soundVideo - Видео со звуком
 * @param {object} state - Состояние (isPlayingWithSound, isExpanded, currentAnimation)
 * @param {Function} setState - Функция для обновления состояния
 */
export function handleVideoClick(e, heroVideo, mutedVideo, soundVideo, state, setState) {
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
    // На планшете и мобилке при клике расширяем до финальных размеров в пикселях
    // и переключаем звук
    if (state.isExpanded) {
      // Если уже расширено - возвращаем к начальным размерам
      setState({ isExpanded: false });

      const initialTop = getInitialMobileTop();
      const initialHeight = getInitialMobileHeight();
      const windowWidth = getViewportWidth();

      if (initialTop !== null && initialHeight !== null) {
        // Получаем начальную ширину из min-width
        const computedStyle = window.getComputedStyle(heroVideo);
        const minWidth = parseFloat(computedStyle.minWidth) || (windowWidth <= 375.5 ? 225 : 416);

        if (state.currentAnimation) {
          state.currentAnimation.kill();
        }

        const newAnimation = gsap.to(heroVideo, {
          '--video-top': `${initialTop}px`,
          '--video-height': `${initialHeight}px`,
          '--video-width': `${minWidth}px`,
          'duration': ANIMATION_DURATION_FAST,
          'ease': EASE_TYPE,
          'onComplete': () => {
            setState({ currentAnimation: null });
          },
        });

        setState({ currentAnimation: newAnimation });
      }
    } else {
      // Расширяем до финальных размеров
      const finalSizes = getMobileFinalSizes();

      if (finalSizes) {
        setState({ isExpanded: true });

        const topValues = getMobileTopValues();
        const finalTop = topValues ? topValues.finalTop : 120;

        if (state.currentAnimation) {
          state.currentAnimation.kill();
        }

        const newAnimation = gsap.to(heroVideo, {
          '--video-top': `${finalTop}px`,
          '--video-height': `${finalSizes.height}px`,
          '--video-width': `${finalSizes.width}px`,
          'duration': ANIMATION_DURATION_FAST,
          'ease': EASE_TYPE,
          'onComplete': () => {
            setState({ currentAnimation: null });
          },
        });

        setState({ currentAnimation: newAnimation });
      }
    }

    // Переключаем звук
    if (!state.isPlayingWithSound) {
      setState({ isPlayingWithSound: true });

      // Останавливаем muted видео
      if (!mutedVideo.paused) {
        mutedVideo.pause();
      }
      mutedVideo.style.display = 'none';

      // Показываем видео со звуком перед загрузкой и воспроизведением
      soundVideo.style.display = 'block';
      soundVideo.currentTime = 0;
      soundVideo.muted = false;

      // Загружаем видео перед воспроизведением (если preload="none")
      // Важно: загружаем после того, как видео стало видимым
      if (soundVideo.readyState < VIDEO_READY_STATE_MIN) {
        soundVideo.load();
        // Ждем загрузки данных перед воспроизведением
        soundVideo.addEventListener('loadeddata', () => {
          playSoundVideo(soundVideo);
        }, { once: true });
      } else {
        // Если уже загружено - сразу воспроизводим
        playSoundVideo(soundVideo);
      }
    } else {
      if (!soundVideo.paused) {
        soundVideo.pause();
      } else {
        // Загружаем видео перед воспроизведением (если preload="none")
        if (soundVideo.readyState < VIDEO_READY_STATE_MIN) {
          soundVideo.load();
        }

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
    updateAriaLabel(heroVideo, state.isExpanded, !state.isPlayingWithSound ? true : state.isPlayingWithSound);
    return;
  }

  // Если видео увеличено - уменьшаем и управляем воспроизведением
  if (state.isExpanded) {
    // Уменьшаем видео
    setState({ isExpanded: false });
    heroVideo.setAttribute('aria-pressed', ARIA_PRESSED_FALSE);
    updateAriaLabel(heroVideo, false, state.isPlayingWithSound);

    if (state.currentAnimation) {
      state.currentAnimation.kill();
    }

    // Возвращаем к размеру на основе текущего скролла
    const { targetWidth, targetHeight } = calculateSizesFromScroll(
      window.scrollY,
      window.innerHeight,
    );

    const newAnimation = gsap.to(heroVideo, {
      '--video-width': `${targetWidth}%`,
      '--video-height': `${targetHeight}%`,
      'duration': ANIMATION_DURATION_FAST,
      'ease': EASE_TYPE,
      'onComplete': () => {
        setState({ currentAnimation: null });
      },
    });

    setState({ currentAnimation: newAnimation });

    // Если видео со звуком уже активно - ставим на паузу/возобновляем
    if (state.isPlayingWithSound) {
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
  setState({ isExpanded: true });
  heroVideo.setAttribute('aria-pressed', ARIA_PRESSED_TRUE);
  updateAriaLabel(heroVideo, true, state.isPlayingWithSound);

  if (state.currentAnimation) {
    state.currentAnimation.kill();
  }

  const newAnimation = gsap.to(heroVideo, {
    '--video-width': `${MAX_WIDTH}%`,
    '--video-height': `${MAX_HEIGHT}%`,
    'duration': ANIMATION_DURATION_FAST,
    'ease': EASE_TYPE,
    'onComplete': () => {
      setState({ currentAnimation: null });
    },
  });

  setState({ currentAnimation: newAnimation });

  // Если видео со звуком еще не активно - переключаем на него
  if (!state.isPlayingWithSound) {
    setState({ isPlayingWithSound: true });

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
}

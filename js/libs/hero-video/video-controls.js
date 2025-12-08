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
} from './constants.js';
import { checkIsDesktop, calculateSizesFromScroll } from './video-utils.js';

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
    // На планшете и мобилке просто переключаем звук без изменения размера
    if (!state.isPlayingWithSound) {
      setState({ isPlayingWithSound: true });

      // Останавливаем muted видео
      if (!mutedVideo.paused) {
        mutedVideo.pause();
      }
      mutedVideo.style.display = 'none';

      // Показываем и настраиваем видео со звуком
      soundVideo.style.display = 'block';
      soundVideo.currentTime = 0;
      soundVideo.muted = false;

      playSoundVideo(soundVideo);
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

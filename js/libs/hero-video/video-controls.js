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
  MOBILE_MAX_WIDTH_THRESHOLD,
  MOBILE_WIDTH_PX,
  TABLET_WIDTH_PX,
  MOBILE_FINAL_TOP,
  KEY_ENTER,
  KEY_SPACE,
} from './constants.js';
import {
  checkIsDesktop,
  calculateSizesFromScroll,
  getViewportWidth,
  getInitialMobileTop,
  getInitialMobileHeight,
  createVideoAnimation,
} from './video-utils.js';
import { getMobileTopValues } from './scroll-handler.js';


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
 * Безопасно воспроизводит видео с централизованной обработкой ошибок
 * @param {HTMLVideoElement} video - Видео элемент для воспроизведения
 */
function safePlayVideo(video) {
  video.play().catch(() => {
    // Игнорируем ошибки воспроизведения видео
  });
}

/**
 * Воспроизводит видео со звуком с проверкой готовности
 * Обрабатывает все случаи: загрузка, ожидание готовности, воспроизведение
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
      safePlayVideo(soundVideo);
    } else {
      // Ждем загрузки данных перед воспроизведением
      soundVideo.addEventListener('loadeddata', () => {
        safePlayVideo(soundVideo);
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
  if (e.type === 'keydown' && (e.key === KEY_ENTER || e.key === KEY_SPACE)) {
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
        const minWidth = parseFloat(computedStyle.minWidth) || (windowWidth <= MOBILE_MAX_WIDTH_THRESHOLD ? MOBILE_WIDTH_PX : TABLET_WIDTH_PX);

        createVideoAnimation(
          heroVideo,
          {
            '--video-top': `${initialTop}px`,
            '--video-height': `${initialHeight}px`,
            '--video-width': `${minWidth}px`,
          },
          ANIMATION_DURATION_FAST,
          setState,
          state.currentAnimation,
        );
      }
    } else {
      // Расширяем до финальных размеров
      const finalSizes = getMobileFinalSizes();

      if (finalSizes) {
        setState({ isExpanded: true });

        const topValues = getMobileTopValues();
        const finalTop = topValues ? topValues.finalTop : MOBILE_FINAL_TOP;

        createVideoAnimation(
          heroVideo,
          {
            '--video-top': `${finalTop}px`,
            '--video-height': `${finalSizes.height}px`,
            '--video-width': `${finalSizes.width}px`,
          },
          ANIMATION_DURATION_FAST,
          setState,
          state.currentAnimation,
        );
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

        // Используем playSoundVideo для обработки всех случаев
        playSoundVideo(soundVideo);
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


    // Возвращаем к размеру на основе текущего скролла
    const { targetWidth, targetHeight } = calculateSizesFromScroll(
      window.scrollY,
      window.innerHeight,
    );

    createVideoAnimation(
      heroVideo,
      {
        '--video-width': `${targetWidth}%`,
        '--video-height': `${targetHeight}%`,
      },
      ANIMATION_DURATION_FAST,
      setState,
      state.currentAnimation,
    );

    // Если видео со звуком уже активно - ставим на паузу/возобновляем
    if (state.isPlayingWithSound) {
      if (!soundVideo.paused) {
        soundVideo.pause();
      } else {
        safePlayVideo(soundVideo);
      }
    }
    return;
  }

  // Увеличиваем видео до максимума
  setState({ isExpanded: true });
  heroVideo.setAttribute('aria-pressed', ARIA_PRESSED_TRUE);
  updateAriaLabel(heroVideo, true, state.isPlayingWithSound);

  createVideoAnimation(
    heroVideo,
    {
      '--video-width': `${MAX_WIDTH}%`,
      '--video-height': `${MAX_HEIGHT}%`,
    },
    ANIMATION_DURATION_FAST,
    setState,
    state.currentAnimation,
  );

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
    safePlayVideo(soundVideo);
  } else {
    // Если уже активно - ставим на паузу/возобновляем
    if (!soundVideo.paused) {
      soundVideo.pause();
    } else {
      safePlayVideo(soundVideo);
    }
  }
}

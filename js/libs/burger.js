import { gsap } from 'gsap';
import { EASE_TYPE, EASING_HIDE } from './animation-constants.js';

// Константы для анимации меню
const ANIMATION_DURATION = 700;
const CLOSE_ANIMATION_DURATION = 600;
const OPEN_OPACITY_DURATION = 0.2;
const CLOSE_OPACITY_DURATION = 0.4;
const ITEM_MOVE_DURATION_OPEN = 0.6;
const ITEM_MOVE_DURATION_CLOSE = 0.4;

// Константы для stagger анимации
const OPEN_LINKS_STAGGER = 0.1;
const CLOSE_LINKS_STAGGER = 0.05;
const ITEM_TIMELINE_STAGGER = 0.05;

// Константы для позиционирования элементов
const INITIAL_X_OFFSET = 30;
const X_OFFSET_STEP = 10;
const FINAL_X_POSITION = 0;
const TIMELINE_START_POSITION = 0.1;

// Константы для задержек
const MENU_OPEN_DELAY = 0;
const IS_OPEN_CLASS_DELAY = 100;
const IS_SCROLLABLE_CLASS_DELAY = 500;

// Константы для easing (используем общие)
const EASING_OPEN = EASE_TYPE;
const EASING_CLOSE = EASING_HIDE;

// Константы для клавиатуры
const ESCAPE_KEY = 'Escape';

// Константы для breakpoints
const DESKTOP_BREAKPOINT = 1440; // Меню скрыто на >= 1440px
const TABLET_BREAKPOINT = 1280; // Toggle видим только на < 1280px

const toggleButton = document.querySelector('[data-burger-toggle]');
const headerMenu = document.querySelector('.header__header-menu');
const body = document.body;

let isAnimating = false;
let menuAnimation = null;
let resizeTimeout = null;

function animateMenuItems(isOpening) {
  const menuItems = document.querySelectorAll('.header-menu__menu-item');

  if (!menuItems.length) {
    return;
  }

  if (menuAnimation) {
    menuAnimation.kill();
  }

  if (isOpening) {
    gsap.set(menuItems, { clearProps: 'transform' });
    const menuLinks = document.querySelectorAll('.header-menu__menu-link');
    gsap.set(menuLinks, {
      opacity: 0,
    });
    const openTimeline = gsap.timeline();

    // Сначала меняем opacity ссылок
    openTimeline.to(menuLinks, {
      opacity: 1,
      duration: OPEN_OPACITY_DURATION,
      stagger: OPEN_LINKS_STAGGER,
      ease: EASING_OPEN,
    });

    // Затем сдвигаем элементы к 0 с задержкой после начала opacity, используя fromTo для явного указания начальных значений
    menuItems.forEach((item, index) => {
      openTimeline.fromTo(
        item,
        {
          x: INITIAL_X_OFFSET + index * X_OFFSET_STEP,
          force3D: true,
        },
        {
          x: FINAL_X_POSITION,
          duration: ITEM_MOVE_DURATION_OPEN,
          ease: EASING_OPEN,
          force3D: true,
        },
        TIMELINE_START_POSITION + index * ITEM_TIMELINE_STAGGER,
      );
    });

    menuAnimation = openTimeline;
  } else {
    // Анимация скрытия (обратная) - возвращаем к начальным значениям
    const closeTimeline = gsap.timeline();

    // Получаем ссылки для анимации opacity
    const menuLinks = document.querySelectorAll('.header-menu__menu-link');

    // Скрываем ссылки
    closeTimeline.to(menuLinks, {
      opacity: 0,
      duration: CLOSE_OPACITY_DURATION,
      stagger: CLOSE_LINKS_STAGGER,
      ease: EASING_CLOSE,
    });

    // Сдвигаем элементы обратно
    menuItems.forEach((item, index) => {
      closeTimeline.to(
        item,
        {
          x: INITIAL_X_OFFSET + index * X_OFFSET_STEP,
          duration: ITEM_MOVE_DURATION_CLOSE,
          ease: EASING_CLOSE,
          force3D: true,
        },
        index * ITEM_TIMELINE_STAGGER,
      );
    });

    menuAnimation = closeTimeline;
  }
}

const manageTabindex = () => {
  const menuLinks = document.querySelectorAll('.header-menu__menu-link');
  const isDesktop = window.innerWidth >= DESKTOP_BREAKPOINT;
  const isTabletOrMobile = window.innerWidth < TABLET_BREAKPOINT;
  const isMenuOpen = headerMenu && headerMenu.classList.contains('is-open');

  if (isDesktop) {
    // На десктопе (>= 1440px): скрываем от фокуса меню и toggle
    menuLinks.forEach((link) => {
      link.setAttribute('tabindex', '-1');
    });
    if (toggleButton) {
      toggleButton.setAttribute('tabindex', '-1');
    }
  } else {
    // На ширине < 1440px: управляем toggle и меню
    // Toggle доступен для фокуса только на ширине < 1280px (где он видим)
    if (toggleButton) {
      toggleButton.setAttribute('tabindex', isTabletOrMobile ? '0' : '-1');
    }
    menuLinks.forEach((link) => {
      // Меню доступно для фокуса только когда открыто
      link.setAttribute('tabindex', isMenuOpen ? '0' : '-1');
    });
  }
};

const handleResize = () => {
  // Debounce для оптимизации производительности
  if (resizeTimeout) {
    clearTimeout(resizeTimeout);
  }
  resizeTimeout = setTimeout(() => {
    manageTabindex();
  }, 150);
};

function closeMenu() {
  if (isAnimating || !toggleButton.classList.contains('is-active')) {
    return;
  }

  isAnimating = true;

  // Анимация скрытия элементов меню
  animateMenuItems(false);

  toggleButton.classList.remove('is-active');
  body.classList.remove('lock');

  if (headerMenu) {
    headerMenu.classList.remove('is-open');
    headerMenu.classList.remove('is-scrollable');
  }

  // Управляем tabindex после закрытия меню
  manageTabindex();

  setTimeout(() => {
    isAnimating = false;
  }, CLOSE_ANIMATION_DURATION);
}

function openMenu() {
  if (isAnimating || toggleButton.classList.contains('is-active')) {
    return;
  }

  isAnimating = true;
  toggleButton.classList.add('is-active');
  body.classList.add('lock');

  if (headerMenu) {
    setTimeout(() => {
      headerMenu.classList.add('is-open');
      // Управляем tabindex после открытия меню
      manageTabindex();
      // Запускаем анимацию элементов меню после открытия
      setTimeout(() => {
        animateMenuItems(true);
      }, MENU_OPEN_DELAY);
    }, IS_OPEN_CLASS_DELAY);
    setTimeout(() => {
      headerMenu.classList.add('is-scrollable');
    }, IS_SCROLLABLE_CLASS_DELAY);
  }

  setTimeout(() => {
    isAnimating = false;
  }, ANIMATION_DURATION);
}

// Инициализация управления tabindex
if (toggleButton || headerMenu) {
  // Устанавливаем начальное состояние tabindex
  manageTabindex();

  // Обработчик изменения размера окна
  window.addEventListener('resize', handleResize);
}

if (toggleButton) {
  toggleButton.addEventListener('click', () => {
    if (isAnimating) {
      return;
    }

    const isActive = toggleButton.classList.contains('is-active');

    if (isActive) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  // Закрытие меню по ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === ESCAPE_KEY && toggleButton.classList.contains('is-active')) {
      closeMenu();
    }
  });
}

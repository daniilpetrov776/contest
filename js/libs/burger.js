import { gsap } from 'gsap'

const toggleButton = document.querySelector('[data-burger-toggle]')
const headerMenu = document.querySelector('.header__header-menu')
const body = document.body

let isAnimating = false
const ANIMATION_DURATION = 700
let menuAnimation = null
const DESKTOP_MIN_WIDTH = 1280

/**
 * Обновляет доступность кнопки бургер-меню
 */
function updateToggleButtonAccessibility() {
    if (!toggleButton) {
        return
    }

    const isDesktop = window.innerWidth >= DESKTOP_MIN_WIDTH

    if (isDesktop) {
        // На десктопе делаем кнопку недоступной
        toggleButton.setAttribute('tabindex', '-1')
        toggleButton.setAttribute('aria-hidden', 'true')
        toggleButton.style.pointerEvents = 'none'
    } else {
        // На планшете/мобилке делаем доступной
        toggleButton.setAttribute('tabindex', '0')
        toggleButton.removeAttribute('aria-hidden')
        toggleButton.style.pointerEvents = 'auto'
    }
}

/**
 * Обновляет доступность ссылок в меню
 */
function updateMenuLinksAccessibility() {
    const menuLinks = document.querySelectorAll('.header-menu__menu-link')
    
    if (!menuLinks.length || !headerMenu) {
        return
    }

    const isDesktop = window.innerWidth >= DESKTOP_MIN_WIDTH
    const isMenuOpen = headerMenu.classList.contains('is-open')
    // Проверяем видимость меню через computed style
    const menuStyle = window.getComputedStyle(headerMenu)
    const isMenuVisible = menuStyle.display !== 'none' && menuStyle.height !== '0px'

    menuLinks.forEach((link) => {
        // На десктопе или когда меню закрыто/невидимо - делаем недоступными
        if (isDesktop || !isMenuOpen || !isMenuVisible) {
            link.setAttribute('tabindex', '-1')
            // Также скрываем визуально для screen readers
            link.setAttribute('aria-hidden', 'true')
        } else {
            // Когда меню открыто на планшете/мобилке - делаем доступными
            link.setAttribute('tabindex', '0')
            link.removeAttribute('aria-hidden')
        }
    })
}

function animateMenuItems(isOpening) {
    const menuItems = document.querySelectorAll('.header-menu__menu-item')

    if (!menuItems.length) {
        return
    }

    if (menuAnimation) {
        menuAnimation.kill()
    }

    if (isOpening) {
        gsap.set(menuItems, { clearProps: 'transform' })
        const menuLinks = document.querySelectorAll('.header-menu__menu-link')
        gsap.set(menuLinks, {
            opacity: 0,
        })
        const openTimeline = gsap.timeline()

        // Сначала меняем opacity ссылок
        openTimeline.to(menuLinks, {
            opacity: 1,
            duration: 0.6,
            stagger: 0.1, // задержка между элементами
            ease: 'power2.out',
        })

        // Затем сдвигаем элементы к 0 с задержкой после начала opacity, используя fromTo для явного указания начальных значений
        menuItems.forEach((item, index) => {
            openTimeline.fromTo(
                item,
                {
                    x: 30 + index * 10, // Начальное значение сдвига
                    force3D: true,
                },
                {
                    x: 0, // Конечное значение
                    duration: 0.6,
                    ease: 'power2.out',
                    force3D: true,
                },
                0.1 + index * 0.05 // Позиция в timeline (задержка после начала opacity + stagger)
            )
        })

        menuAnimation = openTimeline
    } else {
        // Анимация скрытия (обратная) - возвращаем к начальным значениям
        const closeTimeline = gsap.timeline()

        // Получаем ссылки для анимации opacity
        const menuLinks = document.querySelectorAll('.header-menu__menu-link')

        // Скрываем ссылки
        closeTimeline.to(menuLinks, {
            opacity: 0,
            duration: 0.4,
            stagger: 0.05,
            ease: 'power2.in',
        })

        // Сдвигаем элементы обратно
        menuItems.forEach((item, index) => {
            closeTimeline.to(
                item,
                {
                    x: 30 + index * 10, // Возвращаем к начальным значениям
                    duration: 0.4,
                    ease: 'power2.in',
                    force3D: true,
                },
                index * 0.05 // stagger через timeline
            )
        })

        menuAnimation = closeTimeline
    }
}

function closeMenu() {
    if (isAnimating || !toggleButton.classList.contains('is-active')) {
        return
    }

    isAnimating = true

    // Анимация скрытия элементов меню
    animateMenuItems(false)

    toggleButton.classList.remove('is-active')
    body.classList.remove('lock')

    if (headerMenu) {
        headerMenu.classList.remove('is-open')
        headerMenu.classList.remove('is-scrollable')
        // Обновляем доступность сразу после удаления класса
        updateMenuLinksAccessibility()
    }

    // Обновляем доступность ссылок
    updateMenuLinksAccessibility()

    setTimeout(() => {
        isAnimating = false
    }, 600) // Длительность анимации закрытия
}

function openMenu() {
    if (isAnimating || toggleButton.classList.contains('is-active')) {
        return
    }

    isAnimating = true
    toggleButton.classList.add('is-active')
    body.classList.add('lock')

    if (headerMenu) {
        setTimeout(() => {
            headerMenu.classList.add('is-open')
            // Обновляем доступность сразу после добавления класса
            updateMenuLinksAccessibility()
            // Запускаем анимацию элементов меню после открытия
            setTimeout(() => {
                animateMenuItems(true)
                // Обновляем доступность ссылок после анимации
                updateMenuLinksAccessibility()
            }, 0) // Небольшая задержка после открытия меню
        }, 100)
        setTimeout(() => {
            headerMenu.classList.add('is-scrollable')
        }, 500)
    }

    setTimeout(() => {
        isAnimating = false
    }, ANIMATION_DURATION)
}

if (toggleButton) {
    toggleButton.addEventListener('click', () => {
        // На десктопе кнопка не работает
        if (window.innerWidth >= DESKTOP_MIN_WIDTH) {
            return
        }

        if (isAnimating) {
            return
        }

        const isActive = toggleButton.classList.contains('is-active')

        if (isActive) {
            closeMenu()
        } else {
            openMenu()
        }
    })

    // Закрытие меню по ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && toggleButton.classList.contains('is-active')) {
            closeMenu()
        }
    })

    // Обновляем доступность при изменении размера окна
    let resizeTimeout
    window.addEventListener('resize', () => {
        if (resizeTimeout) {
            clearTimeout(resizeTimeout)
        }
        resizeTimeout = setTimeout(() => {
            updateToggleButtonAccessibility()
            updateMenuLinksAccessibility()
        }, 100)
    })

    // Инициализируем доступность при загрузке
    const initAccessibility = () => {
        // Небольшая задержка для гарантии, что DOM полностью загружен
        setTimeout(() => {
            updateToggleButtonAccessibility()
            updateMenuLinksAccessibility()
        }, 100)
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAccessibility)
    } else {
        initAccessibility()
    }
}

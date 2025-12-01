import { gsap } from 'gsap'

function initHeroVideo() {
    const heroVideo = document.querySelector('.hero__video')
    const mutedVideo = document.querySelector('.hero__video-element--muted')
    const soundVideo = document.querySelector('.hero__video-element--sound')

    if (!heroVideo || !mutedVideo || !soundVideo) {
        return
    }

    let isPlayingWithSound = false
    let isExpanded = false
    let currentAnimation = null

    // Функция для получения минимальных размеров в зависимости от размера экрана
    const getMinSizes = () => {
        const windowWidth = window.innerWidth
        const windowHeight = window.innerHeight

        if (windowWidth >= 1440) {
            // Десктоп: 456px на 230px
            return {
                width: (456 / windowWidth) * 100,
                height: (230 / windowHeight) * 100,
            }
        } else if (windowWidth >= 768) {
            // Планшет: 416px на 226px
            return {
                width: (416 / windowWidth) * 100,
                height: (226 / windowHeight) * 100,
            }
        } else {
            // Мобилка: 225px на 135px
            return {
                width: (225 / windowWidth) * 100,
                height: (135 / windowHeight) * 100,
            }
        }
    }

    const maxWidth = 100
    const maxHeight = 90

    // Получаем минимальные размеры
    const minSizes = getMinSizes()
    const isDesktop = window.innerWidth >= 1440

    // Устанавливаем начальные размеры только на десктопе
    if (isDesktop) {
        // Вычисляем начальные размеры на основе текущего скролла (или минимальные, если scrollY = 0)
        const currentScrollY = window.scrollY
        const viewportHeight = window.innerHeight
        const scrollProgress = Math.min(currentScrollY / viewportHeight, 1)
        const stepPercent = Math.min(scrollProgress, 1)

        const widthRange = maxWidth - minSizes.width
        const heightRange = maxHeight - minSizes.height
        let initialWidth = minSizes.width + widthRange * stepPercent
        let initialHeight = minSizes.height + heightRange * stepPercent

        // Ограничиваем минимальными значениями
        initialWidth = Math.max(initialWidth, minSizes.width)
        initialHeight = Math.max(initialHeight, minSizes.height)

        // Устанавливаем начальные размеры через CSS переменные
        gsap.set(heroVideo, {
            '--video-width': `${initialWidth}%`,
            '--video-height': `${initialHeight}%`,
        })
    }

    // Обработчик скролла для изменения размера видео
    let lastScrollY = window.scrollY
    let currentStep = 0
    const stepSize = 25 // Увеличенный шаг для более быстрой реакции
    const maxStep = Math.ceil(100 / stepSize)

    const handleScroll = () => {
        // Работает только на десктопе
        const isDesktop = window.innerWidth >= 1440
        if (!isDesktop) {
            return
        }

        // Если видео увеличено при клике - не обрабатываем скролл
        if (isExpanded) {
            return
        }

        const currentScrollY = window.scrollY

        if (currentScrollY === lastScrollY) {
            return
        }

        const viewportHeight = window.innerHeight
        // Используем более агрессивное вычисление прогресса для быстрого раскрытия
        // Видео должно полностью раскрыться за половину высоты окна
        const scrollProgress = Math.min(currentScrollY / (viewportHeight * 0.2), 1)
        const newStep = Math.floor(scrollProgress * maxStep)
        const clampedStep = Math.min(newStep, maxStep)

        // Вычисляем процент прогресса от 0 до 1
        const stepPercent = clampedStep / maxStep

        // Получаем актуальные минимальные размеры (на случай изменения размера окна)
        const currentMinSizes = getMinSizes()

        // Вычисляем размеры: от минимальных до максимальных
        const widthRange = maxWidth - currentMinSizes.width
        const heightRange = maxHeight - currentMinSizes.height
        let targetWidth = currentMinSizes.width + widthRange * stepPercent
        let targetHeight = currentMinSizes.height + heightRange * stepPercent

        // Ограничиваем минимальными и максимальными значениями
        targetWidth = Math.max(targetWidth, currentMinSizes.width)
        targetWidth = Math.min(targetWidth, maxWidth)
        targetHeight = Math.max(targetHeight, currentMinSizes.height)
        targetHeight = Math.min(targetHeight, maxHeight)

        if (clampedStep !== currentStep) {
            currentStep = clampedStep

            if (currentAnimation) {
                currentAnimation.kill()
            }

            currentAnimation = gsap.to(heroVideo, {
                '--video-width': `${targetWidth}%`,
                '--video-height': `${targetHeight}%`,
                'duration': 1.6,
                'ease': 'power2.out',
                'onComplete': () => {
                    currentAnimation = null
                },
            })
        }

        lastScrollY = currentScrollY
    }

    const handleVideoClick = (e) => {
        // Работает только на десктопе
        const isDesktop = window.innerWidth >= 1440
        if (!isDesktop) {
            // На планшете и мобилке просто переключаем звук без изменения размера
            if (!isPlayingWithSound) {
                isPlayingWithSound = true
                mutedVideo.pause()
                mutedVideo.style.display = 'none'
                soundVideo.style.display = 'block'
                soundVideo.currentTime = 0
                soundVideo.muted = false
                soundVideo.play().catch((error) => {
                    console.error('Ошибка воспроизведения видео:', error)
                })
            } else {
                if (!soundVideo.paused) {
                    soundVideo.pause()
                } else {
                    soundVideo.play().catch((error) => {
                        console.error('Ошибка воспроизведения видео:', error)
                    })
                }
            }
            return
        }

        // Предотвращаем всплытие события от самого видео элемента
        if (e.target === mutedVideo || e.target === soundVideo) {
            e.stopPropagation()
        }

        // Если видео увеличено - уменьшаем и управляем воспроизведением
        if (isExpanded) {
            // Уменьшаем видео
            isExpanded = false

            if (currentAnimation) {
                currentAnimation.kill()
            }

            // Возвращаем к размеру на основе текущего скролла
            const currentScrollY = window.scrollY
            const viewportHeight = window.innerHeight
            const scrollProgress = Math.min(currentScrollY / viewportHeight, 1)
            const stepPercent = Math.min(scrollProgress, 1)

            // Получаем актуальные минимальные размеры
            const currentMinSizes = getMinSizes()

            const widthRange = maxWidth - currentMinSizes.width
            const heightRange = maxHeight - currentMinSizes.height
            let targetWidth = currentMinSizes.width + widthRange * stepPercent
            let targetHeight = currentMinSizes.height + heightRange * stepPercent

            // Ограничиваем минимальными и максимальными значениями
            targetWidth = Math.max(targetWidth, currentMinSizes.width)
            targetWidth = Math.min(targetWidth, maxWidth)
            targetHeight = Math.max(targetHeight, currentMinSizes.height)
            targetHeight = Math.min(targetHeight, maxHeight)

            currentAnimation = gsap.to(heroVideo, {
                '--video-width': `${targetWidth}%`,
                '--video-height': `${targetHeight}%`,
                'duration': 0.6,
                'ease': 'power2.out',
                'onComplete': () => {
                    currentAnimation = null
                },
            })

            // Если видео со звуком уже активно - ставим на паузу/возобновляем
            if (isPlayingWithSound) {
                if (!soundVideo.paused) {
                    soundVideo.pause()
                } else {
                    soundVideo.play().catch((error) => {
                        console.error('Ошибка воспроизведения видео:', error)
                    })
                }
            }
            return
        }

        // Увеличиваем видео до максимума
        isExpanded = true

        if (currentAnimation) {
            currentAnimation.kill()
        }

        currentAnimation = gsap.to(heroVideo, {
            '--video-width': `${maxWidth}%`,
            '--video-height': `${maxHeight}%`,
            'duration': 0.6,
            'ease': 'power2.out',
            'onComplete': () => {
                currentAnimation = null
            },
        })

        // Если видео со звуком еще не активно - переключаем на него
        if (!isPlayingWithSound) {
            isPlayingWithSound = true

            // Останавливаем и скрываем видео без звука
            mutedVideo.pause()
            mutedVideo.style.display = 'none'

            // Показываем и запускаем видео со звуком с начала
            soundVideo.style.display = 'block'
            soundVideo.currentTime = 0
            soundVideo.muted = false
            soundVideo.play().catch((error) => {
                console.error('Ошибка воспроизведения видео:', error)
            })
        } else {
            // Если уже активно - ставим на паузу/возобновляем
            if (!soundVideo.paused) {
                soundVideo.pause()
            } else {
                soundVideo.play().catch((error) => {
                    console.error('Ошибка воспроизведения видео:', error)
                })
            }
        }
    }

    // Добавляем обработчик клика на контейнер видео
    heroVideo.addEventListener('click', handleVideoClick)

    // Также добавляем обработчик на сами видео элементы
    mutedVideo.addEventListener('click', handleVideoClick)
    soundVideo.addEventListener('click', handleVideoClick)

    // Добавляем обработчик скролла с оптимизацией через requestAnimationFrame
    let scrollTimeout
    window.addEventListener('scroll', () => {
        if (scrollTimeout) {
            cancelAnimationFrame(scrollTimeout)
        }
        scrollTimeout = requestAnimationFrame(handleScroll)
    })

    // Обработка ошибок загрузки видео
    mutedVideo.addEventListener('error', () => {
        console.error('Ошибка загрузки видео без звука')
    })

    soundVideo.addEventListener('error', () => {
        console.error('Ошибка загрузки видео со звуком')
    })

    // Обработчик изменения размера окна для пересчета минимальных размеров
    let resizeTimeout
    window.addEventListener('resize', () => {
        // Работает только на десктопе
        const isDesktop = window.innerWidth >= 1440
        if (!isDesktop) {
            return
        }

        if (resizeTimeout) {
            clearTimeout(resizeTimeout)
        }
        resizeTimeout = setTimeout(() => {
            // Если видео не увеличено, обновляем размер на основе текущего скролла
            if (!isExpanded) {
                const currentScrollY = window.scrollY
                const viewportHeight = window.innerHeight
                const scrollProgress = Math.min(currentScrollY / viewportHeight, 1)
                const stepPercent = Math.min(scrollProgress, 1)

                const currentMinSizes = getMinSizes()
                const widthRange = maxWidth - currentMinSizes.width
                const heightRange = maxHeight - currentMinSizes.height
                let targetWidth = currentMinSizes.width + widthRange * stepPercent
                let targetHeight = currentMinSizes.height + heightRange * stepPercent

                // Ограничиваем минимальными и максимальными значениями
                targetWidth = Math.max(targetWidth, currentMinSizes.width)
                targetWidth = Math.min(targetWidth, maxWidth)
                targetHeight = Math.max(targetHeight, currentMinSizes.height)
                targetHeight = Math.min(targetHeight, maxHeight)

                if (currentAnimation) {
                    currentAnimation.kill()
                }

                currentAnimation = gsap.to(heroVideo, {
                    '--video-width': `${targetWidth}%`,
                    '--video-height': `${targetHeight}%`,
                    'duration': 0.3,
                    'ease': 'power2.out',
                    'onComplete': () => {
                        currentAnimation = null
                    },
                })
            }
        }, 100)
    })
}

// Запускаем инициализацию после загрузки DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHeroVideo)
} else {
    initHeroVideo()
}

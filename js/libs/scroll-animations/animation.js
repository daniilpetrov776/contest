import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export class Animation {
    /**
     *   Имя дата-атрибута без префикса "data-".
     *   Например, 'animate' → селекторы [data-animate="..."].
   /**
     * @param {string} dataAttr Имя дата-атрибута без префикса "data-".
     * Например, 'animate' → селекторы [data-animate="..."].
     * @private
     */
    constructor(dataAttr = 'animate') {
        /**
         * Имя дата-атрибута без префикса "data-".
         * @type {string}
         * @private
         */
        this.dataAttr = dataAttr
        /**
         * Массив установочных функций.
         * @type {Function[]}
         * @private
         */
        this.setups = []
    }

    /**
     * Batch-анимация «fadeScale» — масштабирование из центра
     * @param {object} [opts]
     * @param {string} [opts.start]          стартовая точка (дефолт "top center")
     * @param {string} [opts.itemSelector]   селектор вложенных элементов
     * @param {number} [opts.duration]       длительность tween (0.45s)
     * @param {number} [opts.stagger]        задержка между элементами (0.1s)
     * @param {string} [opts.ease]           easing (дефолт "back.out(1.5)")
     * @param {object} [opts.tweenVars]      доп. свойства для gsap.to()
     * @return {Animation} this
     */
    fadeScale(opts) {
        opts = opts || {}
        // если itemSelector присвоили null или пустую строку — будем анимировать сами batch
        const itemSel = opts.itemSelector === null
            ? null
            : (opts.itemSelector || `[data-${this.dataAttr}-item]`)

        this.setups.push(() => {
            ScrollTrigger.batch(
                `[data-${this.dataAttr}="fadeScale"]`,
                Object.assign({
                    start: opts.start || 'top center',
                    onEnter: (batch) => {
                        // решаем, что анимировать: сами batch-элементы или найденные внутри itemSel
                        const targets = itemSel
                            ? batch.map(el => el.querySelector(itemSel))
                            : batch

                        gsap.to(targets, Object.assign({
                            autoAlpha: 1,
                            scale: 1,
                            ease: opts.ease || 'back.out(1.5)',
                            duration: opts.duration || 0.45,
                            stagger: opts.stagger || 0.1,
                        }, opts.tweenVars || {}))
                    },
                }, this._filterTriggerOptions(opts))
            )
        })
        return this
    }

    /**
     * Batch-анимация «fadeScaleGroup» — масштабирование из центра
     * с обратной анимацией при скролле вверх
     * @param {object} [opts]
     * @param {string} [opts.start]          стартовая точка (дефолт "top center")
     * @param {string} [opts.itemSelector]   селектор вложенных элементов
     * @param {number} [opts.duration]       длительность tween (0.5s)
     * @param {number} [opts.stagger]        задержка между элементами (0.1s)
     * @param {object} [opts.tweenVars]      доп. свойства для gsap.to()
     * @return {Animation} this
     */
    fadeScaleGroup(opts) {
        opts = opts || {}
        const itemSel = opts.itemSelector || `[data-${this.dataAttr}-item]`

        this.setups.push(() => {
            ScrollTrigger.batch(
                `[data-${this.dataAttr}="fadeScale"]`,
                Object.assign({
                    start: opts.start || 'top center',
                    onEnter: (batch) => {
                        batch.forEach((container) => {
                            const children = Array.from(container.querySelectorAll(itemSel))
                            const tl = gsap.timeline({ paused: true })

                            // 1) анимация контейнера
                            const containerTween = Object.assign(
                                {
                                    autoAlpha: 1,
                                    scale: 1,
                                    duration: opts.duration || 0.5,
                                },
                                opts.tweenVars || {}
                            )
                            tl.to(container, containerTween)

                            // 2) анимация вложенных элементов
                            const childrenTween = Object.assign(
                                {
                                    autoAlpha: 1,
                                    scale: 1,
                                    duration: opts.duration || 0.5,
                                    stagger: opts.stagger || 0.1,
                                },
                                opts.tweenVars || {}
                            )
                            tl.to(children, childrenTween, `-=${(opts.duration || 0.5) - (opts.stagger || 0.1)}`)

                            // запускаем timeline
                            tl.play()
                            // сохраняем для обратного воспроизведения
                            container._fadeScaleTL = tl
                        })
                    },
                    onLeaveBack: (batch) => {
                        batch.forEach((container) => {
                            const tl = container._fadeScaleTL
                            if (tl) {
                                tl.reverse()
                            }
                        })
                    },
                }, this._filterTriggerOptions(opts))
            )
        })

        return this
    }

    /**
     * Batch-анимация «fadeFromBottom» — выезжает снизу и становится opacity 1
     * с обратным смещением при прокрутке вверх
     * @param {object} [opts]
     * @param {string} [opts.start]          стартовая точка (дефолт "top bottom")
     * @param {string} [opts.itemSelector]   селектор вложенных элементов
     * @param {number} [opts.duration]       длительность tween (0.48s)
     * @param {number} [opts.stagger]        задержка между элементами (0.05s)
     * @param {object} [opts.tweenVars]      доп. свойства для gsap.to()
     * @return {Animation} this
     */
    fadeFromBottom(opts) {
        opts = opts || {}
        const itemSel = opts.itemSelector === null
            ? null
            : (opts.itemSelector || `[data-${this.dataAttr}-item]`)

        this.setups.push(() => {
            ScrollTrigger.batch(
                `[data-${this.dataAttr}="fadeFromBottom"]`,
                Object.assign({
                    start: opts.start || 'top bottom',
                    onEnter: (batch) => {
                        const targets = batch.map(el => itemSel ? el.querySelector(itemSel) : el)
                        gsap.to(targets, Object.assign({
                            y: 0,
                            autoAlpha: 1,
                            duration: opts.duration || 0.48,
                            stagger: opts.stagger || 0.05,
                            ease: (opts.tweenVars && opts.tweenVars.ease) || 'power2.out',
                        }, opts.tweenVars || {}))
                    },
                    onLeaveBack: (batch) => {
                        const targets = batch.map(el => itemSel ? el.querySelector(itemSel) : el)
                        gsap.to(targets, Object.assign({
                            y: opts.fromY || 50,
                            autoAlpha: 0,
                            duration: opts.duration || 0.48,
                            stagger: opts.stagger || 0.05,
                            ease: (opts.tweenVars && opts.tweenVars.ease) || 'power2.in',
                        }, opts.tweenVars || {}))
                    },
                }, this._filterTriggerOptions(opts))
            )
        })

        return this
    }

    /**
     * Применяет анимации ко всем кнопкам в форме с чекбоксом
     * для использования добавь атрибут agreeButton на кнопку
     * @param {object} opts
     * @return {Animation} this
     */
    agreeButtonAnimation(opts = {}) {
        const selector = `[data-${this.dataAttr}="agreeButton"]`
        const durHover = opts.durationHover || 0.6
        const durClick = opts.durationClick || 0.3
        const durMobile = opts.durationMobile || 0.6

        this.setups.push(() => {
            document.querySelectorAll(selector).forEach((btn) => {
                const agreeForm = btn.closest('.agree-form__form')
                const fillEl = btn.querySelector('.button__fill')
                const textEl = btn.querySelector('.button__text')
                const agreeToggle = agreeForm
                    ? agreeForm.querySelector('input[type="checkbox"]')
                    : null
                if (!fillEl || !agreeToggle) {
                    return
                }

                let clicked = false
                const mqDesk = window.matchMedia('(min-width: 768px)')
                const mqMob = window.matchMedia('(max-width: 767px)')

                // Общая функция анимации заливки
                const animateFill = (width, duration, color) => {
                    gsap.to(fillEl, { width, duration, ease: 'power1.out', overwrite: 'auto' })
                    gsap.to(textEl, { color, duration, ease: 'power1.out', overwrite: 'auto' })
                }

                // Сброс состояния кнопки в неактивное
                const disableBtn = () => btn.setAttribute('disabled', '')
                // Активировать кнопку
                const enableBtn = () => btn.removeAttribute('disabled')

                const handleMobileState = () => {
                    if (mqMob.matches && agreeToggle.checked) {
                        animateFill('92%', durMobile, '#E4EEFF')
                        enableBtn()
                    } else {
                        // в противном случае сбрасываем заливку (опционально)
                        clicked = false
                        animateFill('0%', durMobile, '#0088FE')
                        disableBtn()
                    }
                }

                mqMob.addEventListener('change', () => {
                    handleMobileState()
                })

                handleMobileState()

                // Инициализация (для уже отмеченного чекбокса на мобилке)
                if (mqMob.matches && agreeToggle.checked) {
                    animateFill('92%', durMobile, '#E4EEFF')
                    enableBtn()
                } else {
                    // начальный цвет и заливка
                    animateFill('0%', 0, '#0088FE')
                    disableBtn()
                }

                // Hover (desktop)
                btn.addEventListener('mouseenter', () => {
                    if (agreeToggle.checked && mqDesk.matches && !clicked) {
                        animateFill('90%', durHover, '#F2F8FF')
                    }
                })
                // Keyboard focus behaves like hover
                btn.addEventListener('focus', () => {
                    if (agreeToggle.checked && mqDesk.matches && !clicked) {
                        animateFill('90%', durHover, '#F2F8FF')
                    }
                })
                btn.addEventListener('mouseleave', () => {
                    if (agreeToggle.checked && mqDesk.matches) {
                        clicked = false
                        animateFill('0%', durHover, '#0088FE')
                    }
                })
                btn.addEventListener('blur', () => {
                    if (agreeToggle.checked && mqDesk.matches) {
                        clicked = false
                        animateFill('0%', durHover, '#0088FE')
                    }
                })

                // Click (desktop)
                btn.addEventListener('click', () => {
                    if (agreeToggle.checked && mqDesk.matches && !clicked) {
                        clicked = true
                        animateFill('100%', durClick, '$FFFFFF')
                    }
                })

                // Change (mobile)
                agreeToggle.addEventListener('change', () => {
                    if (mqMob.matches) {
                        if (agreeToggle.checked) {
                            animateFill('92%', durMobile, '#E4EEFF')
                            enableBtn()
                        } else {
                            clicked = false
                            animateFill('0%', durMobile, '#0088FE')
                            disableBtn()
                        }
                    }
                })
                // Change (desktop)
                agreeToggle.addEventListener('change', () => {
                    if (mqDesk.matches) {
                        if (agreeToggle.checked) {
                            enableBtn()
                        } else {
                            clicked = false
                            disableBtn()
                        }
                    }
                })
            })
        })

        return this
    }

    /**
     * Применяет анимации ко всем кнопкам c заливкой
     * для использования добавь атрибут fillButton на кнопку
     * @param {object} [opts]
     * @param {number} [opts.durationHover] длительность анимации при ховере
     * @param {number} [opts.durationClick] длительность анимации при клике
     * @param {number} [opts.durationMobile] длительность анимации на мобилке
     * @return {Animation} this
     */
    fillButtonAnimation(opts = {}) {
        const selector = `[data-${this.dataAttr}="fillButton"]`
        const durHover = opts.durationHover || 0.6
        const durClick = opts.durationClick || 0.3
        const durMobile = opts.durationMobile || 0.6

        // console.log('fillButtonAnimation', selector, durHover, durClick, durMobile)

        this.setups.push(() => {
            document.querySelectorAll(selector).forEach((btn) => {
                const fillEl = btn.querySelector('.button__fill')
                const textEl = btn.querySelector('.button__text')
                if (!fillEl || !textEl) {
                    return
                }

                let clicked = false
                const mqDesk = window.matchMedia('(min-width: 768px)').matches
                const mqMob = window.matchMedia('(max-width: 767px)').matches

                // Функция анимации заливки
                const animateFill = (width, duration, color) => {
                    gsap.to(fillEl, { width, duration, ease: 'power1.out', overwrite: 'auto' })
                    gsap.to(textEl, { color, duration, ease: 'power1.out', overwrite: 'auto' })
                }

                // Инициализация — без заливки
                animateFill('0%', 0, '#0088FE')

                // Hover и focus на десктопе
                if (mqDesk) {
                    const onHoverIn = () => {
                        if (!clicked) {
                            animateFill('80%', durHover, '#F2F8FF')
                        }
                    }
                    const onHoverOut = () => {
                        if (!clicked) {
                            animateFill('0%', durHover, '#0088FE')
                        }
                    }
                    btn.addEventListener('mouseenter', onHoverIn)
                    btn.addEventListener('focus', onHoverIn)
                    btn.addEventListener('mouseleave', onHoverOut)
                    btn.addEventListener('blur', onHoverOut)
                }

                // Click (desktop & mobile)
                btn.addEventListener('click', () => {
                    clicked = true
                    const targetWidth = mqMob ? '80%' : '100%'
                    const duration = mqMob ? durMobile : durClick
                    const color = mqMob ? '#E4EEFF' : '#FFFFFF'
                    animateFill(targetWidth, duration, color)
                    if (mqMob) {
                        btn.focus()
                    }
                })

                // Reset при уходе курсора (desktop) или потере фокуса (mobile)
                const reset = () => {
                    if (clicked) {
                        clicked = false
                        const duration = mqMob ? durMobile : durHover
                        animateFill('0%', duration, '#0088FE')
                    }
                }
                btn.addEventListener('mouseleave', reset)
                btn.addEventListener('blur', reset)

                // На мобильных сброс при клике вне кнопки
                if (mqMob) {
                    document.addEventListener('click', (e) => {
                        if (clicked && !btn.contains(e.target)) {
                            reset()
                        }
                    })
                }
            })
        })

        return this
    }

    /**
     * Адаптивная анимация фонового блока и главного изображения
     * Класс на фон: data-{dataAttr}="mainBackground"
     * Класс на картинку: data-{dataAttr}="mainImage"
     * @param {object} [opts]
     * @param {number} [opts.durationBg]    Длительность анимации фона (с)
     * @param {number} [opts.durationImg]   Длительность анимации изображения (с)
     * @return {Animation} this
     */
    heroAnimation(opts = {}) {
        const durBg = opts.durationBg || 1
        const durImg = opts.durationImg || 0.8

        this.setups.push(() => {
            const mm = gsap.matchMedia()
            mm.add({
                isDesktop: '(min-width: 768px)',
                isMobile: '(max-width: 767px)',
            }, (context) => {
                const bgSelector = `[data-${this.dataAttr}="mainBackground"]`
                const imgSelector = `[data-${this.dataAttr}="mainImage"]`

                if (context.conditions.isDesktop) {
                    // Увеличение фона на 10%
                    gsap.to(bgSelector, {
                        scale: 1,
                        duration: durBg,
                        ease: 'power2.out',
                    })
                    // Появление изображения с движения
                    gsap.fromTo(
                        imgSelector,
                        { x: 55, y: -25, autoAlpha: 0 },
                        {
                            x: 0,
                            y: 0,
                            autoAlpha: 1,
                            duration: durImg,
                            ease: 'power2.out',
                            scrollTrigger: {
                                trigger: bgSelector,
                                start: 'top center',
                            },
                        }
                    )
                }

                if (context.conditions.isMobile) {
                    // Картинка появляется из центра и растёт до 100%
                    gsap.fromTo(
                        imgSelector,
                        { scale: 0, autoAlpha: 0 },
                        { scale: 1, autoAlpha: 1, duration: durImg, ease: 'power2.out' }
                    )
                }

                return () => mm.kill()
            })
        })

        return this
    }

    /**
     * Запускает все отложенные регистрации анимаций.
     * Должен вызываться один раз после цепочки методов.
     */
    init() {
        this.setups.forEach(fn => fn())
    }

    _filterTriggerOptions(opts) {
        const allowed = [
            'markers',
            'once',
            'start',
            'end',
            'invalidateOnRefresh',
            'onLeave',
            'onLeaveBack',
            'onEnterBack'
        ]
        const result = {}
        allowed.forEach((key) => {
            if (typeof opts[key] !== 'undefined') {
                result[key] = opts[key]
            }
        })
        return result
    }
}

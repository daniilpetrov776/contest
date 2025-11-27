import { bodyLock, bodyLockStatus, bodyUnlock, FLS } from '../files/functions'
import { flsModules } from '../files/modules'

// Интерфейс для настроек попапа
interface PopupOptions {
    logging?: boolean
    init?: boolean
    attributeOpenButton: string
    attributeCloseButton: string
    fixElementSelector: string
    vkAttribute: string
    vkPlaceAttribute: string
    setAutoplayVk: boolean
    classes: {
        popup: string
        popupContent: string
        popupActive: string
        bodyActive: string
    }
    focusCatch: boolean
    closeEsc: boolean
    bodyLock: boolean
    hashSettings: {
        location: boolean
        goHash: boolean
    }
    on: {
        beforeOpen: (popup: Popup) => void
        afterOpen: (popup: Popup) => void
        beforeClose: (popup: Popup) => void
        afterClose: (popup: Popup) => void
    }
}

// Интерфейс для целевого элемента попапа
interface PopupTarget {
    selector: string | false
    element: HTMLElement | null
}

class Popup {
    private vkCode: string | null
    private isOpen: boolean
    private targetOpen: PopupTarget
    private previousOpen: PopupTarget
    private lastClosed: PopupTarget
    private _dataValue: string | null
    private hash: boolean
    private _reopen: boolean
    private _selectorOpen: boolean
    private lastFocusEl: HTMLElement | null
    private previousActiveElement: Element | null
    private _focusEl: string[]
    private options: PopupOptions
    private bodyLock: boolean

    constructor(options: Partial<PopupOptions>) {
        const config: PopupOptions = {
            logging: true,
            init: true,
            // Для кнопок
            attributeOpenButton: 'data-popup', // Атрибут для кнопки, которая вызывает попап
            attributeCloseButton: 'data-close', // Атрибут для кнопки, которая закрывает попап
            // Для сторонних объектов
            fixElementSelector: '[data-lp]', // Атрибут для элементов с левым паддингом (которые fixed)
            // Для объекта попапа
            vkAttribute: 'data-popup-vk', // Атрибут для кода vk
            vkPlaceAttribute: 'data-popup-vk-place', // Атрибут для вставки ролика vk
            setAutoplayVk: true,
            // Изменение классов
            classes: {
                popup: 'popup',
                // popupWrapper: 'popup__wrapper',
                popupContent: 'popup__content',
                popupActive: 'popup_show', // Добавляется для попапа, когда он открывается
                bodyActive: 'popup-show', // Добавляется для боди, когда попап открыт
            },
            focusCatch: true, // Фокус внутри попапа зациклен
            closeEsc: true, // Закрытие по ESC
            bodyLock: true, // Блокировка скрола
            hashSettings: {
                location: true, // Хэш в адресной строке
                goHash: true, // Переход по наличию в адресной строке
            },
            on: {
                // События
                beforeOpen: () => {},
                afterOpen: () => {},
                beforeClose: () => {},
                afterClose: () => {},
            },
        }
        this.vkCode = null
        this.isOpen = false
        // Текущее окно
        this.targetOpen = {
            selector: false,
            element: null,
        }
        // Предыдущее открытое
        this.previousOpen = {
            selector: false,
            element: null,
        }
        // Последнее закрытое
        this.lastClosed = {
            selector: false,
            element: null,
        }
        this._dataValue = null
        this.hash = false
        this._reopen = false
        this._selectorOpen = false
        this.lastFocusEl = null
        this.previousActiveElement = null
        this._focusEl = [
            'a[href]',
            'input:not([disabled]):not([type="hidden"]):not([aria-hidden])',
            'button:not([disabled]):not([aria-hidden])',
            'select:not([disabled]):not([aria-hidden])',
            'textarea:not([disabled]):not([aria-hidden])',
            'area[href]',
            'iframe',
            'object',
            'embed',
            '[contenteditable]',
            '[tabindex]:not([tabindex^="-"])',
        ]
        // this.options = Object.assign(config, options);
        this.options = {
            ...config,
            ...options,
            classes: {
                ...config.classes,
                ...options?.classes,
            },
            hashSettings: {
                ...config.hashSettings,
                ...options?.hashSettings,
            },
            on: {
                ...config.on,
                ...options?.on,
            },
        }
        this.bodyLock = false
        if (this.options.init) {
            this.initPopups()
        }
    }

    initPopups() {
        this.popupLogging(`Проснулся`)
        this.eventsPopup()
    }

    eventsPopup() {
        // Клик на всем документе
        document.addEventListener('click', (e: MouseEvent) => {
            // Клик по кнопке "открыть"
            const target = e.target as HTMLElement
            const buttonOpen = target?.closest(`[${this.options.attributeOpenButton}]`)
            if (buttonOpen) {
                e.preventDefault()
                this._dataValue = buttonOpen.getAttribute(this.options.attributeOpenButton)
                    ? buttonOpen.getAttribute(this.options.attributeOpenButton)
                    : 'error'
                this.vkCode = buttonOpen.getAttribute(this.options.vkAttribute)
                    ? buttonOpen.getAttribute(this.options.vkAttribute)
                    : null
                if (this._dataValue !== 'error') {
                    if (!this.isOpen) {
                        this.lastFocusEl = buttonOpen as HTMLElement
                    }
                    this.targetOpen.selector = `${this._dataValue}`
                    this._selectorOpen = true
                    this.open('')
                    return
                } else {
                    this.popupLogging(`Ой, не заполнен атрибут у ${buttonOpen.classList}`)
                }
                return
            }
            // Закрытие на пустом месте (popup__wrapper) и кнопки закрытия (popup__close) для закрытия
            const buttonClose = target?.closest(`[${this.options.attributeCloseButton}]`)
            if (buttonClose || (!target?.closest(`.${this.options.classes.popupContent}`) && this.isOpen)) {
                e.preventDefault()
                this.close('')
            }
        })

        // Закрытие по ESC
        document.addEventListener('keydown', (e: KeyboardEvent) => {
            if (this.options.closeEsc && e.key === 'Escape' && this.isOpen) {
                e.preventDefault()
                this.close('')
                return
            }
            if (this.options.focusCatch && e.key === 'Tab' && this.isOpen) {
                this._focusCatch(e)
            }
        })
    }

    open(selectorValue: string): void {
        if (bodyLockStatus) {
            // Если перед открытием попапа был режим lock
            this.bodyLock = !!(document.documentElement.classList.contains('lock') && !this.isOpen)

            // Если ввести значение селектора (селектор настраивается в options)
            if (selectorValue && typeof selectorValue === 'string' && selectorValue.trim() !== '') {
                this.targetOpen.selector = selectorValue
                this._selectorOpen = true
            }
            if (this.isOpen) {
                this._reopen = true
                this.close('')
            }
            if (!this._selectorOpen) {
                this.targetOpen.selector = this.lastClosed.selector as string
            }
            if (!this._reopen) {
                this.previousActiveElement = document.activeElement
            }

            const element = document.querySelector(this.targetOpen.selector as string)
            if (element) {
                this.targetOpen.element = element as HTMLElement

                // Vk
                if (this.vkCode) {
                    const codeVideo = this.vkCode
                    const urlVideo = `https://vk.ru/video_ext.php?oid=-${codeVideo}&autoplay=1`
                    const iframe = document.createElement('iframe')
                    iframe.setAttribute('allowfullscreen', '')
                    const autoplay = this.options.setAutoplayVk ? 'autoplay;' : ''
                    iframe.setAttribute('allow', `${autoplay}; encrypted-media`)
                    iframe.setAttribute('src', urlVideo)

                    const vkPlace = this.targetOpen.element.querySelector(`[${this.options.vkPlaceAttribute}]`)
                    if (vkPlace) {
                        vkPlace.appendChild(iframe)
                    }
                }

                // До открытия
                this.options.on.beforeOpen(this)
                // Создаем свое событие после открытия попапа
                document.dispatchEvent(
                    new CustomEvent('beforePopupOpen', {
                        detail: {
                            popup: this,
                        },
                    })
                )

                this.targetOpen.element.classList.add(this.options.classes.popupActive)
                document.documentElement.classList.add(this.options.classes.bodyActive)

                if (!this._reopen) {
                    if (!this.bodyLock) {
                        bodyLock()
                    }
                } else {
                    this._reopen = false
                }

                this.targetOpen.element.setAttribute('aria-hidden', 'false')

                // Запоминаю это открытое окно. Оно будет последним открытым
                this.previousOpen.selector = this.targetOpen.selector
                this.previousOpen.element = this.targetOpen.element

                this._selectorOpen = false
                this.isOpen = true

                setTimeout(() => {
                    this._focusTrap()
                }, 50)

                // После открытия
                this.options.on.afterOpen(this)
                // Создаем свое событие после открытия попапа
                document.dispatchEvent(
                    new CustomEvent('afterPopupOpen', {
                        detail: {
                            popup: this,
                        },
                    })
                )
                this.popupLogging(`Открыл попап`)
            } else {
                this.popupLogging(`Ой ой, такого попапа нет. Проверьте корректность ввода. `)
            }
        }
    }

    close(selectorValue: string): void {
        if (selectorValue && typeof selectorValue === 'string' && selectorValue.trim() !== '') {
            this.previousOpen.selector = selectorValue
        }
        if (!this.isOpen || !bodyLockStatus) {
            return
        }

        // До закрытия
        this.options.on.beforeClose(this)
        // Создаем свое событие перед закрытием попапа
        document.dispatchEvent(
            new CustomEvent('beforePopupClose', {
                detail: {
                    popup: this,
                },
            })
        )

        // Vk
        if (this.vkCode && this.targetOpen.element) {
            const vkPlace = this.targetOpen.element.querySelector(`[${this.options.vkPlaceAttribute}]`)
            if (vkPlace) {
                vkPlace.innerHTML = ''
            }
        }

        if (this.previousOpen.element) {
            this.previousOpen.element.classList.remove(this.options.classes.popupActive)
            // aria-hidden
            this.previousOpen.element.setAttribute('aria-hidden', 'true')
        }

        if (!this._reopen) {
            document.documentElement.classList.remove(this.options.classes.bodyActive)
            if (!this.bodyLock) {
                bodyUnlock()
            }
            this.isOpen = false
        }

        // После закрытия
        this.options.on.afterClose(this)
        // Создаем свое событие после закрытия попапа
        document.dispatchEvent(
            new CustomEvent('afterPopupClose', {
                detail: {
                    popup: this,
                },
            })
        )

        setTimeout(() => {
            this._focusTrap()
        }, 50)

        this.popupLogging(`Закрыл попап`)
    }

    _focusCatch(e: KeyboardEvent): void {
        if (this.targetOpen.element) {
            const focusable = this.targetOpen.element.querySelectorAll<HTMLElement>(this._focusEl.join(','))
            const focusArray = Array.from(focusable)
            const focusedIndex = focusArray.indexOf(document.activeElement as HTMLElement)

            if (e.shiftKey && focusedIndex === 0) {
                focusArray[focusArray.length - 1].focus()
                e.preventDefault()
            }
            if (!e.shiftKey && focusedIndex === focusArray.length - 1) {
                focusArray[0].focus()
                e.preventDefault()
            }
        }
    }

    _focusTrap(): void {
        if (this.previousOpen.element) {
            const focusable = this.previousOpen.element.querySelectorAll<HTMLElement>(this._focusEl.join(','))
            if (!this.isOpen && this.lastFocusEl) {
                this.lastFocusEl.focus()
            } else if (focusable.length > 0) {
                focusable[0].focus()
            }
        }
    }

    // Функция вывода в консоль
    popupLogging(message: string): void {
        if (this.options.logging) {
            FLS(`[Попап]: ${message}`)
        }
    }
}

// Запускаем и добавляем в объект модулей
flsModules.popup = new Popup({})

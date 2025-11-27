import type { IBreakpoint, IMediaQueryItem, IMediaQueryResult, IMobile } from '../types'

/* Проверка мобильного браузера */
export const isMobile: IMobile = {
    Android(): RegExpMatchArray | null {
        return navigator.userAgent.match(/Android/i)
    },
    BlackBerry(): RegExpMatchArray | null {
        return navigator.userAgent.match(/BlackBerry/i)
    },
    iOS(): RegExpMatchArray | null {
        return navigator.userAgent.match(/iPhone|iPad|iPod/i)
    },
    Opera(): RegExpMatchArray | null {
        return navigator.userAgent.match(/Opera Mini/i)
    },
    Windows(): RegExpMatchArray | null {
        return navigator.userAgent.match(/IEMobile/i)
    },
    any(): boolean {
        return Boolean(
            isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows()
        )
    },
}

/* Добавление класса touch для HTML если браузер мобильный */
export function addTouchClass(): void {
    if (isMobile.any()) {
        document.documentElement.classList.add('touch')
    }
}

// Добавление loaded для HTML после полной загрузки страницы
export function addLoadedClass(): void {
    if (!document.documentElement.classList.contains('loading')) {
        window.addEventListener('load', () => {
            setTimeout(() => {
                document.documentElement.classList.add('loaded')
            }, 0)
        })
    }
}

// Получение хеша в адресе сайта
export function getHash(): string | undefined {
    if (location.hash) {
        return location.hash.replace('#', '')
    }
    return undefined
}

// Указание хеша в адресе сайта
export function setHash(hash: string): void {
    const newHash = hash ? `#${hash}` : window.location.href.split('#')[0]
    history.pushState('', '', newHash)
}

// Учет плавающей панели на мобильных устройствах при 100vh
export function fullVHfix(): void {
    const fullScreens = document.querySelectorAll<HTMLElement>('[data-fullscreen]')

    if (fullScreens.length && isMobile.any()) {
        const fixHeight = (): void => {
            const vh = window.innerHeight * 0.01
            document.documentElement.style.setProperty('--vh', `${vh}px`)
        }

        fixHeight()

        window.addEventListener('resize', fixHeight)
    }
}

// Вспомогательные модули плавного раскрытия и закрытия объекта ======================================================================================================================================================================
export function _slideUp(target: HTMLElement, duration: number = 500, showmore: number = 0): void {
    if (!target.classList.contains('_slide')) {
        target.classList.add('_slide')
        target.style.transitionProperty = 'height, margin, padding'
        target.style.transitionDuration = `${duration}ms`
        target.style.height = `${target.offsetHeight}px`
        void target.offsetHeight
        target.style.overflow = 'hidden'
        target.style.height = showmore ? `${showmore}px` : '0'
        target.style.paddingTop = '0'
        target.style.paddingBottom = '0'
        target.style.marginTop = '0'
        target.style.marginBottom = '0'
        window.setTimeout(() => {
            target.hidden = !showmore
            if (!showmore) {
                target.style.removeProperty('height')
                target.style.removeProperty('overflow')
            }
            target.style.removeProperty('padding-top')
            target.style.removeProperty('padding-bottom')
            target.style.removeProperty('margin-top')
            target.style.removeProperty('margin-bottom')
            target.style.removeProperty('transition-duration')
            target.style.removeProperty('transition-property')
            target.classList.remove('_slide')
            // Создаем событие
            document.dispatchEvent(
                new CustomEvent('slideUpDone', {
                    detail: {
                        target,
                    },
                })
            )
        }, duration)
    }
}

export function _slideDown(target: HTMLElement, duration: number = 500, showmore: number = 0): void {
    if (!target.classList.contains('_slide')) {
        target.classList.add('_slide')
        target.hidden = false
        if (showmore) {
            target.style.removeProperty('height')
        }
        const height = target.offsetHeight
        target.style.overflow = 'hidden'
        target.style.height = showmore ? `${showmore}px` : '0'
        target.style.paddingTop = '0'
        target.style.paddingBottom = '0'
        target.style.marginTop = '0'
        target.style.marginBottom = '0'
        void target.offsetHeight
        target.style.transitionProperty = 'height, margin, padding'
        target.style.transitionDuration = `${duration}ms`
        target.style.height = `${height}px`
        target.style.removeProperty('padding-top')
        target.style.removeProperty('padding-bottom')
        target.style.removeProperty('margin-top')
        target.style.removeProperty('margin-bottom')
        window.setTimeout(() => {
            target.style.removeProperty('height')
            target.style.removeProperty('overflow')
            target.style.removeProperty('transition-duration')
            target.style.removeProperty('transition-property')
            target.classList.remove('_slide')
            // Создаем событие
            document.dispatchEvent(
                new CustomEvent('slideDownDone', {
                    detail: {
                        target,
                    },
                })
            )
        }, duration)
    }
}

export function _slideToggle(target: HTMLElement, duration: number = 500): void {
    if (target.hidden) {
        return _slideDown(target, duration)
    } else {
        return _slideUp(target, duration)
    }
}

// Вспомогательные модули блокировки прокрутки и скачка ====================================================================================================================================================================================================================================================================================
// eslint-disable-next-line import/no-mutable-exports
export let bodyLockStatus = true

export function bodyUnlock(delay: number = 500) {
    const body = document.querySelector<HTMLBodyElement>('body')!
    if (bodyLockStatus) {
        const lockPadding = document.querySelectorAll<HTMLElement>('[data-lp]')
        setTimeout(() => {
            for (let index = 0; index < lockPadding.length; index++) {
                const el = lockPadding[index]
                el.style.paddingRight = '0'
            }
            body.style.paddingRight = '0'
            document.documentElement.classList.remove('lock')
        }, delay)
        bodyLockStatus = false
        setTimeout(() => {
            bodyLockStatus = true
        }, delay)
    }
}

export function bodyLock(delay: number = 500) {
    const body = document.querySelector<HTMLBodyElement>('body')
    if (bodyLockStatus) {
        const lockPadding = document.querySelectorAll<HTMLElement>('[data-lp]')
        for (let index = 0; index < lockPadding.length; index++) {
            const el = lockPadding[index]
            el.style.paddingRight = `${window.innerWidth - document.querySelector<HTMLElement>('.wrapper')!.offsetWidth}px`
        }
        body!.style.paddingRight = `${window.innerWidth - document.querySelector<HTMLElement>('.wrapper')!.offsetWidth}px`
        document.documentElement.classList.add('lock')

        bodyLockStatus = false
        setTimeout(() => {
            bodyLockStatus = true
        }, delay)
    }
}

export function bodyLockToggle(delay: number = 500) {
    if (document.documentElement.classList.contains('lock')) {
        bodyUnlock(delay)
    } else {
        bodyLock(delay)
    }
}

// Модуль работы со спойлерами =======================================================================================================================================================================================================================
export function spoilers(): void {
    const spoilersArray = document.querySelectorAll<HTMLElement>('[data-spoilers]')

    if (spoilersArray.length > 0) {
        // Получение обычных спойлеров
        const spoilersRegular = Array.from(spoilersArray).filter((item) => {
            return !item.dataset.spoilers?.split(',')[0]
        })

        // Работа с контентом
        const initSpoilerBody = (spoilersBlock: HTMLElement, hideSpoilerBody = true): void => {
            const spoilerTitlesNodeList = spoilersBlock.querySelectorAll<HTMLElement>('[data-spoiler]')
            const spoilerTitles = Array.from(spoilerTitlesNodeList).filter((item) => {
                return item.closest('[data-spoilers]') === spoilersBlock
            })

            if (spoilerTitles.length) {
                spoilerTitles.forEach((spoilerTitle) => {
                    if (hideSpoilerBody) {
                        spoilerTitle.removeAttribute('tabindex')
                        if (!spoilerTitle.classList.contains('_spoiler-active')) {
                            const nextElement = spoilerTitle.nextElementSibling as HTMLElement
                            if (nextElement) {
                                nextElement.hidden = true
                            }
                        }
                    } else {
                        spoilerTitle.setAttribute('tabindex', '-1')
                        const nextElement = spoilerTitle.nextElementSibling as HTMLElement
                        if (nextElement) {
                            nextElement.hidden = false
                        }
                    }
                })
            }
        }

        const hideSpoilersBody = (spoilersBlock: HTMLElement): void => {
            const spoilerActiveTitle = spoilersBlock.querySelector<HTMLElement>('[data-spoiler]._spoiler-active')
            const spoilerSpeed = spoilersBlock.dataset.spoilersSpeed
                ? Number.parseInt(spoilersBlock.dataset.spoilersSpeed)
                : 500

            if (spoilerActiveTitle && !spoilersBlock.querySelectorAll('._slide').length) {
                spoilerActiveTitle.classList.remove('_spoiler-active')
                const nextElement = spoilerActiveTitle.nextElementSibling as HTMLElement
                if (nextElement) {
                    _slideUp(nextElement, spoilerSpeed)
                }
            }
        }

        const setSpoilerAction = (e: Event): void => {
            const el = e.target as HTMLElement
            const spoilerTitle = el.closest('[data-spoiler]') as HTMLElement | null

            if (spoilerTitle) {
                const spoilersBlock = spoilerTitle.closest('[data-spoilers]') as HTMLElement
                const oneSpoiler = spoilersBlock.hasAttribute('data-one-spoiler')
                const spoilerSpeed = spoilersBlock.dataset.spoilersSpeed
                    ? Number.parseInt(spoilersBlock.dataset.spoilersSpeed)
                    : 500

                if (!spoilersBlock.querySelectorAll('._slide').length) {
                    if (oneSpoiler && !spoilerTitle.classList.contains('_spoiler-active')) {
                        hideSpoilersBody(spoilersBlock)
                    }
                    spoilerTitle.classList.toggle('_spoiler-active')
                    const nextElement = spoilerTitle.nextElementSibling as HTMLElement
                    if (nextElement) {
                        _slideToggle(nextElement, spoilerSpeed)
                    }
                }
            }
        }

        // Инициализация
        const initSpoilers = (spoilersArray: HTMLElement[], matchMedia: MediaQueryList | false = false): void => {
            spoilersArray.forEach((spoilersBlock) => {
                if (matchMedia && 'item' in spoilersBlock) {
                    spoilersBlock = (spoilersBlock as unknown as IBreakpoint).item
                }

                if ((matchMedia as MediaQueryList)?.matches || !matchMedia) {
                    spoilersBlock.classList.add('_spoiler-init')
                    initSpoilerBody(spoilersBlock)
                    spoilersBlock.addEventListener('click', setSpoilerAction)
                } else {
                    spoilersBlock.classList.remove('_spoiler-init')
                    initSpoilerBody(spoilersBlock, false)
                    spoilersBlock.removeEventListener('click', setSpoilerAction)
                }
            })
        }

        // Инициализация обычных спойлеров
        if (spoilersRegular.length) {
            initSpoilers(spoilersRegular, false)
        }

        // Получение спойлеров с медиа запросами
        const mdQueriesArray = dataMediaQueries(spoilersArray, 'spoilers')

        if (mdQueriesArray && mdQueriesArray.length) {
            mdQueriesArray.forEach((mdQueriesItem) => {
                mdQueriesItem.matchMedia.addEventListener('change', () => {
                    initSpoilers(mdQueriesItem.itemsArray, mdQueriesItem.matchMedia)
                })
                initSpoilers(mdQueriesItem.itemsArray, mdQueriesItem.matchMedia)
            })
        }

        // Закрытие при клике вне спойлера
        const spoilersClose = document.querySelectorAll<HTMLElement>('[data-spoiler-close]')

        if (spoilersClose.length) {
            document.addEventListener('click', (e: MouseEvent) => {
                const el = e.target as HTMLElement

                if (!el.closest('[data-spoilers]')) {
                    spoilersClose.forEach((spoilerClose) => {
                        const spoilersBlock = spoilerClose.closest('[data-spoilers]') as HTMLElement | null

                        if (spoilersBlock?.classList.contains('_spoiler-init')) {
                            const spoilerSpeed = spoilersBlock.dataset.spoilersSpeed
                                ? Number.parseInt(spoilersBlock.dataset.spoilersSpeed)
                                : 500
                            spoilerClose.classList.remove('_spoiler-active')
                            const nextElement = spoilerClose.nextElementSibling as HTMLElement
                            if (nextElement) {
                                _slideUp(nextElement, spoilerSpeed)
                            }
                        }
                    })
                }
            })
        }
    }
}

// Модуль работы с табами =======================================================================================================================================================================================================================
export function tabs(): void {
    const tabs = document.querySelectorAll<HTMLElement>('[data-tabs]')
    let tabsActiveHash: string[] = []

    if (tabs.length > 0) {
        const hash = getHash()

        if (hash && hash.startsWith('tab-')) {
            tabsActiveHash = hash.replace('tab-', '').split('-')
        }

        Array.from(tabs).forEach((tabsBlock, index) => {
            if (tabsBlock.getAttribute('data-tabs') === 'hover') {
                tabsBlock.addEventListener('mouseover', setTabsAction)
            } else {
                tabsBlock.addEventListener('click', setTabsAction)
            }
            tabsBlock.classList.add('_tab-init')
            tabsBlock.setAttribute('data-tabs-index', String(index))
            initTabs(tabsBlock)
        })

        // Получение спойлеров с медиа запросами
        const mdQueriesArray = dataMediaQueries(tabs, 'tabs')
        if (mdQueriesArray && mdQueriesArray.length) {
            mdQueriesArray.forEach((mdQueriesItem) => {
                // Событие
                mdQueriesItem.matchMedia.addEventListener('change', () => {
                    setTitlePosition(mdQueriesItem.itemsArray, mdQueriesItem.matchMedia)
                })
                setTitlePosition(mdQueriesItem.itemsArray, mdQueriesItem.matchMedia)
            })
        }
    }

    function setTitlePosition(tabsMediaArray: HTMLElement[], matchMedia: MediaQueryList): void {
        tabsMediaArray.forEach((tabsMediaItem) => {
            const tabsTitles = tabsMediaItem.querySelector<HTMLElement>('[data-tabs-titles]')
            const tabsTitleItemsNodeList = tabsMediaItem.querySelectorAll<HTMLElement>('[data-tabs-title]')
            const tabsContent = tabsMediaItem.querySelector<HTMLElement>('[data-tabs-body]')
            const tabsContentItemsNodeList = tabsMediaItem.querySelectorAll<HTMLElement>('[data-tabs-item]')

            if (!tabsTitles || !tabsContent) {
                return
            }

            const tabsTitleItems = Array.from(tabsTitleItemsNodeList).filter((item) => {
                return item.closest('[data-tabs]') === tabsMediaItem
            })

            const tabsContentItems = Array.from(tabsContentItemsNodeList).filter((item) => {
                return item.closest('[data-tabs]') === tabsMediaItem
            })

            tabsContentItems.forEach((tabsContentItem, index) => {
                if (matchMedia.matches) {
                    tabsContent.append(tabsTitleItems[index])
                    tabsContent.append(tabsContentItem)
                    tabsMediaItem.classList.add('_tab-spoiler')
                } else {
                    tabsTitles.append(tabsTitleItems[index])
                    tabsMediaItem.classList.remove('_tab-spoiler')
                }
            })
        })
    }

    // Работа с контентом
    function initTabs(tabsBlock: HTMLElement): void {
        const tabsTitlesNodeList = tabsBlock.querySelectorAll<HTMLElement>('[data-tabs-titles]>*')
        const tabsContentNodeList = tabsBlock.querySelectorAll<HTMLElement>('[data-tabs-body]>*')
        const tabsBlockIndex = tabsBlock.dataset.tabsIndex
        const tabsActiveHashBlock = tabsActiveHash[0] === tabsBlockIndex

        if (tabsActiveHashBlock) {
            const tabsActiveTitle = tabsBlock.querySelector<HTMLElement>('[data-tabs-titles]>._tab-active')
            if (tabsActiveTitle) {
                tabsActiveTitle.classList.remove('_tab-active')
            }
        }

        if (tabsContentNodeList.length) {
            const tabsContent = Array.from(tabsContentNodeList).filter((item) => {
                return item.closest('[data-tabs]') === tabsBlock
            })

            const tabsTitles = Array.from(tabsTitlesNodeList).filter((item) => {
                return item.closest('[data-tabs]') === tabsBlock
            })

            tabsContent.forEach((tabsContentItem, index) => {
                if (tabsTitles[index]) {
                    tabsTitles[index].setAttribute('data-tabs-title', '')
                    tabsContentItem.setAttribute('data-tabs-item', '')

                    if (tabsActiveHashBlock && index === Number.parseInt(tabsActiveHash[1])) {
                        tabsTitles[index].classList.add('_tab-active')
                    }
                    tabsContentItem.hidden = !tabsTitles[index].classList.contains('_tab-active')
                }
            })
        }
    }

    function setTabsStatus(tabsBlock: HTMLElement): void {
        const tabsTitles = Array.from(tabsBlock.querySelectorAll<HTMLElement>('[data-tabs-title]'))
        const tabsContent = Array.from(tabsBlock.querySelectorAll<HTMLElement>('[data-tabs-item]'))
        const tabsBlockIndex = tabsBlock.dataset.tabsIndex

        function isTabsAnimate(tabsBlock: HTMLElement): number | false {
            if (tabsBlock.hasAttribute('data-tabs-animate')) {
                return tabsBlock.dataset.tabsAnimate ? Number.parseInt(tabsBlock.dataset.tabsAnimate) : 500
            }
            return false
        }

        const tabsBlockAnimate = isTabsAnimate(tabsBlock)

        if (tabsContent.length > 0) {
            const isHash = tabsBlock.hasAttribute('data-tabs-hash')

            tabsContent.forEach((tabsContentItem, index) => {
                const tabTitle = tabsTitles[index]
                if (!tabTitle) {
                    return
                }

                if (tabTitle.classList.contains('_tab-active')) {
                    if (tabsBlockAnimate) {
                        _slideDown(tabsContentItem, tabsBlockAnimate)
                    } else {
                        tabsContentItem.hidden = false
                    }
                    if (isHash && !tabsContentItem.closest('.popup')) {
                        setHash(`tab-${tabsBlockIndex}-${index}`)
                    }
                } else {
                    if (tabsBlockAnimate) {
                        _slideUp(tabsContentItem, tabsBlockAnimate)
                    } else {
                        tabsContentItem.hidden = true
                    }
                }
            })
        }
    }

    function setTabsAction(e: Event): void {
        const el = e.target as HTMLElement
        const tabTitle = el.closest('[data-tabs-title]') as HTMLElement | null

        if (tabTitle) {
            const tabsBlock = tabTitle.closest('[data-tabs]') as HTMLElement | null

            if (tabsBlock && !tabTitle.classList.contains('_tab-active') && !tabsBlock.querySelector('._slide')) {
                const tabActiveTitle = tabsBlock.querySelector<HTMLElement>('[data-tabs-title]._tab-active')

                if (tabActiveTitle) {
                    tabActiveTitle.classList.remove('_tab-active')
                }

                tabTitle.classList.add('_tab-active')
                setTabsStatus(tabsBlock)
            }
            e.preventDefault()
        }
    }
}

// Обработка медиа запросов из атрибутов
export function dataMediaQueries(array: NodeListOf<HTMLElement>, dataSetValue: string): IMediaQueryResult[] {
    // Получение объектов с медиа запросами
    const media = Array.from(array).filter((item) => {
        const dataset = item.dataset[dataSetValue]
        return dataset ? dataset.split(',')[0] : false
    })

    // Инициализация объектов с медиа запросами
    if (media.length) {
        const breakpointsArray: IBreakpoint[] = []

        media.forEach((item) => {
            const params = item.dataset[dataSetValue]

            if (!params) {
                return
            }

            const paramsArray = params.split(',')
            breakpointsArray.push({
                value: paramsArray[0],
                type: paramsArray[1] ? paramsArray[1].trim() : 'max',
                item,
            })
        })

        // Получаем уникальные брейкпоинты
        const mdQueries = uniqArray(
            breakpointsArray.map((item) => {
                return `(${item.type}-width: ${item.value}px),${item.value},${item.type}`
            })
        )

        return mdQueries.map((breakpoint): IMediaQueryResult => {
            const [query, value, type] = breakpoint.split(',')
            const matchMedia = window.matchMedia(query)
            const itemsArray = breakpointsArray
                .filter((item) => {
                    return item.value === value && item.type === type
                })
                .map((item) => {
                    return item.item
                })

            return {
                itemsArray,
                matchMedia,
            }
        })
    }

    return []
}

// Модуль работы с меню (бургер) =======================================================================================================================================================================================================================
export function menuInit(): void {
    if (document.querySelector<HTMLElement>('[data-menu-button]')) {
        document.addEventListener('click', (e: MouseEvent) => {
            const target = e.target as HTMLElement
            if (bodyLockStatus && target.closest('[data-menu-button]')) {
                bodyLockToggle()
                document.documentElement.classList.toggle('menu-open')
            }
        })
    }
}

export function menuOpen() {
    bodyLock()
    document.documentElement.classList.add('menu-open')
}

export function menuClose() {
    bodyUnlock()
    document.documentElement.classList.remove('menu-open')
}

// Модуль "показать еще" =======================================================================================================================================================================================================================
export function showMore(): void {
    window.addEventListener('load', () => {
        const showMoreBlocks = document.querySelectorAll<HTMLElement>('[data-showmore]')
        let showMoreBlocksRegular: HTMLElement[] = []
        let mdQueriesArray: IMediaQueryItem[] | undefined

        if (showMoreBlocks.length) {
            // Получение обычных объектов
            showMoreBlocksRegular = Array.from(showMoreBlocks).filter((item) => {
                return !item.dataset.showmoreMedia
            })
            // Инициализация обычных объектов
            if (showMoreBlocksRegular.length) {
                initItems(showMoreBlocksRegular, false)
            }

            document.addEventListener('click', showMoreActions)
            window.addEventListener('resize', showMoreActions)

            // Получение объектов с медиа запросами
            mdQueriesArray = dataMediaQueries(showMoreBlocks, 'showmoreMedia')
            if (mdQueriesArray && mdQueriesArray.length) {
                mdQueriesArray.forEach((mdQueriesItem) => {
                    // Событие
                    mdQueriesItem.matchMedia.addEventListener('change', () => {
                        initItems(mdQueriesItem.itemsArray, mdQueriesItem.matchMedia)
                    })
                })
                initItemsMedia(mdQueriesArray)
            }
        }

        function initItemsMedia(mdQueriesArray: IMediaQueryItem[]): void {
            mdQueriesArray.forEach((mdQueriesItem) => {
                initItems(mdQueriesItem.itemsArray, mdQueriesItem.matchMedia)
            })
        }

        function initItems(showMoreBlocks: HTMLElement[], matchMedia: MediaQueryList | false): void {
            showMoreBlocks.forEach((showMoreBlock) => {
                initItem(showMoreBlock, matchMedia)
            })
        }

        function initItem(showMoreBlock: HTMLElement, matchMedia: MediaQueryList | false = false): void {
            showMoreBlock =
                matchMedia && 'item' in showMoreBlock ? (showMoreBlock as unknown as IBreakpoint).item : showMoreBlock
            if ((matchMedia as MediaQueryList)?.matches || !matchMedia) {
                const showMoreContent = showMoreBlock.querySelector<HTMLElement>('[data-showmore-content]')
                const showMoreButton = showMoreBlock.querySelector<HTMLElement>('[data-showmore-button]')

                if (!showMoreContent || !showMoreButton) {
                    return
                }

                const hiddenHeight = getHeight(showMoreBlock, showMoreContent)
                if (hiddenHeight < getOriginalHeight(showMoreContent)) {
                    _slideUp(showMoreContent, 0, hiddenHeight)
                    showMoreButton.hidden = false
                } else {
                    _slideDown(showMoreContent, 0, hiddenHeight)
                    showMoreButton.hidden = true
                }
            }
        }

        function getHeight(showMoreBlock: HTMLElement, showMoreContent: HTMLElement) {
            let hiddenHeight = 0
            const showMoreType = showMoreBlock.dataset.showmore ? showMoreBlock.dataset.showmore : 'size'
            if (showMoreType === 'items') {
                const showMoreTypeValue = showMoreContent.dataset.showmoreContent
                    ? showMoreContent.dataset.showmoreContent
                    : 3
                const showMoreItems = showMoreContent.children
                for (
                    let index = 0;
                    index < Number.parseInt(showMoreTypeValue as string) && index < showMoreItems.length;
                    index++
                ) {
                    const showMoreItem = showMoreItems[index]
                    hiddenHeight += (showMoreItem as HTMLElement).offsetHeight
                }
            } else {
                const showMoreTypeValue = showMoreContent.dataset.showmoreContent
                    ? showMoreContent.dataset.showmoreContent
                    : 150
                hiddenHeight = Number.parseInt(showMoreTypeValue as string)
            }
            return hiddenHeight
        }

        function getOriginalHeight(showMoreContent: HTMLElement) {
            let parentHidden: HTMLElement | null = null
            const hiddenHeight = showMoreContent.offsetHeight
            showMoreContent.style.removeProperty('height')
            if (showMoreContent.closest(`[hidden]`)) {
                parentHidden = showMoreContent.closest(`[hidden]`) as HTMLElement
                parentHidden.hidden = false
            }
            const originalHeight = showMoreContent.offsetHeight
            if (parentHidden) {
                parentHidden.hidden = true
            }
            showMoreContent.style.height = `${hiddenHeight}px`
            return originalHeight
        }

        function showMoreActions(e: Event): void {
            const targetEvent = e.target as HTMLElement
            const targetType = e.type

            if (targetType === 'click') {
                if (targetEvent.closest('[data-showmore-button]')) {
                    const showMoreButton = targetEvent.closest('[data-showmore-button]') as HTMLElement
                    const showMoreBlock = showMoreButton.closest('[data-showmore]') as HTMLElement
                    const showMoreContent = showMoreBlock.querySelector<HTMLElement>('[data-showmore-content]')

                    if (!showMoreContent) {
                        return
                    }

                    const showMoreSpeed = showMoreBlock.dataset.showmoreButton
                        ? Number.parseInt(showMoreBlock.dataset.showmoreButton as string)
                        : 500
                    const hiddenHeight = getHeight(showMoreBlock, showMoreContent)

                    if (!showMoreContent.classList.contains('_slide')) {
                        showMoreBlock.classList.contains('_showmore-active')
                            ? _slideUp(showMoreContent, showMoreSpeed, hiddenHeight)
                            : _slideDown(showMoreContent, showMoreSpeed, hiddenHeight)
                        showMoreBlock.classList.toggle('_showmore-active')
                    }
                }
            } else if (targetType === 'resize') {
                if (showMoreBlocksRegular.length) {
                    initItems(showMoreBlocksRegular, false)
                }
                if (mdQueriesArray && mdQueriesArray.length) {
                    initItemsMedia(mdQueriesArray)
                }
            }
        }
    })
}

// ================================================================================================================================================================================================================================================================================================================
// Прочие полезные функции ================================================================================================================================================================================================================================================================================================================
// ================================================================================================================================================================================================================================================================================================================
// FLS (Full Logging System)
export function FLS(message: string): void {
    setTimeout(() => {
        if (window.FLS) {
            // eslint-disable-next-line no-console
            console.log(message)
        }
    }, 0)
}

// Получить цифры из строки
export function getDigFromString(item: string): number {
    return Number.parseInt(item.replace(/\D/g, ''))
}

// Форматирование цифр типа 100 000 000
export function getDigFormat(item: number | string): string {
    return item.toString().replace(/(\d)(?=(?:\d\d\d)+(?:\D|$))/g, '$1 ')
}

// Убрать класс из всех элементов массива
export function removeClasses(array: HTMLElement[], className: string): void {
    for (let i = 0; i < array.length; i++) {
        array[i].classList.remove(className)
    }
}

// Уникализация массива
export function uniqArray<T>(array: T[]): T[] {
    return array.filter((item, index, self) => {
        return self.indexOf(item) === index
    })
}

// Функция получения индекса внутри родителя
export function indexInParent(parent: Element, element: Element): number {
    const array = Array.prototype.slice.call(parent.children)
    return Array.prototype.indexOf.call(array, element)
}

// Функция проверяет, скрыт ли объект
export function isHidden(el: HTMLElement): boolean {
    return el.offsetParent === null
}

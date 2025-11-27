import type { IStickyConfig, IStickyItemValues } from '../../types'
import { getHash, menuClose } from '../functions.ts'
import { flsModules } from '../modules.ts'
import { gotoBlock } from './gotoblock.ts'

let addWindowScrollEvent = false

export function pageNavigation() {
    // data-goto - указать ID блока
    // data-goto-header - учитывать header
    // data-goto-top - недокрутить на указанный размер
    // data-goto-speed - скорость (только если используется доп плагин)
    // Работаем при клике на пункт
    document.addEventListener('click', pageNavigationAction)
    // Если подключен scrollWatcher, подсвечиваем текущий пукт меню
    document.addEventListener('watcherCallback', pageNavigationAction)

    // Основная функция
    function pageNavigationAction(e: Event) {
        if (e.type === 'click') {
            const targetElement = e.target as HTMLElement
            if (targetElement.closest('[data-goto]')) {
                const gotoLink = targetElement.closest('[data-goto]') as HTMLElement
                const gotoLinkSelector = gotoLink.dataset.goto ? gotoLink.dataset.goto : ''
                const noHeader = gotoLink.hasAttribute('data-goto-header')
                const gotoSpeed = gotoLink.dataset.gotoSpeed ? Number(gotoLink.dataset.gotoSpeed) : 500
                const offsetTop = gotoLink.dataset.gotoTop ? Number.parseInt(gotoLink.dataset.gotoTop) : 0
                if (flsModules.fullpage) {
                    const fullpageSection = document
                        .querySelector(`${gotoLinkSelector}`)
                        ?.closest('[data-fp-section]') as HTMLElement | null
                    const fullpageSectionId =
                        fullpageSection && 'dataset' in fullpageSection && fullpageSection.dataset.fpId
                            ? +fullpageSection.dataset.fpId
                            : null
                    if (fullpageSectionId !== null) {
                        flsModules.fullpage.switchingSection(fullpageSectionId)
                        if (document.documentElement.classList.contains('menu-open')) {
                            menuClose()
                        }
                    }
                } else {
                    gotoBlock(gotoLinkSelector, noHeader, gotoSpeed, offsetTop)
                }
                e.preventDefault()
            }
        } else if (e.type === 'watcherCallback' && 'detail' in e) {
            const entry = (e as CustomEvent).detail.entry
            const targetElement = entry.target as HTMLElement
            // Обработка пунктов навигации, если указано значение navigator подсвечиваем текущий пукт меню
            if (targetElement.dataset.watch === 'navigator') {
                let navigatorCurrentItem: HTMLElement | null = null
                if (targetElement.id && document.querySelector(`[data-goto="#${targetElement.id}"]`)) {
                    navigatorCurrentItem = document.querySelector(`[data-goto="#${targetElement.id}"]`) as HTMLElement
                } else if (targetElement.classList.length) {
                    for (let index = 0; index < targetElement.classList.length; index++) {
                        const element = targetElement.classList[index]
                        if (document.querySelector(`[data-goto=".${element}"]`)) {
                            navigatorCurrentItem = document.querySelector(`[data-goto=".${element}"]`) as HTMLElement
                            break
                        }
                    }
                }
                if (entry.isIntersecting) {
                    // Видим объект
                    if (navigatorCurrentItem) {
                        navigatorCurrentItem.classList.add('_navigator-active')
                    }
                } else {
                    // Не видим объект
                    if (navigatorCurrentItem) {
                        navigatorCurrentItem.classList.remove('_navigator-active')
                    }
                }
            }
        }
    }

    // Прокрутка по хешу
    if (getHash()) {
        let goToHash: string | null = null
        if (document.querySelector(`#${getHash()}`)) {
            goToHash = `#${getHash()}`
        } else if (document.querySelector(`.${getHash()}`)) {
            goToHash = `.${getHash()}`
        }
        if (goToHash) {
            gotoBlock(goToHash, true, 500, 20)
        }
    }
}

// Работа с шапкой при скроле
export function headerScroll() {
    addWindowScrollEvent = true
    const header = document.querySelector('header.header') as HTMLElement
    if (!header) {
        return
    }

    const headerShow = header.hasAttribute('data-scroll-show')
    const headerShowTimer = header.dataset.scrollShow ? Number(header.dataset.scrollShow) : 500
    const startPoint = header.dataset.scroll ? Number(header.dataset.scroll) : 1
    let scrollDirection = 0
    let timer: number

    document.addEventListener('windowScroll', () => {
        const scrollTop = window.scrollY
        clearTimeout(timer)

        if (scrollTop >= startPoint) {
            if (!header.classList.contains('_header-scroll')) {
                header.classList.add('_header-scroll')
            }

            if (headerShow) {
                if (scrollTop > scrollDirection) {
                    // downscroll code
                    if (header.classList.contains('_header-show')) {
                        header.classList.remove('_header-show')
                    }
                } else {
                    // upscroll code
                    if (!header.classList.contains('_header-show')) {
                        header.classList.add('_header-show')
                    }
                }

                timer = window.setTimeout(() => {
                    if (!header.classList.contains('_header-show')) {
                        header.classList.add('_header-show')
                    }
                }, headerShowTimer)
            }
        } else {
            if (header.classList.contains('_header-scroll')) {
                header.classList.remove('_header-scroll')
            }

            if (headerShow) {
                if (header.classList.contains('_header-show')) {
                    header.classList.remove('_header-show')
                }
            }
        }
        scrollDirection = scrollTop <= 0 ? 0 : scrollTop
    })
}

export function digitsCounter() {
    const counters = document.querySelectorAll('[data-digits-counter]')
    if (counters.length) {
        counters.forEach((element) => {
            const el = element as HTMLElement
            el.dataset.digitsCounter = el.innerHTML
            el.innerHTML = '0'
        })
    }

    function digitsCountersInit(digitsCountersItems?: NodeListOf<Element>) {
        const digitsCounters = digitsCountersItems || document.querySelectorAll('[data-digits-counter]')
        if (digitsCounters.length) {
            digitsCounters.forEach((digitsCounter) => {
                digitsCountersAnimate(digitsCounter as HTMLElement)
            })
        }
    }

    function digitsCountersAnimate(digitsCounter: HTMLElement) {
        let startTimestamp: number | null = null
        const duration = Number.parseInt(digitsCounter.dataset.digitsCounterSpeed || '1000')
        const startValue = Number.parseInt(digitsCounter.dataset.digitsCounter || '0')
        const startPosition = 0
        const step = (timestamp: number) => {
            if (!startTimestamp) {
                startTimestamp = timestamp
            }
            const progress = Math.min((timestamp - startTimestamp) / duration, 1)
            digitsCounter.innerHTML = Math.floor(progress * (startPosition + startValue)).toString()
            if (progress < 1) {
                window.requestAnimationFrame(step)
            }
        }
        window.requestAnimationFrame(step)
    }

    function digitsCounterAction(e: CustomEvent) {
        const entry = e.detail.entry
        const targetElement = entry.target as HTMLElement
        if (targetElement.querySelectorAll('[data-digits-counter]').length) {
            digitsCountersInit(targetElement.querySelectorAll('[data-digits-counter]'))
        }
    }

    document.addEventListener('watcherCallback', digitsCounterAction as EventListener)
}

// Прилипающий блок
export function stickyBlock() {
    addWindowScrollEvent = true
    // data-sticky для родителя внутри которого прилипает блок *
    // data-sticky-header для родителя, учитываем высоту хедера
    // data-sticky-top="" для родителя, можно указать отступ сверху
    // data-sticky-bottom="" для родителя, можно указать отступ снизу
    // data-sticky-item для прилипающего блока *

    function stickyBlockInit() {
        const stickyParents = document.querySelectorAll('[data-sticky]')
        if (stickyParents.length) {
            stickyParents.forEach((stickyParent) => {
                const parent = stickyParent as HTMLElement
                const headerEl = document.querySelector('header.header') as HTMLElement
                const stickyConfig: IStickyConfig = {
                    media: parent.dataset.sticky ? Number.parseInt(parent.dataset.sticky) : null,
                    top: parent.dataset.stickyTop ? Number.parseInt(parent.dataset.stickyTop) : 0,
                    bottom: parent.dataset.stickyBottom ? Number.parseInt(parent.dataset.stickyBottom) : 0,
                    header: parent.hasAttribute('data-sticky-header') && headerEl ? headerEl.offsetHeight : 0,
                }
                stickyBlockItem(parent, stickyConfig)
            })
        }
    }

    function stickyBlockItem(stickyParent: HTMLElement, stickyConfig: IStickyConfig) {
        const stickyBlockItem = stickyParent.querySelector('[data-sticky-item]') as HTMLElement
        const headerHeight = stickyConfig.header
        const offsetTop = headerHeight + stickyConfig.top
        const startPoint = stickyBlockItem.getBoundingClientRect().top + scrollY - offsetTop

        document.addEventListener('windowScroll', stickyBlockActions)
        window.addEventListener('resize', stickyBlockActions)

        function stickyBlockActions() {
            const endPoint =
                stickyParent.offsetHeight +
                stickyParent.getBoundingClientRect().top +
                scrollY -
                (offsetTop + stickyBlockItem.offsetHeight + stickyConfig.bottom)
            const stickyItemValues = {
                position: 'relative',
                bottom: 'auto',
                top: '0px',
                left: '0px',
                width: 'auto',
            }
            if (!stickyConfig.media || stickyConfig.media < window.innerWidth) {
                if (offsetTop + stickyConfig.bottom + stickyBlockItem.offsetHeight < window.innerHeight) {
                    if (scrollY >= startPoint && scrollY <= endPoint) {
                        stickyItemValues.position = 'fixed'
                        stickyItemValues.bottom = 'auto'
                        stickyItemValues.top = `${offsetTop}px`
                        stickyItemValues.left = `${stickyBlockItem.getBoundingClientRect().left}px`
                        stickyItemValues.width = `${stickyBlockItem.offsetWidth}px`
                    } else if (scrollY >= endPoint) {
                        stickyItemValues.position = 'absolute'
                        stickyItemValues.bottom = `${stickyConfig.bottom}px`
                        stickyItemValues.top = 'auto'
                        stickyItemValues.left = '0px'
                        stickyItemValues.width = `${stickyBlockItem.offsetWidth}px`
                    }
                }
            }
            stickyBlockType(stickyBlockItem, stickyItemValues)
        }
    }

    function stickyBlockType(stickyBlockItem: HTMLElement, stickyItemValues: IStickyItemValues) {
        stickyBlockItem.style.cssText = `position:${stickyItemValues.position};bottom:${stickyItemValues.bottom};top:${stickyItemValues.top};left:${stickyItemValues.left};width:${stickyItemValues.width};`
    }

    stickyBlockInit()
}

// При подключении модуля обработчик события запустится автоматически
setTimeout(() => {
    if (addWindowScrollEvent) {
        const windowScroll = new Event('windowScroll')
        window.addEventListener('scroll', () => {
            document.dispatchEvent(windowScroll)
        })
    }
}, 0)

// Направление скрола
export function scrollDirection() {
    const body = document.body
    const scrollUp = 'scroll-up'
    const scrollDown = 'scroll-down'
    let lastScroll = 0
    window.addEventListener('scroll', () => {
        const currentScroll = window.scrollY
        if (currentScroll <= 0) {
            body.classList.remove(scrollUp)
            return
        }
        if (currentScroll > lastScroll && !body.classList.contains(scrollDown)) {
            body.classList.remove(scrollUp)
            body.classList.add(scrollDown)
        } else if (currentScroll < lastScroll && body.classList.contains(scrollDown)) {
            body.classList.remove(scrollDown)
            body.classList.add(scrollUp)
        }
        lastScroll = currentScroll
    })
}

import type { ISmoothScrollOptions } from '../../types'
import { FLS, menuClose } from '../functions.ts'

declare class SmoothScroll {
    constructor()

    animateScroll: (target: HTMLElement, hash: string, options: ISmoothScrollOptions) => void
}

export function gotoBlock(targetBlock: string, noHeader: boolean = false, speed: number = 500, offsetTop: number = 0) {
    const targetBlockElement = document.querySelector<HTMLElement>(targetBlock)
    if (targetBlockElement) {
        let headerItem = ''
        let headerItemHeight = 0
        if (noHeader) {
            headerItem = 'header.header'
            const headerElement = document.querySelector<HTMLElement>(headerItem)
            if (headerElement) {
                if (!headerElement.classList.contains('_header-scroll')) {
                    headerElement.style.cssText = `transition-duration: 0s;`
                    headerElement.classList.add('_header-scroll')
                    headerItemHeight = headerElement.offsetHeight
                    headerElement.classList.remove('_header-scroll')
                    setTimeout(() => {
                        headerElement.style.cssText = ``
                    }, 0)
                } else {
                    headerItemHeight = headerElement.offsetHeight
                }
            }
        }
        const options: ISmoothScrollOptions = {
            speedAsDuration: true,
            speed,
            header: headerItem,
            offset: offsetTop,
            easing: 'easeOutQuad',
        }

        if (document.documentElement.classList.contains('menu-open')) {
            menuClose()
        }

        if (typeof SmoothScroll !== 'undefined') {
            new SmoothScroll().animateScroll(targetBlockElement, '', options)
        } else {
            let targetBlockElementPosition = targetBlockElement.getBoundingClientRect().top + scrollY
            targetBlockElementPosition = headerItemHeight
                ? targetBlockElementPosition - headerItemHeight
                : targetBlockElementPosition
            targetBlockElementPosition = offsetTop ? targetBlockElementPosition - offsetTop : targetBlockElementPosition
            window.scrollTo({
                top: targetBlockElementPosition,
                behavior: 'smooth',
            })
        }
        FLS(`[gotoBlock]: Юхуу...едем до ${targetBlock}`)
    } else {
        FLS(`[gotoBlock]: Ой... Такого блока нет на странице: ${targetBlock}`)
    }
}

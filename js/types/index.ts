import type { LightGallery } from 'lightgallery/lightgallery'

export interface IMobile {
    Android: () => RegExpMatchArray | null
    BlackBerry: () => RegExpMatchArray | null
    iOS: () => RegExpMatchArray | null
    Opera: () => RegExpMatchArray | null
    Windows: () => RegExpMatchArray | null
    any: () => boolean
}

export interface IMediaQueryItem {
    itemsArray: HTMLElement[]
    matchMedia: MediaQueryList
}

export interface IBreakpoint {
    value: string
    type: string
    item: HTMLElement
}

export interface IMediaQueryResult {
    itemsArray: HTMLElement[]
    matchMedia: MediaQueryList
}

export interface ISmoothScrollOptions {
    speedAsDuration: boolean
    speed: number
    header: string
    offset: number
    easing: string
}

export interface IGalleryItem {
    gallery: HTMLElement
    galleryClass: LightGallery
}

export interface IWatcherConfig {
    logging: boolean
}

export interface IWatcherParams {
    root: string | null
    margin: string
    threshold: string | string[]
}

export interface IWatcherElement extends HTMLElement {
    dataset: {
        watchRoot?: string
        watchMargin?: string
        watchThreshold?: string
        watch?: string
    }
}

export interface IStickyConfig {
    media: number | null
    top: number
    bottom: number
    header: number
}

export interface IStickyItemValues {
    position: string
    bottom: string
    top: string
    left: string
    width: string
}

export interface IMousePRLXConfig {
    init: boolean
    logging: boolean
}

export interface IParallaxMouseElement extends HTMLElement {
    dataset: {
        prlxCx?: string
        prlxCy?: string
        prlxA?: string
    }
}

// Расширяем глобальный интерфейс Window
declare global {
    interface Window {
        FLS: boolean | undefined
    }
}

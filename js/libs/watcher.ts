import type { IWatcherConfig, IWatcherElement, IWatcherParams } from '../types'
import { FLS, uniqArray } from '../files/functions'
import { flsModules } from '../files/modules'

// Наблюдатель объектов [всевидящее око]
// data-watch - можно писать значение для применения кастомного кода
// data-watch-root - родитель внутри которого наблюдать за объектом
// data-watch-margin - отступ
// data-watch-threshold - процент показа объекта для срабатывания
// data-watch-once - наблюдать только один раз
// _watcher-view - класс который добавляется при появлении объекта

class ScrollWatcher {
    private config: IWatcherConfig
    private observer: IntersectionObserver | null

    constructor(props: Partial<IWatcherConfig>) {
        const defaultConfig = {
            logging: false,
        }
        this.config = Object.assign(defaultConfig, props)
        this.observer = null

        if (!document.documentElement.classList.contains('watcher')) {
            this.scrollWatcherRun()
        }
    }

    // Обновляем конструктор
    scrollWatcherUpdate(): void {
        this.scrollWatcherRun()
    }

    // Запускаем конструктор
    scrollWatcherRun(): void {
        document.documentElement.classList.add('watcher')
        this.scrollWatcherConstructor(document.querySelectorAll('[data-watch]') as NodeListOf<IWatcherElement>)
    }

    // Конструктор наблюдателей
    scrollWatcherConstructor(items: NodeListOf<IWatcherElement>): void {
        if (items.length) {
            this.scrollWatcherLogging(`Проснулся, слежу за объектами (${items.length})...`)
            // Уникализируем параметры
            const uniqParams = uniqArray(
                Array.from(items).map((item) => {
                    return `${
                        item.dataset.watchRoot ? item.dataset.watchRoot : null
                    }|${item.dataset.watchMargin ? item.dataset.watchMargin : '0px'}|${item.dataset.watchThreshold ? item.dataset.watchThreshold : 0}`
                })
            )
            // Получаем группы объектов с одинаковыми параметрами,
            // создаем настройки, инициализируем наблюдатель
            uniqParams.forEach((uniqParam) => {
                const uniqParamArray = uniqParam.split('|')
                const paramsWatch: IWatcherParams = {
                    root: uniqParamArray[0],
                    margin: uniqParamArray[1],
                    threshold: uniqParamArray[2],
                }
                const groupItems = Array.from(items).filter((item) => {
                    const watchRoot = item.dataset.watchRoot ? item.dataset.watchRoot : null
                    const watchMargin = item.dataset.watchMargin ? item.dataset.watchMargin : '0px'
                    const watchThreshold = item.dataset.watchThreshold ? item.dataset.watchThreshold : '0'
                    if (
                        String(watchRoot) === paramsWatch.root &&
                        String(watchMargin) === paramsWatch.margin &&
                        String(watchThreshold) === paramsWatch.threshold
                    ) {
                        return item
                    }
                    return false
                })

                const configWatcher = this.getScrollWatcherConfig(paramsWatch)
                if (configWatcher) {
                    // Инициализация наблюдателя со своими настройками
                    this.scrollWatcherInit(groupItems, configWatcher)
                }
            })
        } else {
            this.scrollWatcherLogging('Сплю, нет объектов для слежения. ZzzZZzz')
        }
    }

    // Функция создания настроек
    getScrollWatcherConfig(paramsWatch: IWatcherParams): IntersectionObserverInit | null {
        // Создаем настройки
        const configWatcher: IntersectionObserverInit = {}
        // Родитель, внутри которого ведется наблюдение
        if (paramsWatch.root && document.querySelector(paramsWatch.root)) {
            configWatcher.root = document.querySelector(paramsWatch.root)
        } else if (paramsWatch.root !== 'null') {
            this.scrollWatcherLogging(`Эмм... родительского объекта ${paramsWatch.root} нет на странице`)
            return null
        }
        // Отступ срабатывания
        configWatcher.rootMargin = paramsWatch.margin
        if (!paramsWatch.margin.includes('px') && !paramsWatch.margin.includes('%')) {
            this.scrollWatcherLogging(`Ой ой, настройку data-watch-margin нужно задавать в PX или %`)
            return null
        }
        // Точки срабатывания
        if (paramsWatch.threshold === 'prx') {
            // Режим параллакса
            const threshold: number[] = []
            for (let i = 0; i <= 1.0; i += 0.005) {
                threshold.push(i)
            }
            configWatcher.threshold = threshold
        } else {
            configWatcher.threshold = Array.isArray(paramsWatch.threshold)
                ? paramsWatch.threshold.map(Number)
                : paramsWatch.threshold.split(',').map(Number)
        }

        return configWatcher
    }

    // Функция создания нового наблюдателя со своими настройками
    scrollWatcherCreate(configWatcher: IntersectionObserverInit): void {
        this.observer = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                this.scrollWatcherCallback(entry, observer)
            })
        }, configWatcher)
    }

    // Функция инициализации наблюдателя со своими настройками
    scrollWatcherInit(items: IWatcherElement[], configWatcher: IntersectionObserverInit): void {
        // Создание нового наблюдателя со своими настройками
        this.scrollWatcherCreate(configWatcher)
        // Передача наблюдателю элементов
        if (this.observer) {
            items.forEach((item) => {
                this.observer?.observe(item)
            })
        }
    }

    // Функция обработки базовых действий точек срабатывания
    scrollWatcherIntersecting(entry: IntersectionObserverEntry, targetElement: IWatcherElement): void {
        if (entry.isIntersecting) {
            // Видим объект
            // добавляем класс
            if (!targetElement.classList.contains('_watcher-view')) {
                targetElement.classList.add('_watcher-view')
            }
            this.scrollWatcherLogging(`Я вижу ${targetElement.classList}, добавил класс _watcher-view`)
        } else {
            // Не видим объект
            // убираем класс
            if (targetElement.classList.contains('_watcher-view')) {
                targetElement.classList.remove('_watcher-view')
            }
            this.scrollWatcherLogging(`Я не вижу ${targetElement.classList}, убрал класс _watcher-view`)
        }
    }

    // Функция отключения слежения за объектом
    scrollWatcherOff(targetElement: IWatcherElement, observer: IntersectionObserver): void {
        observer.unobserve(targetElement)
    }

    // Функция вывода в консоль
    scrollWatcherLogging(message: string): void {
        if (this.config.logging) {
            FLS(`[Наблюдатель]: ${message}`)
        }
    }

    // Функция обработки наблюдения
    scrollWatcherCallback(entry: IntersectionObserverEntry, observer: IntersectionObserver): void {
        const targetElement = entry.target as IWatcherElement
        // Обработка базовых действий точек срабатывания
        this.scrollWatcherIntersecting(entry, targetElement)
        // Если есть атрибут data-watch-once убираем слежку
        if (targetElement.hasAttribute('data-watch-once') && entry.isIntersecting) {
            this.scrollWatcherOff(targetElement, observer)
        }
        // Создаем свое событие обратной связи
        document.dispatchEvent(
            new CustomEvent('watcherCallback', {
                detail: {
                    entry,
                },
            })
        )
    }
}

// Запускаем и добавляем в объект модулей
flsModules.watcher = new ScrollWatcher({})

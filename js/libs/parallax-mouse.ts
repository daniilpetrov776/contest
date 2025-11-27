import type { IMousePRLXConfig, IParallaxMouseElement } from '../types'
import { FLS } from '../files/functions'
import { flsModules } from '../files/modules'

class MousePRLX {
    private config: IMousePRLXConfig

    constructor(props: Partial<IMousePRLXConfig>) {
        const defaultConfig: IMousePRLXConfig = {
            init: true,
            logging: false,
        }
        this.config = Object.assign(defaultConfig, props)
        if (this.config.init) {
            const parallaxMouse: NodeListOf<IParallaxMouseElement> = document.querySelectorAll('[data-prlx-mouse]')
            if (parallaxMouse.length) {
                this.parallaxMouseInit(parallaxMouse)
                this.setLogging(`Проснулся, слежу за объектами: (${parallaxMouse.length})`)
            } else {
                this.setLogging('Нет ни одного объекта. Сплю...zzZZZzZZz...')
            }
        }
    }

    private parallaxMouseInit(parallaxMouse: NodeListOf<IParallaxMouseElement>): void {
        parallaxMouse.forEach((el: IParallaxMouseElement) => {
            const parallaxMouseWrapper: Element | null = el.closest('[data-prlx-mouse-wrapper]')

            // Коэффициент X
            const paramCoefficientX: number = el.dataset.prlxCx ? +el.dataset.prlxCx : 100
            // Коэффициент. У
            const paramCoefficientY: number = el.dataset.prlxCy ? +el.dataset.prlxCy : 100
            // Направление Х
            const directionX: number = el.hasAttribute('data-prlx-dxr') ? -1 : 1
            // Направление У
            const directionY: number = el.hasAttribute('data-prlx-dyr') ? -1 : 1
            // Скорость анимации
            const paramAnimation: number = el.dataset.prlxA ? +el.dataset.prlxA : 50

            // Объявление переменных
            let positionX: number = 0
            let positionY: number = 0
            let coordinatesXPercent: number = 0
            let coordinatesYPercent: number = 0

            setMouseParallaxStyle()

            // Проверяем наличие родителя, в котором будет считываться положение мыши
            if (parallaxMouseWrapper) {
                mouseMoveParallax(parallaxMouseWrapper)
            } else {
                mouseMoveParallax()
            }

            function setMouseParallaxStyle(): void {
                const distX: number = coordinatesXPercent - positionX
                const distY: number = coordinatesYPercent - positionY
                positionX = positionX + (distX * paramAnimation) / 1000
                positionY = positionY + (distY * paramAnimation) / 1000
                el.style.cssText = `transform: translate3D(${(directionX * positionX) / (paramCoefficientX / 10)}%,${(directionY * positionY) / (paramCoefficientY / 10)}%,0);`
                requestAnimationFrame(setMouseParallaxStyle)
            }

            function mouseMoveParallax(wrapper: Element | Window = window): void {
                wrapper.addEventListener('mousemove', (e: Event) => {
                    const mouseEvent = e as MouseEvent
                    const offsetTop: number = el.getBoundingClientRect().top + window.scrollY
                    if (offsetTop >= window.scrollY || offsetTop + el.offsetHeight >= window.scrollY) {
                        // Получение ширины и высоты блока
                        const parallaxWidth: number = window.innerWidth
                        const parallaxHeight: number = window.innerHeight
                        // Ноль посередине
                        const coordinatesX: number = mouseEvent.clientX - parallaxWidth / 2
                        const coordinatesY: number = mouseEvent.clientY - parallaxHeight / 2
                        // Получаем проценты
                        coordinatesXPercent = (coordinatesX / parallaxWidth) * 100
                        coordinatesYPercent = (coordinatesY / parallaxHeight) * 100
                    }
                })
            }
        })
    }

    // Логирование в консоль
    private setLogging(message: string): void {
        if (this.config.logging) {
            FLS(`[Parallax Mouse]: ${message}`)
        }
    }
}

flsModules.mousePrlx = new MousePRLX({})

export { MousePRLX }

import Swiper from 'swiper'
import { Navigation } from 'swiper/modules'
import 'swiper/css'

function initSliders() {
    if (document.querySelector<HTMLElement>('.swiper')) {
        new Swiper('.swiper', {
            modules: [Navigation],
            observer: true,
            observeParents: true,
            slidesPerView: 1,
            spaceBetween: 0,
            autoHeight: false,
            speed: 800,

            navigation: {
                prevEl: '.swiper-button-prev',
                nextEl: '.swiper-button-next',
            },
            on: {},
        })
    }
}

window.addEventListener('DOMContentLoaded', () => {
    initSliders()
})

/* eslint-disable perfectionist/sort-imports */
/* eslint-disable unused-imports/no-unused-imports */
import 'virtual:svg-icons-register'
import * as flsFunctions from './files/functions'
import * as flsForms from './files/forms/forms'
import * as flsScroll from './files/scroll/scroll'
// import './libs/parallax-mouse'
// import './libs/popup'
import './libs/burger'
import './libs/header-animation'
import './libs/hero-header-animation'
import './libs/hero-after-animation'
import './libs/hero-video'
import './libs/children-animation'
import './libs/element-animation'
// import './libs/portfolio-sliders'
// import './libs/banner-slider'
// import './libs/banner-animation'
// import './libs/footer-title-animation'
import './libs/portfolio-sliders'
import './libs/banner-slider'
import './libs/banner-animation'
import './libs/footer-title-animation'
// import './files/forms/datepicker'
// import './files/forms/inputmask'
// import './files/forms/range'
// import './files/sliders'
// import './files/scroll/smooth-scrollbar'
// import './libs/watcher'
// import './files/gallery'
// import './libs/dynamic-adapt'
// import './files/select'
// import './files/map'
// import './files/tippy'
import './files/script'
import '../scss/style.scss'

// // Ленивая загрузка некритичных модулей для оптимизации критического пути
// // Загружаем модули только когда соответствующие элементы появляются в viewport
// function loadModulesOnIntersection() {
//     // Загрузка portfolio-sliders при появлении portfolio секции
//     const portfolioObserver = new IntersectionObserver(
//         (entries) => {
//             entries.forEach((entry) => {
//                 if (entry.isIntersecting) {
//                     import('./libs/portfolio-sliders').catch(() => {})
//                     portfolioObserver.disconnect()
//                 }
//             })
//         },
//         { rootMargin: '200px' }
//     )
//     const portfolioSection = document.querySelector('.portfolio')
//     if (portfolioSection) {
//         portfolioObserver.observe(portfolioSection)
//     }

//     // Загрузка banner-slider и banner-animation при появлении banner секции
//     const bannerObserver = new IntersectionObserver(
//         (entries) => {
//             entries.forEach((entry) => {
//                 if (entry.isIntersecting) {
//                     Promise.all([
//                         import('./libs/banner-slider').catch(() => {}),
//                         import('./libs/banner-animation').catch(() => {}),
//                     ]).catch(() => {})
//                     bannerObserver.disconnect()
//                 }
//             })
//         },
//         { rootMargin: '200px' }
//     )
//     const bannerSection = document.querySelector('.banner')
//     if (bannerSection) {
//         bannerObserver.observe(bannerSection)
//     }

//     // Загрузка footer-title-animation при появлении footer секции
//     const footerObserver = new IntersectionObserver(
//         (entries) => {
//             entries.forEach((entry) => {
//                 if (entry.isIntersecting) {
//                     import('./libs/footer-title-animation').catch(() => {})
//                     footerObserver.disconnect()
//                 }
//             })
//         },
//         { rootMargin: '200px' }
//     )
//     const footerSection = document.querySelector('.footer')
//     if (footerSection) {
//         footerObserver.observe(footerSection)
//     }
// }

// if (document.readyState === 'loading') {
//     document.addEventListener('DOMContentLoaded', loadModulesOnIntersection)
// } else {
//     loadModulesOnIntersection()
// }

// flsFunctions.addTouchClass()
// flsFunctions.addLoadedClass()
// flsFunctions.menuInit()
// flsFunctions.fullVHfix()
// flsFunctions.spoilers()
// flsFunctions.tabs()
// flsFunctions.showMore()

// flsForms.formQuantity()
// flsForms.formRating()

// flsScroll.pageNavigation()
// flsScroll.headerScroll()
// flsScroll.scrollDirection()
// flsScroll.stickyBlock()
// flsScroll.digitsCounter()

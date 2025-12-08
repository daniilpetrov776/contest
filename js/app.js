import 'virtual:svg-icons-register';

import './libs/burger';
import './libs/header-animation';
import './libs/hero-header-animation';
import './libs/hero-after-animation';
import './libs/hero-video';
import './libs/children-animation';
import './libs/element-animation';

import './libs/portfolio-sliders';
import './libs/banner-slider';
import './libs/banner-animation';
import './libs/footer-title-animation';

import '../scss/style.scss';

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

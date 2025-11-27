import type { IGalleryItem } from '../types'
import lightGallery from 'lightgallery'
import { flsModules } from './modules'
import 'lightgallery/css/lightgallery.css'

// Плагины
// lgZoom, lgAutoplay, lgComment, lgFullscreen, lgHash, lgPager, lgRotate, lgShare, lgThumbnail, lgVideo, lgMediumZoom
// import lgThumbnail from 'lightgallery/plugins/thumbnail/lg-thumbnail.min.js'
// import lgZoom from 'lightgallery/plugins/zoom/lg-zoom.min.js'

// Запуск
const galleries = document.querySelectorAll<HTMLElement>('[data-gallery]')

if (galleries.length) {
    const galleyItems: IGalleryItem[] = []
    galleries.forEach((gallery) => {
        galleyItems.push({
            gallery,
            galleryClass: lightGallery(gallery, {
                // plugins: [lgZoom, lgThumbnail],
                licenseKey: '7EC452A9-0CFD441C-BD984C7C-17C8456E',
                speed: 500,
                mobileSettings: {
                    controls: true,
                    showCloseIcon: true,
                    download: false,
                },
            }),
        })
    })
    // Добавляем в объект модулей
    flsModules.gallery = galleyItems
}

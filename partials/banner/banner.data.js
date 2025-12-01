export const bannerContext = {
    slides: [
        {
            type: 'недвижимость',
            title: {
                parts: [
                    { text: 'Формируем', textClass: 'banner__title-text', sprite: { name: 'wigle-icon', width: 44, height: 31, class: 'banner__title-icon banner__title-icon--wigle' } },
                    { br: true },
                    { sprite: { name: 'heart-icon.png', width: 40, height: 40, class: 'banner__title-icon banner__title-icon--heart', alt: 'heart' }, text: 'ценность бренда', textClass: 'banner__title-text' },
                    { sprite: { name: 'buildings-icon.png', width: 44, height: 44, class: 'banner__title-icon banner__title-icon--buildings', alt: 'buildings' }, text: 'ЖК', textClass: 'banner__title-text' },
                    { br: true },
                    { sprite: { name: 'global-icon', width: 75, height: 62, class: 'banner__title-icon banner__title-icon--global' }, text: 'в digital - среде', textClass: 'banner__title-text banner__title-text--highlight' },
                ],
            },
            description:
                'Создаем digital-пространство для девелоперов и проектов ЖК, находя баланс идентичности бренда и сервисности.',
            button: {
                text: 'Подробнее',
                href: '#',
            },
            images: [
                {
                    'webp': '/images/banner/banner-building.webp',
                    'webp@2x': '/images/banner/banner-building@2x.webp',
                    'jpeg': '/images/banner/banner-building.jpg',
                    'jpeg@2x': '/images/banner/banner-building@2x.jpg',
                    'class': 'banner__image banner__image--building',
                    'alt': 'building',
                },
                {
                    'webp': '/images/banner/banner-iphone.webp',
                    'webp@2x': '/images/banner/banner-iphone@2x.webp',
                    'jpeg': '/images/banner/banner-iphone.jpg',
                    'jpeg@2x': '/images/banner/banner-iphone@2x.jpg',
                    'class': 'banner__image banner__image--iphone',
                    'alt': 'iphone',
                },
                {
                    'webp': '/images/banner/banner-number.webp',
                    'webp@2x': '/images/banner/banner-number@2x.webp',
                    'jpeg': '/images/banner/banner-number.jpg',
                    'jpeg@2x': '/images/banner/banner-number@2x.jpg',
                    'class': 'banner__image banner__image--number',
                    'alt': 'number',
                },
                {
                    'webp': '/images/banner/banner-family.webp',
                    'webp@2x': '/images/banner/banner-family@2x.webp',
                    'jpeg': '/images/banner/banner-family.jpg',
                    'jpeg@2x': '/images/banner/banner-family@2x.jpg',
                    'class': 'banner__image banner__image--family',
                    'alt': 'family',
                },
                {
                    'webp': '/images/banner/banner-laptop.webp',
                    'webp@2x': '/images/banner/banner-laptop@2x.webp',
                    'jpeg': '/images/banner/banner-laptop.jpg',
                    'jpeg@2x': '/images/banner/banner-laptop@2x.jpg',
                    'class': 'banner__image banner__image--laptop',
                    'alt': 'laptop',
                },
            ],
        },
        {
            type: 'mobile app',
            title: {
                parts: [
                    { text: 'Проектируем', textClass: 'banner__title-text' },
                    { br: true },
                    { sprite: { name: 'phone-icon', width: 56, height: 45, class: 'banner__title-icon banner__title-icon--phone' }, text: 'мобильные', textClass: 'banner__title-text' },
                    { br: true },
                    { text: 'приложения', textClass: 'banner__title-text' },
                ],
            },
            description:
                'Разрабатываем приложения для мобильных устройств, решая реальные запросы пользователей.',
            button: {
                text: 'Подробнее',
                href: '#',
            },
            images: [
                {
                    'webp': '/images/banner/banner-2-chair.webp',
                    'webp@2x': '/images/banner/banner-2-chair@2x.webp',
                    'jpeg': '/images/banner/banner-2-chair.jpg',
                    'jpeg@2x': '/images/banner/banner-2-chair@2x.jpg',
                    'class': 'banner__image banner__image--chair',
                    'alt': 'chair',
                },
                {
                    'webp': '/images/banner/banner-2-catalog.webp',
                    'webp@2x': '/images/banner/banner-2-catalog@2x.webp',
                    'jpeg': '/images/banner/banner-2-catalog.jpg',
                    'jpeg@2x': '/images/banner/banner-2-catalog@2x.jpg',
                    'class': 'banner__image banner__image--catalog',
                    'alt': 'catalog',
                },
                {
                    'webp': '/images/banner/banner-2-chair-big.webp',
                    'webp@2x': '/images/banner/banner-2-chair-big@2x.webp',
                    'jpeg': '/images/banner/banner-2-chair-big.jpg',
                    'jpeg@2x': '/images/banner/banner-2-chair-big@2x.jpg',
                    'class': 'banner__image banner__image--chair-big',
                    'alt': 'chair-big',
                },
                {
                    'webp': '/images/banner/banner-2-chair-filter.webp',
                    'webp@2x': '/images/banner/banner-2-chair-filter@2x.webp',
                    'jpeg': '/images/banner/banner-2-chair-filter.jpg',
                    'jpeg@2x': '/images/banner/banner-2-chair-filter@2x.jpg',
                    'class': 'banner__image banner__image--chair-filter',
                    'alt': 'chair-filter',
                },
                {
                    'webp': '/images/banner/banner-2-banquet.webp',
                    'webp@2x': '/images/banner/banner-2-banquet@2x.webp',
                    'jpeg': '/images/banner/banner-2-banquet.jpg',
                    'jpeg@2x': '/images/banner/banner-2-banquet@2x.jpg',
                    'class': 'banner__image banner__image--banquet',
                    'alt': 'banquet',
                },
                {
                    'webp': '/images/banner/banner-2-place-order.webp',
                    'webp@2x': '/images/banner/banner-2-place-order@2x.webp',
                    'jpeg': '/images/banner/banner-2-place-order.jpg',
                    'jpeg@2x': '/images/banner/banner-2-place-order@2x.jpg',
                    'class': 'banner__image banner__image--place-order',
                    'alt': 'place-order',
                },
            ],
        },
    ],
}
